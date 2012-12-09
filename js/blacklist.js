"use strict";

function Blacklist(name) {
	this.name = name;
	this.mblacklist = this.getDefault();
}

Blacklist.prototype.load = function(callback) {
	var that = this;
	chrome.storage.local.get([ that.name ], function(result) {
		if (result[that.name] == undefined) {
			that.mblacklist = that.getDefault();
		} else {
			that.mblacklist = result[that.name];
		}
		that.mblacklist.movies.sort(function(a, b) {
			return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
		});
		console.log("content for '" + that.name + "' = "
				+ JSON.stringify(that.mblacklist));
		callback(result);
	});
};

Blacklist.prototype.getDefault = function() {
	return {
		movies : []
	};
};

Blacklist.prototype.clear = function() {
	this.mblacklist = this.getDefault();
};

Blacklist.prototype.reset = function() {
	this.clear();
	this.save();
};

Blacklist.prototype.save = function() {
	var obj = {};
	obj[this.name] = this.mblacklist;
	chrome.storage.local.set(obj);
};

Blacklist.prototype.stringify = function(cleanedTitle) {
	var tk = cleanedTitle.title;
	if (cleanedTitle.year != null) {
		tk = tk + " (" + cleanedTitle.year + ")";
	}
	return tk;
};

Blacklist.prototype.contains = function(movie) {
	var theStr = this.stringify(movie).toLowerCase();
	for ( var i in this.mblacklist.movies) {
		if (this.stringify(this.mblacklist.movies[i]).toLowerCase() == theStr) {
			return true;
		}
	}
	return false;
};

Blacklist.prototype.add = function(movie) {
	console.log("adding to list: " + this.stringify(movie));
	this.mblacklist.movies.push(movie);
	this.save();
};
