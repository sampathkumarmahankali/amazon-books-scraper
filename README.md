# Amazon Books Scraper

An Apify actor that scrapes product details from Amazon's Books category.

## Features
- Scrapes product names, prices, and ratings
- Handles pagination (configurable number of pages)
- Uses Playwright for reliable scraping
- Outputs structured JSON data

## Input Configuration
```json
{
    "startUrl": "https://www.amazon.com/s?i=stripbooks&rh=n%3A283155",
    "maxPages": 2
}
```

## Output Format
```json
[
    {
        "pageNumber": 1,
        "url": "https://www.amazon.com/s?i=stripbooks&rh=n%3A283155",
        "products": [
            {
                "name": "Book Title",
                "price": "$12.99",
                "rating": "4.5"
            },
            ...
        ],
        "scrapedAt": "2023-05-01T12:00:00.000Z"
    },
    ...
]
```