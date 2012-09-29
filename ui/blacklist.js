"use strict";

function removeNulls(arr) {
	var res = [];
	for ( var i in arr) {
		if (arr[i] != undefined) {
			res.push(arr[i]);
		}
	}
	return res;
}

function BlacklistGUI(myBL, anchorName) {
	var that = this;
	this.myBL = myBL;
	this.anchorName = anchorName;
	this.saveBtn = $("<button>Save changes</button>");
	this.saveBtn.click(function() {
		that.myBL.mblacklist.movies = removeNulls(that.myBL.mblacklist.movies);
		that.myBL.save();
		that.buildBlacklistGUI();
	});

	this.discardBtn = $("<button>Discard changes</button>");
	this.discardBtn.click(function() {
		that.loadBlacklist();
	});

	this.resurrectAll = $("<button>Resurrect All</button>");
	this.resurrectAll.click(function() {
		that.myBL.clear();
		that.buildBlacklistGUI();
		that.enableSaveAndDiscardBtns(true);
	});

	var anchor = $(this.anchorName);
	anchor.append(this.saveBtn);
	anchor.append(this.discardBtn);
	anchor.append(this.resurrectAll);
	anchor.append("<br/>");
	anchor.append("<br/>");
	anchor.append("<br/>");
	anchor.append("<div id='" + this.myBL.name + "_list'></div>");
}

BlacklistGUI.prototype.enableSaveAndDiscardBtns = function(really) {
	if (really) {
		this.discardBtn.removeAttr("disabled");
		this.saveBtn.removeAttr("disabled");
	} else {
		this.discardBtn.attr("disabled", "disabled");
		this.saveBtn.attr("disabled", "disabled");
	}
};

BlacklistGUI.prototype.buildBlacklistGUI = function() {

	var className = this.myBL.name;
	var theHtml = "<table><tr></tr>";
	for ( var i in this.myBL.mblacklist.movies) {
		var colMovie = "<td>" + this.myBL.mblacklist.movies[i] + "</td>";
		var colRemove = "<td><button class='" + className + "' name='" + i + "'>resurrect</button></td>";
		theHtml = theHtml + "<tr id='" + className + "_" + i + "'>" + colMovie + colRemove + "</tr>";
	}
	theHtml = theHtml + "</table>";
	$('#' + className + "_list").empty().append(theHtml);
	var that = this;
	$('button.' + className).click(function() {
		var id = this.name;
		delete that.myBL.mblacklist.movies[id];
		$("#" + className + "_" + id).hide();
		that.enableSaveAndDiscardBtns(true);
	});
	this.enableSaveAndDiscardBtns(false);
};

BlacklistGUI.prototype.loadBlacklist = function() {
	var that = this;
	this.myBL.load(function() {
		that.buildBlacklistGUI();
	});
};

$(document).ready(function() {
	var myBL = new Blacklist("mblacklist");
	myBL.load(function() {
		var blg = new BlacklistGUI(myBL, "#watched_blacklist");
		blg.buildBlacklistGUI();
	});

	var myBL2 = new Blacklist("mwontwatch");
	myBL2.load(function() {
		var blg = new BlacklistGUI(myBL2, "#wonwatch_blacklist");
		blg.buildBlacklistGUI();
	});

});