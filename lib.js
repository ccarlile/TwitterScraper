var urlParse = require('url');
var startDate = Date.now();

var emojire = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

var isInstagram = function(tweet) {
  for (var url in tweet.entities.urls) {
    if (tweet.entities.urls && 
        urlParse.parse(tweet.entities.urls[url].expanded_url).hostname == 'www.instagram.com') {
      return true;
    };
  };
  return false;
};

var increaseCount = function(object, key) {
  //Find key in object and increment value counter
  if (object[key]) {
    object[key] += 1;
  } else {
    object[key] = 1;
  }
};

var mostPopular = function(object, count) {
  var popular = Object.keys(object).sort(function(a, b) {
    return object[b] - object[a]}).slice(0, count);
  return popular;
};

//For URLs and hashtags, a PQ/heap would be preferable to an associative array
//but the implementations in Node/JS are... lacking. Because there are only
//like 1500 emoji, O(n) lookups aren't so bad. Hashtags and urls are practically
//unbounded though. A database wouldn't be a bad idea either, especially at scale. 
var stats = {
  totalTweets: 0,
  emoji: {},
  tweetsWithEmoji : 0,
  startTime: Date.now(),
  hashtags: {},
  tweetsWithUrl: 0,
  tweetDomains: {},
  tweetsWithPictures: 0
};

module.exports.parse = function(tweet) {
  //console.log(tweet.text);
  stats.totalTweets += 1;

  //Look for emoji
  var emojis = tweet.text.match(emojire);
  if (emojis) {stats.tweetsWithEmoji += 1};
  for (var emoji in emojis) {
    increaseCount(stats.emoji, emojis[emoji]);
  };
  
  //Look for hashtags
  for (var hashtag in tweet.entities.hashtags) {
    var tag = tweet.entities.hashtags[hashtag].text.toLowerCase()
    increaseCount(stats.hashtags, tag);
  };

  //Look for images
  if (tweet.entities.media || isInstagram(tweet)) {
    stats.tweetsWithPictures += 1;
  };

  //Look for urls
  if (tweet.entities.urls != false) {stats.tweetsWithUrl += 1};
  for (var url in tweet.entities.urls) {
    var host = urlParse.parse(tweet.entities.urls[url].expanded_url).hostname;
    increaseCount(stats.tweetDomains, host);
  };
};

module.exports.calculate = function(req, res) {
  var count = 10;
  var results = {};
  var total = stats.totalTweets;
  var seconds = (Date.now() - startDate) / 1000;
  var minutes = (Date.now() - startDate) / (1000 * 60);
  var hours = (Date.now() - startDate) / (1000 * 60 * 60);

  results.total = stats.totalTweets;
  results.averages = {
    second: total / seconds,
    minute: total / minutes,
    hour: total / hours
  };
  results.topEmoji = mostPopular(stats.emoji, count),
  results.percentWithEmoji = (stats.tweetsWithEmoji / total).toFixed(2) * 100;
  results.topHashtags = mostPopular(stats.hashtags, count);
  results.percentWithUrl = (stats.tweetsWithUrl / total).toFixed(2) * 100;
  results.percentWithPhoto = (stats.tweetsWithPictures / total).toFixed(2) * 100;
  results.topUrl = mostPopular(stats.tweetDomains, count);
  
  res.json(results);
}
