//You can edit ALL of the code here
function setup() {
  let seriesList = getAllShows();
  seriesList = seriesList.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)); 
  loadSeriesView(seriesList);
}

// Load series view
function loadSeriesView(seriesList) {
	const rootElem = document.getElementById("root");
	rootElem.innerHTML = "";
	makePageForShows(seriesList);
	addEpisodeClick(seriesList);
	createSeriesSearchBar(seriesList);
	addSeriesSearchFunction(seriesList);
}

// Load series list
function makePageForShows(seriesList) {
  const rootElem = document.getElementById("root");
  const oldSeries = document.getElementById("series");
  if (oldSeries) {
	  oldSeries.remove();
  }
  const series = document.createElement("div");
  series.id = "series";
  let str = '';
  seriesList.forEach(function (el) {
	let image = el.image ? el.image.medium : "https://via.placeholder.com/250x140/0000FF/808080/?Text=Image%20not%20available";
	let summary = el.summary ? el.summary : "<p>Summary not available</p>";
	str += `<section class="seriesClass" id="https://api.tvmaze.com/shows/${el.id}/episodes">
			<div class="seriesTitle"><h1>${el.name}</h1></div>
			<div class="seriesDescription">
				<img src=${image}>
				<article class="seriesArticle">${summary}</article>
				<aside>
					<p><strong>Rated:&nbsp;</strong>${el.rating.average}</p>
					<p><strong>Genres:&nbsp;</strong>${el.genres.join(" | ")}</p>
					<p><strong>Status:&nbsp;</strong>${el.status}</p>
					<p><strong>Runtime:&nbsp;</strong>${el.runtime}</p>
				</aside>
			</div>
			</section>`;
  })
  series.innerHTML = str;
  rootElem.append(series);
}

// When user clicks on series, they will go to episode view
function addEpisodeClick(seriesList) {
	document.querySelectorAll(".seriesClass").forEach(
		el => el.addEventListener("click", function() {
			let series = el.id;
			loadEpisodeView(series, seriesList);
		})	
	)
}

// Load episode view
function loadEpisodeView(series, seriesList) {
	const seriesView = document.getElementById("series");
	seriesView.style.display = "none";
	const seriesSearch = document.getElementById("seriesSearchBar");
	seriesSearch.style.display = "none";
	createSearchBar(seriesList);
	fetchData(series).then(allEpisodes => {	
		makePageForEpisodes(allEpisodes);
		addSearchFunction(allEpisodes);
		loadFilter(allEpisodes);
		filterEpisode(allEpisodes);
	})
}

// Create search bar for episodes
function createSearchBar(seriesList) {
	const oldSearch = document.getElementById("searchBar");
	if (oldSearch) {
		oldSearch.remove();
	}
	const rootElem = document.getElementById("root");
	let searchBar = document.createElement("div");
	searchBar.id = "searchBar";
	searchBar.innerHTML = `<button id="backBtn">Back to series list</button>
			<select name="episodes" id="episodeFilter"></select>
			<input id="searchInput" type=text placeholder="Your search term here"></input>
			<p id="selected"></p>`
	rootElem.insertBefore(searchBar, rootElem.firstChild);
	backToSeries();
	// loadSeriesFilter(seriesList);
    // filterSeries(seriesList);
}

// Create search bar for series
function createSeriesSearchBar(seriesList) {
	const oldSearch = document.getElementById("seriesSearchBar");
	if (oldSearch) {
		oldSearch.remove();
	}
	const rootElem = document.getElementById("root");
	let searchBar = document.createElement("div");
	searchBar.id = "seriesSearchBar";
	searchBar.innerHTML = `<p>Filtering for </p>
			<input id="seriesSearchInput" type=text placeholder="Your search term here"></input>
			<p id="selectedSeries">found ${seriesList.length} shows</p>
			<select name="series" id="seriesFilter"></select>`			

	rootElem.insertBefore(searchBar, rootElem.firstChild);
	//backToSeries(seriesList);
	loadSeriesFilter(seriesList);
    filterSeries(seriesList);
}

// Search series
function addSeriesSearchFunction(seriesList) {
	document.querySelector("#seriesSearchInput").addEventListener("input", function(event) {
		let search = event.target.value;
		if (search === "") {
			makePageForShows(seriesList);
			addEpisodeClick(seriesList);
			loadSeriesFilter(seriesList);
			let selected = document.querySelector("#selectedSeries");
			selected.innerHTML = `found ${seriesList.length} shows`;
		} else {
			let newSeriesList = seriesList.filter(function(el) {
				return (el.name ? el.name.toLowerCase().includes(search.toLowerCase()) : false) || (el.summary ? el.summary.toLowerCase().includes(search.toLowerCase()) : false)
			})
			let selected = document.querySelector("#selectedSeries");
			selected.innerHTML = `found ${newSeriesList.length} shows`;
			makePageForShows(newSeriesList);
			addEpisodeClick(newSeriesList);
			loadSeriesFilter(newSeriesList);
		}
	})
}

