/* Twitter Streaming application for Banno. Written by Chris Carlile.
 * Statistics are kept as tweets are recieved and calculations are performed
 * on request. Change credentials in config.js to access Twitter stream.
 */

var express = require('express'),
  twitter = require('twitter'),
  config = require('./config.js');
  lib = require('./lib.js');

//Initialize app
var app = express();

//Set route for returning stats
app.get('/', function(req, res){
  lib.calculate(req, res);
});

//Open port for listening
app.listen(3000, function(){
  console.log('Twitter stream open, server listening on port 3000');
});

//Create client and open stream
var client = new twitter(config.twitterAuth);
client.stream('statuses/sample', {}, function(stream) {
  stream.on('data', function(tweet) {
    //Ignore non-tweet messages (deletions, empty lines, etc.);
    if(tweet.text) {
      //Asynch parsing in between network activity
      lib.parse(tweet);
    };
  });

  stream.on('error', function(error) {
    throw error;
  });
});

process.on('SIGINT', () => {
  console.log('goodbye!');
  process.exit(0);
});
