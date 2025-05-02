const { Actor, PlaywrightCrawler } = require('apify');

Actor.main(async () => {
    // Get input (default to Amazon books category)
    const input = await Actor.getInput() || {};
    const startUrl = input.startUrl || 'https://www.amazon.com/s?i=stripbooks&rh=n%3A283155';
    const maxPages = input.maxPages || 2;

    // Initialize dataset for results
    const dataset = await Actor.openDataset();

    // Configure crawler
    const crawler = new PlaywrightCrawler({
        launchContext: {
            launchOptions: {
                headless: true,
            },
        },
        requestHandler: async ({ page, request }) => {
            const { pageNumber = 1 } = request.userData;

            // Wait for and scrape products
            await page.waitForSelector('.s-result-item');
            const products = await page.$$eval('.s-result-item', (items) => {
                return items.map(item => {
                    const name = item.querySelector('h2 a span')?.textContent.trim() || 'N/A';
                    const priceWhole = item.querySelector('.a-price-whole')?.textContent.trim() || '0';
                    const priceFraction = item.querySelector('.a-price-fraction')?.textContent.trim() || '00';
                    const rating = item.querySelector('.a-icon-alt')?.textContent.trim().split(' ')[0] || 'N/A';

                    return {
                        name,
                        price: `$${priceWhole}.${priceFraction}`,
                        rating
                    };
                });
            });

            // Save results
            await dataset.pushData({
                pageNumber,
                url: request.url,
                products,
                scrapedAt: new Date().toISOString()
            });

            // Pagination
            if (pageNumber < maxPages) {
                const nextButton = await page.$('a.s-pagination-next:not(.s-pagination-disabled)');
                if (nextButton) {
                    await crawler.addRequests([{
                        url: await nextButton.getAttribute('href'),
                        userData: { pageNumber: pageNumber + 1 }
                    }]);
                }
            }
        },
    });

    // Start crawling
    await crawler.run([{
        url: startUrl,
        userData: { pageNumber: 1 }
    }]);
});