"use strict";

var myOPT = new Options();
var myBL = new Blacklist();

var filmwebCache = new MovieCache('filmwebCache');
var imdbCache = new MovieCache('imdbCache');

function isPirateBay() {
	return window.location.hostname.indexOf("pirate") >= 0;
}

$(document).ready(function() {
	myOPT.load(function() {
		console.log("opts = " + JSON.stringify(myOPT.opts));
		if (myOPT.opts.General.Enable_this_plugin) {
			myBL.load(function() {
				console.log("mblacklist = " + JSON.stringify(myBL.mblacklist));

				filmwebCache.reload(function() {
					imdbCache.reload(function() {
						if (isPirateBay()) {
							augmentPirateBay();
						} else {
							augmentIsoHunt();
						}

					});
				});
			});
		}
	});

});