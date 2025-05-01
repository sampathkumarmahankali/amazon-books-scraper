const Apify = require('apify');

Apify.main(async () => {
    const input = await Apify.getInput() || {};
    const { startUrl, maxPages = 2 } = input;
    
    console.log('Starting with input:', input);
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({ url: startUrl, userData: { pageNumber: 1 } });

    const crawler = new Apify.PlaywrightCrawler({
        requestQueue,
        launchContext: {
            launchOptions: {
                headless: true,
            },
        },
        handlePageFunction: async ({ page, request }) => {
            const { pageNumber } = request.userData;
            console.log(`Processing page ${pageNumber}...`);
            
            await page.waitForSelector('.s-result-item');
            
            const products = await page.$$eval('.s-result-item', (items) => {
                return items.map(item => {
                    const name = item.querySelector('h2 a span')?.textContent.trim() || 'N/A';
                    const priceWhole = item.querySelector('.a-price-whole')?.textContent.trim() || '0';
                    const priceFraction = item.querySelector('.a-price-fraction')?.textContent.trim() || '00';
                    const price = `$${priceWhole}.${priceFraction}`;
                    const rating = item.querySelector('.a-icon-star-small .a-icon-alt')?.textContent.trim().split(' ')[0] || 'N/A';
                    
                    return { name, price, rating };
                }).filter(product => product.name !== 'N/A');
            });

            await Apify.pushData({
                pageNumber,
                url: page.url(),
                products,
                scrapedAt: new Date().toISOString()
            });

            // Pagination - add next page if we haven't reached maxPages
            if (pageNumber < maxPages) {
                try {
                    const nextPageUrl = await page.$eval('.s-pagination-next:not(.s-pagination-disabled)', link => link.href);
                    if (nextPageUrl) {
                        await requestQueue.addRequest({
                            url: nextPageUrl,
                            userData: { pageNumber: pageNumber + 1 }
                        });
                    }
                } catch (error) {
                    console.log('No more pages or error finding next page:', error);
                }
            }
        },
        handleFailedRequestFunction: async ({ request }) => {
            console.log(`Request ${request.url} failed too many times`);
            await Apify.pushData({
                error: `Failed to process ${request.url}`,
                pageNumber: request.userData.pageNumber
            });
        },
    });

    await crawler.run();
});