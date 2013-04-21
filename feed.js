var fs = require('fs');
var request = require('request');
var xml2js = require('xml2js');

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

function loadFeedFromRss(rss){
	
	var links = [];
	
	var items = rss.channel[0].item;
	for(var i = 0; i < items.length; i++){
		var item = items[i];
		var linkItem = {};
		
		if(item.guid != undefined){
			linkItem.id = item.guid[0]._;
		}else{
			linkItem.id = item.link[0];
		}
		linkItem.link = item.link[0];
		linkItem.title = item.title[0];
		linkItem.pubDate = item.pubDate[0];
		linkItem.description = item.description[0];
		linkItem.unread = true;
		
		links.push(linkItem);
	}
	
	return links
}

function loadFeedFromHtml(html){
	
	var links = [];
	
	var body = html.body;
	for(var i = 0; i < body.length; i++) {
		var item = body[i];
		console.log(item);
	}
	
	return links;
}

function loadFeedFromFeed(feed){
	
	var links = [];
	
	var entries = feed.entry;
	for(var i = 0; i < entries.length; i++) {
		var item = entries[i];
		var linkItem = {};
		linkItem.id = item.id[0];
		linkItem.link = item.link[0];
		linkItem.title = item.title[0];
		linkItem.published = item.published[0];
		linkItem.description = item.summary[0];
		linkItem.unread = true;
		
		links.push(linkItem);
	}
	
	return links;
}

function getFeedItems(url, callback){
	var parser = new xml2js.Parser();
	request(url, function(error, response, body) {
		parser.parseString(body, function(err, result){
			
			var feed = new Feed(url);
			
			if(result.rss != undefined){
				feed.links = loadFeedFromRss(result.rss);
			}else if(result.html != undefined){
				feed.links = loadFeedFromHtml(result.html);
			}else{
				feed.links = loadFeedFromFeed(result.feed);
			}
			
			refreshFeed(feed);
			callback(feed);
		});
	});
}

exports.getFeedItems = getFeedItems
exports.storeFeeds = storeFeeds

