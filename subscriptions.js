var xml2js = require('xml2js');
var fs = require('fs');
var feedjs = require('./feed.js');

var isLoaded = false;
var subscriptions = [];
var urlMap = {};
var feeds = {};

var loadingCount = 0;
var loadingCallbacks = [];

function startLoad(callback){
	loadingCount++;
	loadingCallbacks.push(callback);
}

function finishLoad() 
{
	loadingCount--;
	
	if(loadingCount == 0){
		isLoaded = true;
		for(var i = 0; i < loadingCallbacks.length; i++){
			var callback = loadingCallbacks[i](subscriptions);
		}
		feedjs.storeFeeds();
	}
}

function loadSubscriptions(callback) {
	var parser = new xml2js.Parser();
	
	fs.readFile('subscriptions.xml', function(err, data){
			parser.parseString(data, function(err, result){
				var outline = result.opml.body[0].outline;
				for(var i = 0; i < outline.length; i++){
					var item = outline[i]['$'];
					startLoad(callback);
					
					var url = item.xmlUrl;
					urlMap[url] = i;
										
					var sub = {};
					sub.url = url;
					sub.title = item.title;
					sub.count = 0;
					
					feedjs.getFeedItems(url, function(feed) {
							var newLinks = feed.getNewLinks();
							feeds[feed.url] = feed;
							subscriptions[urlMap[feed.url]].count = newLinks.length;
							finishLoad();
					});
					
					subscriptions.push(sub);
					
				}
			});
	});
}

function getSubscriptions(callback)
{
	if(isLoaded){
		callback(subscriptions);
	}else{
		loadSubscriptions(callback);
	}
}

function getLinks(url, callback)
{
	function returnLinks(){
		var feed = feeds[url];
		if(feed == undefined)
		{
			callback([]);
		}else{
			callback(feed.getNewLinks());
		}
	}

	if(isLoaded){
		returnLinks();
	}else{
		loadSubscriptions(function(items){
			returnLinks();
		});
	}
}

function readLink(url, id, callback){
	
	function readLink(){
		var feed = feeds[url];
		if(feed == undefined)
		{
			callback('Not Marked');
		}else{
			feed.readLink(id);
			callback('Marked');
			subscriptions[urlMap[url]].count = feed.getNewLinks().length;
		}
		feedjs.storeFeeds();
	}

	if(isLoaded){
		readLink();
	}else{
		loadSubscriptions(function(items){
			readLink();
		});
	}
}

exports.getSubscriptions = getSubscriptions;
exports.getLinks = getLinks;
exports.readLink = readLink;