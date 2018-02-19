var Scraper = require('images-scraper')
  , bing = new Scraper.Bing();

  
bing.list({
  keyword: 'banana',
  num: 10,
  detail: true
})
  .then(function (res) {
    console.log('first 10 results from bing', res);
  }).catch(function (err) {
    console.log('err', err);
  })
var options = {
  // general
  keyword: 'keyword',		// required,
  userAgent: 'G.I. Joe',	// the user agent for each request to Google (default: Chrome)
  num: 10,				// amount of results, can be left empty but will take a lot longer

  // google specific
  rlimit: '10',			// number of requests to Google p second, default: unlimited
  timeout: 10000,			// timeout when things go wrong, default: 10000
  nightmare: {
    // all the options for Nightmare, (show: true for example)
  }
}