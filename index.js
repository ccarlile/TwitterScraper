var express = require('express'),
  twitter = require('twitter'),
  config = require('./config.js');

var app = express();

console.log(config.twitterAuth);
