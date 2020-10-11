At the time of writing (17/02/2019) the NSW Electoral Commission are using [Incapsula](https://www.incapsula.com) - a CloudFlare-esque SaaS service that provides them a CDN, DDoS mitigation, content caching, et cetera.

This service prevents us from directy querying the API, so we have to make a request by-hand first, and then attach their special cookies to all of our scraping requests.

1. Load http://map.elections.nsw.gov.au/Event.aspx?ID=SG1901&mode=PP in your browser
2. Copy the `incap_ses` and `visid_incap` cookies from your browser's dev tools into `__get_cookies` in scrape.py
