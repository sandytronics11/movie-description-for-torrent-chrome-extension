var storage = chrome.storage.local;

var DELIMITER = "WITOWITO";

function removeDelimiter(title) {
	return title.replace(new RegExp(DELIMITER,"gi"), "");
}

function htmlToText(htmlNode) {
	var res = "";

	$(htmlNode).contents().each(function(index) {
		nodeVal = $(this).text().trim();
		if (res==""){
			res = res + nodeVal + DELIMITER;	
		}else{
			res = res + nodeVal + " ";	
		}
		
	});
	
	return res.trim();
}

function addEnableDisablePart(opts, anchor, callback, isSelectedNow) {
	$("<input name='enabletorrplugin' type='checkbox'> Enable Torrent With Filmweb Chrome Extension</input>")
		.insertBefore(anchor);

	$("input[name='enabletorrplugin']").click(function() {
		isSelected = $(this).is(':checked');
		callback(isSelected);
		updateOptions(opts);
		window.location.reload();
	});
	$("input[name='enabletorrplugin']").attr('checked', isSelectedNow);
}

function getTheFilmsFromIsoHunt(opts) {
	
	addEnableDisablePart(opts, '#serps', function(isSelected) {
			opts.General.Integrate_with_IsoHunt = isSelected;
		},
		opts.General.Integrate_with_IsoHunt);
	
	if (!opts.General.Integrate_with_IsoHunt){
		return;
	}
	
	if (opts.General.Remove_adds_on_PirateBay_and_IsoHunt) {
		console.log("removing adds");
		$(document).find("script").remove();
		$(document).find("noscript").remove();
		$(document).find("iframe").remove();
	}
	
	resultSet = $('#serps').find("tbody").children(":first");
	resultSet.append("<th id='filmweb_th'>Filmweb</th>");
	if (opts.Links.Add_links) {
		resultSet.append("<th id='links_th'>Links</th>");
	}
	
	$('#serps').find("tbody").children(" .hlRow").each(function(index) {
		
		if ($(this).find("th").length > 0) {
			return;
		}
		
		if (opts.General.Remove_adds_on_PirateBay_and_IsoHunt) {
			$(this).removeAttr("onclick");
		}
		
			
		filmwebNode = $("<td class=\"row3\" id=\"filmweb_"+index+"\">"+getAjaxIcon()+"</td>");
		linksNode = $("<td class=\"row3\" id=\"links_"+index+"\"></td>");
		
		$(this).append(filmwebNode);
		if (opts.Links.Add_links) {
			$(this).append(linksNode);
		}
		
		torrentNameNode = $(this).children("td[id^='name']");
		if (torrentNameNode.length==0){
			console.log("unexpected: there is no torrentNameNode ?");
			return;
		}
		
		originalTitle = htmlToText(torrentNameNode.children("a[id^='link']"));
		if (originalTitle=="") {
			originalTitle = torrentNameNode.children("a[id^='RL']").attr("title");
		}
		if (originalTitle==null || originalTitle==undefined || originalTitle=="") {			
			console.log("unexpected: there is no torrentTitle ?");
			return;
		}
		
		console.log("parsing row with title: '"+originalTitle+"'");
		cleanedTitle = get_clean_title_isohunt(originalTitle);
		
		if (opts.Links.Add_links) {
			if (opts.Links.Use_original_title_as_query_param){
				linksNode.append(get_links(opts.Links, {title:removeDelimiter(originalTitle), year: null}));
			}
			if (opts.Links.Use_movie_title_as_query_param && cleanedTitle != null){
				linksNode.append(get_links(opts.Links, cleanedTitle));
			}
		}
		
		if (cleanedTitle == null) {
			replaceWith(filmwebNode, "not a movie '"+removeDelimiter(originalTitle)+"' ?");
			return 
		}
		
		call_filmweb(opts, filmwebNode, cleanedTitle.title);
		
	});
}

function getTheFilmsFromPirate(opts) {
	
	addEnableDisablePart(opts, '#searchResult', function(isSelected) {
		opts.General.Integrate_with_PirateBay = isSelected;
	},
	opts.General.Integrate_with_PirateBay);
	
	if (!opts.General.Integrate_with_PirateBay){
		return;
	}

	if (opts.General.Remove_adds_on_PirateBay_and_IsoHunt) {
		console.log("removing adds");
		$('iframe').remove();
	}
	resultSet = $('#tableHead').children(":first");
	resultSet.append("<th id='filmweb_th'>Filmweb</th>");
	if (opts.Links.Add_links) {
		resultSet.append("<th id='links_th'>Links</th>");
	}
	
	$('#searchResult').find("tbody").children().each(function(index) {
		
		titleNode = $(this).find(" .detName");
		if (titleNode.length == 0){
			return;
		}
	
		filmwebNode = $("<td id=\"filmweb_"+index+"\">"+getAjaxIcon()+"</td>");
		linksNode = $("<td id=\"links_"+index+"\"></td>");
		
		$(this).append(filmwebNode);
		if (opts.Links.Add_links) {
			$(this).append(linksNode);
		}
		
		originalTitle = titleNode.children(":first").html();
		console.log("parsing row with title: '"+originalTitle+"'");
		cleanedTitle = get_clean_title_pirate(originalTitle);
		
		if (opts.Links.Add_links) {
			if (opts.Links.Use_original_title_as_query_param){
				linksNode.append(get_links(opts.Links, {title:removeDelimiter(originalTitle), year: null}));
			}
			if (opts.Links.Use_movie_title_as_query_param && cleanedTitle != null){
				linksNode.append(get_links(opts.Links, cleanedTitle));
			}
		}

		if (cleanedTitle == null) {
			replaceWith(filmwebNode, "not a movie '"+removeDelimiter(originalTitle)+"' ?");
			return 
		}
		
		call_filmweb(opts, filmwebNode, cleanedTitle.title);
		
	});	
}

$(document).ready(function() {
	
	storage.get('opts', function(result) {
		if (result.opts==undefined) {
			result.opts = getDefaultOptions();
		}
		if (result.opts.General.Enable_this_plugin) {
			if (is_pirate_bay()) {
				getTheFilmsFromPirate(result.opts);
			} else {
				getTheFilmsFromIsoHunt(result.opts);
			}
		}
	});

});