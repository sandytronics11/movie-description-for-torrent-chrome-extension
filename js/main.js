"use strict";

function isPirateBay() {
	return window.location.hostname.indexOf("pirate") >= 0;
}

$(document).ready(function() {
	afterLoad(function() {
		if (isPirateBay()) {
			augmentPirateBay();
		} else {
			augmentIsoHunt();
		}
	});
});