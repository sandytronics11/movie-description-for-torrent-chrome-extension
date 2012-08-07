var storage = chrome.storage.local;

function htmlToText(htmlNode) {
	var res = "";
	
	$(htmlNode).contents().each(function(index) {
		if (res==""){
			res = res + $(this).text().trim()+ " WITOWITO ";	
		}else{
			res = res + $(this).text().trim()+ " ";	
		}
		
	});
	
	return res.trim();
}

function getTheFilmsFromIsoHunt() {
	
	$(document).find("script").remove();
	$(document).find("noscript").remove();
	$(document).find("iframe").remove();
	
	$('#serps').children(":first").children(":first")
		.append("<th>Filmweb</th>")
		.append("<th>Links</th>");
	
	$('#serps').find("tbody").children(" .hlRow").each(function(index) {
			
		var filmwebNode = $("<td class=\"row3\" id=\"filmweb_"+index+"\">"+getAjaxIcon()+"</td>");
		var linksNode = $("<td class=\"row3\" id=\"links_"+index+"\"></td>");
		
		$(this).removeAttr("onclick");
		
		$(this)
			.append(filmwebNode)
			.append(linksNode);
		
		nameNode = $(this).children("td[id^='name']");
		originalTitle = htmlToText(nameNode.children("a[id^='link']"));
		if (originalTitle=="") {
			originalTitle = nameNode.children("a[id^='RL']").attr("title");
		}
		if (originalTitle=="" || originalTitle==null || originalTitle==undefined) {
			replaceWith(filmwebNode, "error :(");
			return;
		}
		linksNode.append(get_links(originalTitle));
		
		cleanedTitle = get_clean_title_isohunt(originalTitle);		
		if (cleanedTitle == null) {
			originalTitle = originalTitle.replace(/WITOWITO/gi, "");
			replaceWith(filmwebNode, "not a movie ? '"+originalTitle+"'");
			return 
		}
		
		call_filmweb(filmwebNode, cleanedTitle);
		
	});
}

function getTheFilmsFromPirate() {
	
	$('iframe').remove();
	$('#tableHead').children(":first")
		.append("<th>Filmweb</th>")
		.append("<th>Links</th>");
	
	$('#searchResult').find("tbody").children().each(function(index) {
		
		titleNode = $(this).find(" .detName");
		if (titleNode.length == 0){
			return;
		}
	
		var filmwebNode = $("<td id=\"filmweb_"+index+"\">"+getAjaxIcon()+"</td>");
		var linksNode = $("<td id=\"links_"+index+"\"></td>");
		
		$(this)
			.append(filmwebNode)
			.append(linksNode);
		
		originalTitle = titleNode.children(":first").html();		
		linksNode.append(get_links(originalTitle));

		cleanedTitle = get_clean_title_pirate(originalTitle);
		if (cleanedTitle == null) {
			replaceWith(filmwebNode, "not a movie ? '"+originalTitle+"'");
			return 
		}
		
		call_filmweb(filmwebNode, cleanedTitle);
		
	});	
}

$(document).ready(function() {
	
	storage.get('opts', function(result) {
		console.log("options = "+JSON.stringify(result));
	});
	
	if (is_pirate_bay()) {
		getTheFilmsFromPirate();
	} else {
		getTheFilmsFromIsoHunt();
	}
});