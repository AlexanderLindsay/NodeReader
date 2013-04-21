var http = require('http');
var express = require('express');
var app = express();
var request = require('request');
var xml2js = require('xml2js');
var fs = require('fs');
var subs = require('./subscriptions.js');

//subs.getSubscriptions();

//app.use(express.logger());
app.use(express.bodyParser());
app.post('/api/getFeed', function(req, res){
	var url = req.body.feed;
	subs.getLinks(url, function(items) { res.json(items);});
});
app.post('/api/getSubscriptions', function(req, res){
	subs.getSubscriptions(function(items) { res.json(items);});
});
app.post('/api/readLink', function(req, res) {
	var feed = req.body.feed;
	var id = req.body.id;
	subs.readLink(feed, id, function(result) { res.json(result);});
});
app.use(express.static('./Reader'));

app.listen(3000);
console.log('Listening on port 3000');