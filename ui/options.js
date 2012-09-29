"use strict";

var myOPT = new Options();

function populateOptions() {
	for ( var categoryName in myOPT.opts) {
		var category = myOPT.opts[categoryName];
		for ( var field in category) {
			var node = $("#" + categoryName).find('input[name=' + field + ']');
			if (typeof (category[field]) == "boolean") {
				node.attr('checked', category[field]);
			} else if (typeof (category[field]) == "string") {
				node.attr('value', category[field]);
			}
		}
	}
}

function saveOptions() {
	for ( var categoryName in myOPT.opts) {
		var category = myOPT.opts[categoryName];
		for ( var field in category) {
			var node = $("#" + categoryName).find('input[name=' + field + ']');
			if (typeof (category[field]) == "boolean") {
				category[field] = node.is(':checked');
			} else if (typeof (category[field]) == "string") {
				category[field] = node.attr('value');
			}
		}
	}
	myOPT.save();
}

function buildHtml() {
	var theBody = $("#body");
	var opts = Options.prototype.getDefault();
	for ( var categoryName in opts) {
		theBody.append("<div id='" + categoryName + "'></div>");

		var category = opts[categoryName];
		var node = $("#" + categoryName);
		var htmlStr = "<fieldset><legend>" + categoryName.replace(/_/gi, " ") + "</legend>";

		for ( var fieldName in category) {

			var typeOfNode = typeof (category[fieldName]);
			var humanReadable = fieldName.replace(/_/gi, " ");
			if (typeOfNode == "boolean") {
				htmlStr = htmlStr + ("<input name='" + fieldName + "' type='checkbox'>" + humanReadable + "</input>");
			} else if (typeOfNode == "string") {
				htmlStr = htmlStr + (humanReadable + " <input name='" + fieldName + "' type='text' size='4'/>");
			}
			htmlStr = htmlStr + ("<br/>");
		}

		htmlStr = htmlStr + "</fieldset>";
		node.append(htmlStr);
	}
}

function loadOptions() {
	myOPT.load(function(result) {
		try {
			populateOptions(result.opts);
		} catch (e) {
			console.log('error in loadOptions: ' + e);
		}
	});
}

$(document).ready(function() {

	$('#resetOptions').click(function() {
		myOPT.reset();
		loadOptions();
		alert("Done");
	});

	$('#saveOptions').click(function() {
		saveOptions();
		loadOptions();
		alert("Done");
	});

	$('#cleanCache').click(function() {
		var cache = new MovieCache('filmwebCache');
		cache.clean();
		var cache = new MovieCache('imdbCache');
		cache.clean();
		alert("Done");
	});

	buildHtml();
	loadOptions();
});
