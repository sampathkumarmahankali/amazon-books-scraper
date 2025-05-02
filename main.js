const { Actor } = require('apify');
const { PlaywrightCrawler } = require('crawlee');

Actor.main(async () => {
    const input = await Actor.getInput() || {};
    const startUrl = input.startUrl || 'https://www.amazon.com/s?i=stripbooks&rh=n%3A283155';
    const maxPages = input.maxPages || 2;

    const dataset = await Actor.openDataset();

    const crawler = new PlaywrightCrawler({
        requestHandler: async ({ page, request }) => {
            const { pageNumber = 1 } = request.userData;

            await page.waitForSelector('.s-result-item');
            const products = await page.$$eval('.s-result-item', (items) => {
                return items.map(item => ({
                    name: item.querySelector('h2 a span')?.textContent.trim() || 'N/A',
                    price: `${item.querySelector('.a-price-whole')?.textContent.trim() || '0'}.${item.querySelector('.a-price-fraction')?.textContent.trim() || '00'}`,
                    rating: item.querySelector('.a-icon-alt')?.textContent.trim().split(' ')[0] || 'N/A'
                }));
            });

            await dataset.pushData({
                pageNumber,
                url: request.url,
                products,
                scrapedAt: new Date().toISOString()
            });

            if (pageNumber < maxPages) {
                const nextUrl = await page.$eval('a.s-pagination-next:not(.s-pagination-disabled)', el => el.href);
                if (nextUrl) {
                    await crawler.addRequests([{
                        url: nextUrl,
                        userData: { pageNumber: pageNumber + 1 }
                    }]);
                }
            }
        },
    });

    await crawler.run([{ 
        url: startUrl,
        userData: { pageNumber: 1 }
    }]);
});