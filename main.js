const { Actor } = require('apify');
const { chromium } = require('playwright');

Actor.main(async () => {
    try {
        // Get input with default values
        const input = await Actor.getInput() || {};
        const startUrls = input.startUrls || ['https://www.amazon.com/s?i=stripbooks&rh=n%3A283155'];
        const maxResults = input.maxResults || 50;

        // Use chromium instead of chrome channel
        const browser = await chromium.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        });
        
        const page = await context.newPage();
        const results = [];
        let resultCount = 0;

        for (const url of startUrls) {
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            // Handle cookie consent if needed
            try {
                await page.click('#sp-cc-accept');
                await page.waitForTimeout(1000);
            } catch (error) {
                // Cookie banner not found, continue
            }

            // Scrape all book items on page
            const books = await page.$$eval('.s-result-item', (items) => {
                return items.map(item => {
                    const title = item.querySelector('h2 a span')?.textContent.trim();
                    const author = item.querySelector('.a-color-secondary .a-size-base+ .a-size-base')?.textContent.trim();
                    const priceWhole = item.querySelector('.a-price-whole')?.textContent.trim();
                    const priceFraction = item.querySelector('.a-price-fraction')?.textContent.trim();
                    const rating = item.querySelector('.a-icon-alt')?.textContent.trim().split(' ')[0];

                    return {
                        title,
                        author,
                        price: priceWhole ? `$${priceWhole}.${priceFraction || '00'}` : 'Not available',
                        rating: rating || 'No rating'
                    };
                }).filter(book => book.title);
            });

            for (const book of books) {
                if (resultCount >= maxResults) break;
                results.push(book);
                resultCount++;
            }

            if (resultCount >= maxResults) break;
        }

        await Actor.pushData(results);
        console.log(`Successfully scraped ${results.length} books`);

    } catch (error) {
        console.error('Scraping failed:', error);
        await Actor.fail(error);
    }
});