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
		that.mblacklist.movies.sort();
		console.log("content for '" + that.name + "' = " + JSON.stringify(that.mblacklist));
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

Blacklist.prototype.isBlacklisted = function(movie) {
	for ( var i in this.mblacklist.movies) {
		if (this.mblacklist.movies[i] == movie) {
			return true;
		}
	}
	return false;
};

Blacklist.prototype.add = function(movie) {
	console.log("adding to list " + this.name + " item: '" + movie + "'");
	this.mblacklist.movies.push(movie);
	this.save();
};
