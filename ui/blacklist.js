"use strict";

var myBL = new Blacklist();

function enableSaveAndDiscardBtns(really) {
	if (really) {
		$('#discard').removeAttr("disabled");
		$('#save').removeAttr("disabled");
	} else {
		$('#discard').attr("disabled", "disabled");
		$('#save').attr("disabled", "disabled");
	}
}

function buildBlacklistGUI() {
	var theHtml = "<table><tr></tr>";
	for ( var i in myBL.mblacklist.movies) {
		var colMovie = "<td>" + myBL.mblacklist.movies[i] + "</td>";
		var colRemove = "<td><button class='res' name='" + i + "'>resurrect</button></td>";
		theHtml = theHtml + "<tr id='movie_" + i + "'>" + colMovie + colRemove + "</tr>";
	}
	theHtml = theHtml + "</table>";
	$('#blacklist_anch').empty().append(theHtml);

	$('.res').click(function() {
		var id = this.name;
		myBL.mblacklist.movies.splice(id, 1);
		$("#movie_" + id).hide();
		enableSaveAndDiscardBtns(true);
	});
	enableSaveAndDiscardBtns(false);
}

function loadBlacklist() {
	myBL.load(buildBlacklistGUI);
}

$(document).ready(function() {

	$('#save').click(function() {
		myBL.save();
		buildBlacklistGUI();
	});

	$('#discard').click(loadBlacklist);

	$('#resurrectAll').click(function() {
		myBL.clear();
		buildBlacklistGUI();
		enableSaveAndDiscardBtns(true);
	});

	loadBlacklist();

});