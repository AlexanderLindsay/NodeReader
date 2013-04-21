$(document).ready(function () {

	var Entry = function(subscription) {
		var self = this;
		
		self.subscription = subscription;
		
		self.id = ko.observable();
		self.title = ko.observable();
		self.url = ko.observable();
		self.pubDate = ko.observable();
		self.description = ko.observable();
		
		self.read = function(){
			var readParams = {};
			readParams.feed = self.subscription.url();
			readParams.id = self.id();
		
			var request = $.ajax({
				type: 'POST',
				url: '/api/readLink',
				data: readParams,
				dataType: "json"
			});
			
			return true;
		}
	}

    var Subscription = function () {
        var self = this;

        self.title = ko.observable();
        self.url = ko.observable();
        self.site = ko.observable();
        self.active = ko.observable(false);
		self.count = ko.observable(0);
		
        self.entries = ko.observableArray([]);
		
		self.readAll = function() {
			ko.utils.arrayForEach(self.entries(), function(entry){
				entry.read();
			});
		};

        self.fetchEntries = function () {
            var url = self.url();

            if (url != undefined && url != null && url != '') {
				
				var feedParams = {};
				feedParams.feed = url;
			
                var request = $.ajax({
                    type: 'POST',
                    url: '/api/getFeed',
					data: feedParams,
                    dataType: "json"
                });

                request.done(function (links, status) {
                    self.entries([]);
					
					var newEntries = [];
					ko.utils.arrayForEach(links, function(item){
						var entry = new Entry(self);
						entry.id(item.id);
						entry.title(item.title);
						entry.url(item.link);
						entry.pubDate(item.pubDate);
						entry.description(item.description);
						newEntries.push(entry);
					});
					
					self.entries(newEntries);
                });
            }
        };
    };

    var ReaderViewModel = function () {

        var self = this;

        self.isLoaded = ko.observable(false);
        self.subscriptions = ko.observableArray([]);
        self.activeSubscriptions = ko.computed(function () {
            return ko.utils.arrayFilter(self.subscriptions(), function (item) {
                return item.active();
            });
        });
		
		self.allCount = ko.computed(function() {
			var count = 0;
			ko.utils.arrayForEach(self.subscriptions(), function(sub){
				count = count + sub.count();
			});
			
			return count;
		});
				
		self.readAll = function() {
			ko.utils.arrayForEach(self.subscriptions(), function(sub){
				sub.readAll();
			});
		}
				
		self.unreadEntries = ko.computed(function() {
		
			var entries = $.map(self.activeSubscriptions(), function(item){
				return item.entries();
			});
			
			return entries.sort(function(a, b){
				var dateA = new Date(a.pubDate());
				var dateB = new Date(b.pubDate());
				
				return dateB.getTime() - dateA.getTime();
			});
		});

		self.activateSub = function(sub){
			var newState = !sub.active();
            if (newState) {
                sub.fetchEntries();
            }
            sub.active(newState);
		}
		
        self.setSub = function (subIndex) {
            var sub = self.subscriptions()[subIndex];
            self.activateSub(sub);
        }

        self.load = function () {
            if (!self.isLoaded()) {
				
				self.subscriptions([]);
				
				var request = $.ajax({
                    type: 'POST',
                    url: '/api/getSubscriptions',
					data: {},
                    dataType: "json"
                });
				
				request.done(function(data){
					$.each(data, function (index, item) {
						var sub = new Subscription();
						sub.title(item.title);
						sub.url(item.url);
						sub.count(item.count);

						self.subscriptions.push(sub);
					});
				});
				
                self.isLoaded(true);
            }
        }

        Sammy(function () {
			this.get('#All', function() {
				self.load();
				ko.utils.arrayForEach(self.subscriptions(), function(sub){
					self.activateSub(sub);
				});
			});
            this.get('#:sub', function () {
                self.load();
                self.setSub(this.params.sub);
            });
            this.get('', function () {
                self.load();
            });
        }).run();
    };

    ko.applyBindings(new ReaderViewModel(), document.getElementById('reader'));
});