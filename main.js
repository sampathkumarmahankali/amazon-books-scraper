import { Apify } from 'apify';
import { Cheerio } from 'cheerio';

Apify.init(); // Initialize the Apify environment

const {
  input,
  startUrls,
  maxItemsToScrape,
  countryCode
} = Apify.getInput(); // Get input parameters (e.g., Amazon URL, max items)

const scraper = new Apify.Scraper({
  startUrls: startUrls, // Initial URLs to scrape
  maxItemsToScrape: maxItemsToScrape, // Limit the number of items to scrape
  input: input, // Any other input you might need

  async crawl(context) {
    console.log(`Crawling: ${context.request.url}`);

    const $ = await context.getPage();
    const bookData = [];

    // Example: Extract title and price (you'll need to adjust selectors)
    const titles = $('.a-link-title').map((index, element) => {
      return $(element).text();
    }).toArray();
    const prices = $('.a-price-whole').map((index, element) => {
      return $(element).text();
    }).toArray();
    const links = $('.a-link-title').map((index, element) => {
      return $(element).attr('href');
    }).toArray();

    for (let i = 0; i < titles.length; i++) {
      bookData.push({
        title: titles[i],
        price: prices[i],
        link: links[i]
      });
    }

    return {
      url: context.request.url,
      data: bookData
    };
  },

  async afterPageLoad(context) {
    // Implement logic for navigating to the next page, if needed
  },
});

try {
  const { data } = await scraper.run();

  console.log('Scraped data:', data);

  // Save the data to a dataset
  Apify.Dataset.push(data);
} catch (e) {
  console.log(e);
} finally {
  Apify.done(); // Signal that the scraping process is complete
}
