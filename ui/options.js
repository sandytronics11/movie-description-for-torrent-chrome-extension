function populateOptions(opts) {
	for ( var categoryName in opts) {
		var category = opts[categoryName];
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

function reloadOptions() {
	storage.get('opts', function(result) {
		try {
			populateOptions(result.opts);
		} catch (e) {
			console.log('error in reloadOptions: ' + e);
		}
	});
}

function saveOptions() {
	var opts = getDefaultOptions();
	for ( var categoryName in opts) {
		var category = opts[categoryName];
		for ( var field in category) {
			var node = $("#" + categoryName).find('input[name=' + field + ']');
			if (typeof (category[field]) == "boolean") {
				category[field] = node.is(':checked');
			} else if (typeof (category[field]) == "string") {
				category[field] = node.attr('value');
			}
		}
	}
	updateOptions(opts);
}

function buildHtml() {
	var theBody = $("#body");
	var opts = getDefaultOptions();
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

$(document).ready(function() {

	buildHtml();
	reloadOptions();

	$('#resetOptions').click(function() {
		resetOptions();
		reloadOptions();
		alert("Done");
	});

	$('#saveOptions').click(function() {
		saveOptions();
		reloadOptions();
		alert("Done");
	});

	$('#cleanCache').click(function() {
		filmwebCache.clean();
		imdbCache.clean();
		alert("Done");
	});
});
