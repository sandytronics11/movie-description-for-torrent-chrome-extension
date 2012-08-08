function populateOptions(opts) {
	for ( var categoryName in opts) {
		category = opts[categoryName];
		for ( var field in category) {
			node = $("#" + categoryName).find('input[name=' + field + ']');
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
	opts = getDefaultOptions();
	for ( var categoryName in opts) {
		category = opts[categoryName];
		for ( var field in category) {
			node = $("#" + categoryName).find('input[name=' + field + ']');
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
	theBody = $("#body");
	opts = getDefaultOptions();
	for ( var categoryName in opts) {
		theBody.append("<div id='" + categoryName + "'></div>");

		category = opts[categoryName];
		node = $("#" + categoryName);
		htmlStr = "<fieldset><legend>" + categoryName.replace(/_/gi, " ") + "</legend>";

		for ( var fieldName in category) {

			typeOfNode = typeof (category[fieldName]);
			humanReadable = fieldName.replace(/_/gi, " ");
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
	});

	$('#saveOptions').click(function() {
		saveOptions();
		reloadOptions();
	});
});