// Add event listener to back button
function backToSeries() {
	document.querySelector("#backBtn").addEventListener("click", function() {
		document.querySelector(".episodes").remove();
		document.getElementById("searchBar").remove();
		const seriesView = document.getElementById("series");
		seriesView.style.display = "block";
		const seriesSearch = document.getElementById("seriesSearchBar");
		seriesSearch.style.display = "flex";
	})	
}

//Fetch episodes
async function fetchData(series){
	let response = await fetch(series);
	let data = await response.json();
	data = JSON.stringify(data);
	data = JSON.parse(data);
	console.log(`You queried the API at ${Date()}`);
	return data;
  }

// Search episodes
function addSearchFunction(allEpisodes) {
	document.querySelector("#searchInput").addEventListener("input", function(event) {
		let search = event.target.value;
		if (search === "") {
			makePageForEpisodes(allEpisodes);
			let selected = document.querySelector("#selected");
			selected.innerHTML = "";
		} else {
			let newEpisodes = allEpisodes.filter(function(el) {
				return (el.name ? el.name.toLowerCase().includes(search.toLowerCase()) : false) || (el.summary ? el.summary.toLowerCase().includes(search.toLowerCase()) : false)
			})
			let selected = document.querySelector("#selected");
			selected.innerHTML = `Displaying ${newEpisodes.length}/${allEpisodes.length} episodes`;
			makePageForEpisodes(newEpisodes);
		}
	})
}

// Load episodes
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  let existingEpisodes = document.querySelector(".episodes");
  if (existingEpisodes) {
	  existingEpisodes.remove();
  }
  const episodes = document.createElement("div");
  episodes.classList = "episodes";
  let str = '';
  episodeList.forEach(function (el) {
	let episodeCode = `S${String(el.season).padStart(2, '0')}E${String(el.number).padStart(2, '0')}`;
	let image = el.image ? el.image.medium : "https://via.placeholder.com/250x140/0000FF/808080/?Text=Image%20not%20available";
	let summary = el.summary ? el.summary : "<p>Summary not available</p>";
	str += `<section id=${episodeCode} class="episodeSection">
			<div class="title"><h4>${episodeCode} - ${el.name}</h4></div>
			<img class="episodeImage" src=${image}>
			<article>${summary}</article>
			</section>`;
  })
  episodes.innerHTML = str;
  rootElem.append(episodes);
}

// Filter episodes
function filterEpisode(allEpisodes) {
	document.querySelector("#episodeFilter").addEventListener("change", function(e) {
		let selectedEpisode = e.currentTarget.value;
		//makePageForEpisodes(selectedEpisode);
		if (selectedEpisode === "allEpisodes") {
			makePageForEpisodes(allEpisodes);
		} else {
			makePageForEpisodes(allEpisodes);
			let selected = document.querySelector("#selected");
			selected.innerHTML = "";
			document.querySelector("input").value = "";
			let showEpisode = document.querySelector(`#${selectedEpisode}`);
			document.querySelectorAll(".episodeSection").forEach(el => el.style.display = "none");
			showEpisode.style.display = "block";
		}
	});
}

// Create dropdown menu for episodes
function loadFilter(episodeList) {
	let str = '<option value="allEpisodes">See all episodes</option>';
	episodeList.forEach(function(el) {
		let episodeCode = `S${String(el.season).padStart(2, '0')}E${String(el.number).padStart(2, '0')}`;
		str += `<option value=${episodeCode}>${episodeCode} - ${el.name}</option>`
	})
	document.querySelector("#episodeFilter").innerHTML = str;
}

// Filter series
function filterSeries(seriesList) {
	document.querySelector("#seriesFilter").addEventListener("change", function(e) {
		const selectedSeriesLink = e.currentTarget.value;
		//console.log(selectedSeriesLink)
		loadEpisodeView(selectedSeriesLink, seriesList); 
	});
}

// Create dropdown menu for series
function loadSeriesFilter(seriesList) {
	let str = "";
	seriesList.forEach(function(el) {
		str += `<option value= "https://api.tvmaze.com/shows/${el.id}/episodes">${el.name}</option>`
	})
	document.querySelector("#seriesFilter").innerHTML = str;
}


window.onload = setup;
