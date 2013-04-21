NodeReader
==========

A GoogleReader-ish rss reader site using node.js.

###Note

This is still very rough. I am not sure how useful its going to turn out to be and 
this is mostly for my own benefit.  The biggest flaw at the moment is parsing the feeds themselves.
I need to actually look at the rss specifications.

Description
-----------

The project consists of two parts.  The node.js server and the web page.

###Server

The server fetches the rss feeds from a subscriptions.xml file.  
I just took mine from the Google Reader export.  It stores the result in a feeds.json file,
which is later used to keep track of what has been read and what hasn't.  
I still need to add something that filters out entries that are left out of the main feed.
Actually the server needs a lot of work.

###Page
The page is fairly simple and uses [knockout.js](http://knockoutjs.com/) and [twitter bootstrap](http://twitter.github.io/bootstrap/) to display the feed results
that it fetches from the server.  It can be replaced with little effort if so desired.

Installing
----------

1. Make sure [node.js](http://nodejs.org/) is installed.
2. Download NodeReader
3. Either create a subscriptions.xml file, import yours from Google Reader, 
	or rename the exampleSubscriptions.xml file to subscriptions.xml
4. In a command prompt, navigate to the NodeReader folder and type:
	`npm install`
	
Starting the server
-------------------

	In a command prompt in the NodeReader folder type:
		`node sever.js`
	
	Then use the web browser(probably should be an update to date browser I haven't tested this at all yet, have only been using chrome myself) 
	of your choice to navigate to [Reader.htm](http://localhost:3000/Reader.htm)