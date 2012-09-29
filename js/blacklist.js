"use strict";

function Blacklist() {
	this.mblacklist = this.getDefault();
}

Blacklist.prototype.load = function(callback) {
	var that = this;
	chrome.storage.local.get([ 'mblacklist' ], function(result) {
		if (result.mblacklist == undefined) {
			that.mblacklist = that.getDefault();
		} else {
			that.mblacklist = result.mblacklist;
		}
		that.mblacklist.movies.sort();
		console.log("mblacklist = " + JSON.stringify(that.mblacklist));
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
	chrome.storage.local.set({
		'mblacklist' : this.mblacklist
	});
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
	console.log("blacklisting movie: '" + movie + "'");
	this.mblacklist["movies"].push(movie);
	this.save();
};
