import { Actor } from 'apify';
import { chromium } from 'playwright';

await Actor.init();

const { startUrls } = await Actor.getInput();

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

const results = [];

for (const url of startUrls) {
    await page.goto(url);

    const bookData = await page.evaluate(() => {
        const title = document.querySelector('#productTitle')?.textContent.trim();
        const author = document.querySelector('.author a')?.textContent.trim();
        const price = document.querySelector('.price_color')?.textContent.trim();
        const rating = document.querySelector('i[data-hook="rating-star-small"]')?.getAttribute('class').match(/a-star-([0-5]-)/)?.[1];

        return {
            title,
            author,
            price,
            rating
        };
    });
    results.push(bookData);
}

await browser.close();

await Actor.pushData(results);

await Actor.exit();