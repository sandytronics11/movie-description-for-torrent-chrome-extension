"use strict";

var myOPT = new Options();
var myBL = new Blacklist("mblacklist");
var myWW = new Blacklist("mwontwatch");
var filmwebCache = new MovieCache('filmwebCache');
var imdbCache = new MovieCache('imdbCache');

function afterLoad(callback) {
	myOPT.load(function() {
		console.log("opts = " + JSON.stringify(myOPT.opts));
		if (myOPT.opts.General.Enable_this_plugin) {
			myBL.load(function() {
				myWW.load(function() {
					filmwebCache.reload(function() {
						imdbCache.reload(function() {
							callback();
						});
					});
				});
			});
		}
	});
}
