Twitter Scraper
===============

Introduction
------------
Streaming client for the Twitter [gardenhose](https://dev.twitter.com/streaming/reference/get/statuses/sample) service. 
Connects to stream and collects data on tweets recieved, including statistics on emoji, hashtags, urls, and pictures in 
tweets.

Installation
------------
Obtain developer keys from [Twitter](http://dev/twitter/com), and place the appropriate keys in config.js. Then:
```bash
    git clone http://github.com/ccarlile/TwitterScraper
    npm install
    node index.js
```
Usage
-----
On running `node index.js`, the app opens a twitter client and begins streaming and port 3000 is opened for listening. 
Send a GET request to `http://localhost:3000` to recieve a JSON object containing information about the tweets recieved 
so far.

Future Development
------------------
Since Node.js is single-threaded, calls to the statistics server (port 3000) will keep the parser from doing its job for
very large calls. Node's default sort method is quicksort with average case *n*log*n* performance, so using something like 
a heap wouldn't help too much. As a matter of fact, the available heap implementations in node are painfully lacking - 
the most popular library, [heap.js](https://github.com/qiao/heap.js), will arbitraialy remove elements in certain 
(supposedly) non-destructive methods.

Considering growing at scale, the idea would be: separate calls into two separate Node.js processes: one for parsing, 
and one for managing calls for statistics, and using a shared data store (Redis supports sorted sets, and would be a likely
candidate, though a database would be fine as well - especially if the tweet bodies were to be stored. MongoDB comes to 
mind for storing JSON). Additionally, backend processes can periodically compile statistics
so that the server process doesn't have to do it all. Putting these processes behind a server like NGINX would allow 
for load balancing, caching, etc.
