// wito 2012
function getTheFilms() {

	$('iframe').remove()
	$('#tableHead').children(":first")
		.append("<th>Filmweb</th>")
		.append("<th>Links</th>")
	
	$('#searchResult').find("tbody").children().each(function(index) {
	
		$(this)
			.append("<td id=\"filmweb_"+index+"\"></td>")
			.append("<td id=\"links_"+index+"\"></td>")
		
		original = $(this).find(" .detName").children(":first").html()
		
		$('#searchResult').find("#links_"+index)						
			.append("<a href='https://www.google.pl/search?"+$.param({q: original })+"' target='_blank'>[search]</a>")
			.append("<br/>")
			.append("<a href='https://www.google.pl/search?"+$.param({safe:"off", q: original, tbm:"isch"})+"' target='_blank'>[pics]</a>")
			.append("<br/>")
			.append("<a href='http://www.filmweb.pl/search?"+$.param({q: original }) +"' target='_blank'>[filmweb]</a>")
		
		possibleMovieTitle = false
		var filmNameClean = original
		year = filmNameClean.match(new RegExp("[\\(\\[\\ \\.\\*][1-2][0-9][0-9][0-9][\\)\\]\\ \\.\\*\\[]","gi"))
		if (year!=null && year.length > 0) {
			i = filmNameClean.indexOf(year[0])
			filmNameClean = filmNameClean.substring(0, i)
			possibleMovieTitle = true
		}

		filmNameClean = filmNameClean.replace(new RegExp("\\[.+\\]","gi"), "")
		filmNameClean = filmNameClean.replace(new RegExp("\\(.+\\)","gi"), "")
		
		special = filmNameClean.match(new RegExp("SWEDISH|SWESUB|BDRIP|DVD|UNRATED|720p", "gi"))
		if (special!=null && special.length > 0) {
			i = filmNameClean.indexOf(special[0])
			filmNameClean = filmNameClean.substring(0, i)
			possibleMovieTitle = true
		}

		var toappnode = $('#searchResult').find("#filmweb_"+index)

		if (!possibleMovieTitle) {
			toappnode.append("not a movie ?")
			return 
		}

		filmNameClean = filmNameClean.replace(new RegExp("[\\[\\]\\(\\)\\.\\-\\=]", "gi"), " ")

		ttr = [
			"XDM", "AAC", "HD", "CAM", "DVDScrRip", "Dvdscr", "Rip" , "1CD", "2CD", "MP3", "x264 5.1", "x264",
			"dvd5", "DVDRip", "RRG", "Xvid", "ICTV", "NL subs", "IPS", "Rel -", "\\*", "720p", "Hindi", "-", "BRRip", 
			"\\(Rel \\)", "\\( Rel \\)", "\\( \\)", "\\(\\)" ]
		for (i in ttr) {
			filmNameClean = filmNameClean.replace(new RegExp(ttr[i],"gi"), "")
		}

		filmNameClean = filmNameClean.replace(/^\s+|\s+$/g, "")
		
		if (filmNameClean=="") {
			toappnode.append("not a movie ?")
			return 
		}

		var imgUrl = chrome.extension.getURL("ajax_loading_small.gif")
		toappnode.append("<img src=\""+imgUrl+"\" />")

		$.ajax({
		  url: "http://www.filmweb.pl/search?"+$.param({q: filmNameClean }),
		  success: function(data) {

			toappnode.empty()
			
			firstFilm = $(data).find("#searchFixCheck").children(":first").find(".searchResultCol_2_wrapper")					
			if (firstFilm.length == 0) {
				toappnode.append("Can't find '"+filmNameClean+"'.")
			} else {
				firstFilm.find("a[href]").each(function() {
					i = this.href.indexOf("/")
					i = this.href.indexOf("/",i+1)
					i = this.href.indexOf("/",i+1)
					this.href = "http://www.filmweb.pl"+this.href.substring(i)
				})
				
				toappnode.append(firstFilm)
			}
		
		  }
		});	
		
	});	
}

$(document).ready(function(){
	getTheFilms()
});
