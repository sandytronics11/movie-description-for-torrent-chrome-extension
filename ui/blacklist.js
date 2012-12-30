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
		that.myBL.load(function() {
			that.buildBlacklistGUI();
		});
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
	anchor.append("<div id='" + this.myBL.name + "_list'></div>");
}

BlacklistGUI.prototype.enableSaveAndDiscardBtns = function(really) {
	if (really) {
		this.discardBtn.show();
		this.saveBtn.show();
	} else {
		this.discardBtn.hide();
		this.saveBtn.hide();
	}
};

BlacklistGUI.prototype.buildBlacklistGUI = function() {

	myOPT.opts.IMDB.Mark_movies_with_rating_greater_or_equal_than = "10";
	myOPT.opts.FilmWeb.Mark_movies_with_rating_greater_or_equal_than = "10";

	var that = this;
	var nTable = $("<table></table>");
	nTable.append($("<tr></tr>"));
	var className = this.myBL.name;
	for ( var i in this.myBL.mblacklist.movies) {
		var nRow = $("<tr></tr>");
		var cleanedTitle = this.myBL.mblacklist.movies[i];
		var colMovie = $("<td>" + this.myBL.stringify(cleanedTitle) + "</td>");
		var resurrectBtn = $("<button name='" + i + "'>resurrect</button>");
		resurrectBtn.click(function() {
			var id = this.name;
			delete that.myBL.mblacklist.movies[id];
			$("#" + className + "_" + id).hide(500);
			that.enableSaveAndDiscardBtns(true);
		});
		if (myOPT.opts.Blacklist.Display_movie_descryption) {
			colMovie.append("<br/>");
			colMovie.append(resurrectBtn);
		}

		nRow.attr('id', className + "_" + i);
		nRow.append($("<td>#" + (1 + parseInt(i)) + "</td>"));
		nRow.append(colMovie);

		if (myOPT.opts.Blacklist.Display_movie_descryption) {
			if (myOPT.opts.FilmWeb.Integrate_with_FilmWeb) {
				var filmwebNode = $("<td id='" + className + "_filmweb_" + i + "'>" + getAjaxIcon() + "</td>");
				nRow.append(filmwebNode);
			}
			if (myOPT.opts.IMDB.Integrate_with_IMDB) {
				var imdbNode = $("<td id='" + className + "_imdb_" + i + "'>" + getAjaxIcon() + "</td>");
				nRow.append(imdbNode);
			}
		}else{
			nRow.append(resurrectBtn);
		}
		nTable.append(nRow);
	}

	$('#' + className + "_list").empty().append(nTable).append(
			"Approx total days (24h) ~ " + (1.5 * this.myBL.mblacklist.movies.length) / 24.0);

	if (myOPT.opts.Blacklist.Display_movie_descryption) {
		for ( var i in this.myBL.mblacklist.movies) {
			var cleanedTitle = this.myBL.mblacklist.movies[i];
			if (myOPT.opts.FilmWeb.Integrate_with_FilmWeb) {
				addFilmwebCell($('#' + className + '_filmweb_' + i), cleanedTitle);
			}
			if (myOPT.opts.IMDB.Integrate_with_IMDB) {
				addIMDBCell($('#' + className + '_imdb_' + i), cleanedTitle);
			}
		}
	}

	this.enableSaveAndDiscardBtns(false);
};

$(document).ready(function() {

	afterLoad(function() {
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

});