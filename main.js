const { Actor } = require('apify');

Actor.main(async () => {
    // Get input configuration
    const input = await Actor.getInput() || {};
    const { startUrl = 'https://www.amazon.com/s?i=stripbooks&rh=n%3A283155', maxPages = 2 } = input;

    // Set up Playwright
    const browser = await Actor.launchPlaywright();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Create request queue
    const requestQueue = await Actor.openRequestQueue();
    await requestQueue.addRequest({ url: startUrl, userData: { pageNumber: 1 } });

    // Create dataset for output
    const dataset = await Actor.openDataset();

    const crawler = new Actor.PlaywrightCrawler({
        requestQueue,
        async requestHandler({ request, page }) {
            const { pageNumber } = request.userData;
            
            // Scraping logic
            await page.waitForSelector('.s-result-item');
            const products = await page.$$eval('.s-result-item', (items) => {
                return items.map(item => ({
                    name: item.querySelector('h2 a span')?.textContent.trim() || 'N/A',
                    price: `${item.querySelector('.a-price-whole')?.textContent.trim() || '0'}.${item.querySelector('.a-price-fraction')?.textContent.trim() || '00'}`,
                    rating: item.querySelector('.a-icon-alt')?.textContent.trim().split(' ')[0] || 'N/A'
                }));
            });

            // Save results
            await dataset.pushData({
                pageNumber,
                url: request.url,
                products,
                timestamp: new Date().toISOString()
            });

            // Pagination
            if (pageNumber < maxPages) {
                const nextPage = await page.$('.s-pagination-next:not(.s-pagination-disabled)');
                if (nextPage) {
                    await requestQueue.addRequest({
                        url: await nextPage.getAttribute('href'),
                        userData: { pageNumber: pageNumber + 1 }
                    });
                }
            }
        },
    });

    await crawler.run();
    await browser.close();
});