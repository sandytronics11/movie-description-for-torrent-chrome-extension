function replaceWith(node, str){
	node.empty().append(str);
}

function getAjaxIcon() {
	imgUrl = chrome.extension.getURL("ajax_loading_small.gif");	
	return "<img src=\""+imgUrl+"\" /></td>";
}

function call_filmweb(filmwebNode, filmTitle) {
	$.ajax({
	  url: "http://www.filmweb.pl/search?"+$.param({q: filmTitle }),
	  success: function(data) {
		  firstFilm = $(data).find("#searchFixCheck").children(":first").find(".searchResultCol_2_wrapper");					
			if (firstFilm.length == 0) {
				replaceWith(filmwebNode, "Can't find '"+filmTitle+"'.");
			} else {
				firstFilm.find("a[href]").each(function() {
					i = this.href.indexOf("/");
					i = this.href.indexOf("/",i+1);
					i = this.href.indexOf("/",i+1);
					this.href = "http://www.filmweb.pl"+this.href.substring(i);
				});
				replaceWith(filmwebNode, firstFilm);
			}
	  },
	  failure:function(data) {
		  replaceWith(filmwebNode, "Can't connect to filmweb");
	  }
	});	
}

function trim(str) {
	 return str.replace(/^\s+|\s+$/g, "");
}

function removeAll(from, what) {
	for (i in what) {
		from = from.replace(new RegExp(what[i],"gi"), "");
	}
	return from;
}

function get_clean_title_isohunt(originalTitle) {
	filmNameClean = originalTitle;
	
	what = ["\\[.+\\]","UCF.97", "x264","dvdr","xvid", "highres", "DVD Rip", "DVD-R",
            "xxx", "bollywood", "animation", "Documentary", "Romance", "Biography", "Sports", "Fantasy", "comedy","drama",
            "crime","anime","adventure","Sci-Fi", "Tutorial", "Mystery", "Family", "Dance", "War", "western","horror","animation","thriller","westerns","action","pop"];
	for (i in what) {
		filmNameClean = filmNameClean.replace(new RegExp("^"+what[i]+"\\ WITOWITO","gi"), "");
	}
	
	filmNameClean = filmNameClean.replace(/WITOWITO/gi, "");
		
	return get_clean_title_pirate(filmNameClean);
}

function get_clean_title_pirate(originalTitle) {
	
	possibleMovieTitle = false;
	filmNameClean = originalTitle;
	year = filmNameClean.match(new RegExp("[\\(\\[\\ \\.\\*\\-\\{][1-2][0-9][0-9][0-9][\\)\\]\\ \\.\\*\\}\\[\\-]","gi"));
	if (year!=null && year.length > 0) {
		i = filmNameClean.indexOf(year[0]);
		filmNameClean = filmNameClean.substring(0, i);
		possibleMovieTitle = true;
	}

	filmNameClean = filmNameClean.replace(new RegExp("\\[.+\\]","gi"), "");
	filmNameClean = filmNameClean.replace(new RegExp("\\(.+\\)","gi"), "");
	
	special = filmNameClean.match(new RegExp("KLAXXON|LIMITED|HDTV|SWEDISH|SWESUB|BDRIP|DVD|UNRATED|720p", "gi"));
	if (special!=null && special.length > 0) {
		i = filmNameClean.indexOf(special[0]);
		filmNameClean = filmNameClean.substring(0, i);
		possibleMovieTitle = true;
	}

	if (!possibleMovieTitle) {
		return null;
	}

	filmNameClean = filmNameClean.replace(new RegExp("[\\[\\]\\(\\)\\.\\-\\=]", "gi"), " ");

	ttr = [
		"XDM", "AAC", "HD", "CAM", "DVDScrRip", "Dvdscr", "Rip" , "1CD", "2CD", "MP3", "x264 5.1", "x264",
		"dvd5", "DVDRip", "RRG", "Xvid", "ICTV", "NL subs", "IPS", "Rel -", "\\*", "720p", "Hindi", "-", "BRRip", 
		"\\(Rel \\)", "\\( Rel \\)", "\\( \\)", "\\(\\)" ];
	for (i in ttr) {
		filmNameClean = filmNameClean.replace(new RegExp(ttr[i],"gi"), "");
	}

	filmNameClean = trim(filmNameClean);
	
	if (filmNameClean=="") {
		return null;
	}
	
	return filmNameClean;
}

function get_links(param) {
	return $("<h3></h3>")
		.append("<a href='https://www.google.pl/search?"+$.param({q: param })+"' target='_blank'>[search]</a>")
		.append("<br/>")
		.append("<a href='https://www.google.pl/search?"+$.param({safe:"off", q: param, tbm:"isch"})+"' target='_blank'>[pics]</a>")
		.append("<br/>")
		.append("<a href='http://www.filmweb.pl/search?"+$.param({q: param }) +"' target='_blank'>[filmweb]</a>");
}


function is_pirate_bay(){
	return window.location.hostname.indexOf("pirate") >= 0;
}