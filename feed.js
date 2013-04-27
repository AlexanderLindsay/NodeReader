var fs = require('fs');
var request = require('request');
var xml2js = require('xml2js');
var FeedParser = require('feedparser');
var sanitizer = require('sanitizer');

var feeds = {};

function Feed(url) {
	var self = this;
	
	self.url = url;
	self.links = [];
	self.readLink = function(id){
		for(var i = 0; i < self.links.length; i++){
			var item = self.links[i];
			
			if(item.id == id){
				item.unread = false;
			}
		}
	}
	
	self.getNewLinks = function() {
		return self.links.filter(function (item) { return item.unread == true; });
	}
}

function restoreFeeds (){
	fs.readFile('feeds.json', { encoding: 'utf8'}, function (err, data) {
		feeds = JSON.parse(data || '{}');
		
		if(feeds == undefined){
			feeds = {};
		}
	});
}
restoreFeeds();

function storeFeeds(){
	fs.writeFile('feeds.json', JSON.stringify(feeds, null, 4), function (err, data)
	{
		//console.log(err);
	});
}

function refreshFeed(feed){
		var oldFeed = feeds[feed.url];
		if(oldFeed == undefined){
			oldFeed = { url: feed.url, links: [] };
		}
		
		var ids = {};
		for(var i = 0; i < oldFeed.links.length; i++){
			var item = oldFeed.links[i];
			ids[item.id] = item;
		}
		
		for(var i = 0; i < feed.links.length; i++)
		{
			var item = feed.links[i];
			var olditem = ids[item.id];
			
			if(olditem != undefined){
				item.unread = olditem.unread;
			}
		}
		
		feeds[feed.url] = feed;
}

function loadFeedFromArticles(articles){
	
	var links = [];
	
	for(var i = 0; i < articles.length; i++) {
		var article = articles[i];
		
		var linkItem = {};
		linkItem.id = article.guid;
		linkItem.link = article.link;
		linkItem.plainLink = article.origlink;
		linkItem.title = article.title;
		linkItem.description = sanitizer.sanitize(article.description);
		linkItem.summary = sanitizer.sanitize(article.description);		
		linkItem.pubDate = article.pubdate;
		linkItem.categories = article.categories;
		linkItem.unread = true;
		
		links.push(linkItem);
	}
	
	return links;
}

function getFeedItems(url, callback){
	request(url)
		.pipe(new FeedParser())
		.on('error', function(error) {
			console.log(error);
		})
		.on('complete', function(meta, articles) {
			var feed = new Feed(url);
			
			feed.links = loadFeedFromArticles(articles);
			
			refreshFeed(feed);
			callback(feed);
		
		});
}

exports.getFeedItems = getFeedItems
exports.storeFeeds = storeFeeds

