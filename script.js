//You can edit ALL of the code here
function setup() {
  let seriesList = getAllShows();
  seriesList = seriesList.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)); 
  let series = "https://api.tvmaze.com/shows/82/episodes";
  loadEpisodeView(series, seriesList);
}

// Load episode view
function loadEpisodeView(series, seriesList) {
	createSearchBar(seriesList);
	fetchData(series).then(allEpisodes => {	
		makePageForEpisodes(allEpisodes);
		addSearchFunction(allEpisodes);
		loadFilter(allEpisodes);
		filterEpisode(allEpisodes);
	})
}

// Create search bar
function createSearchBar(seriesList) {
	const oldSearch = document.getElementById("searchBar");
	if (oldSearch) {
		oldSearch.remove();
	}
	const rootElem = document.getElementById("root");
	let searchBar = document.createElement("div");
	searchBar.id = "searchBar";
	searchBar.innerHTML = `<select name="series" id="seriesFilter"></select>
			<select name="episodes" id="episodeFilter"></select>
			<input id="searchInput" type=text placeholder="Your search term here"></input>
			<p id="selected"></p>`
	rootElem.insertBefore(searchBar, rootElem.firstChild);
	loadSeriesFilter(seriesList);
    filterSeries(seriesList);
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
	str += `<section id=${episodeCode}>
			<div class="title"><h4>${episodeCode} - ${el.name}</h4></div>
			<img src=${image}>
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
			document.querySelectorAll("section").forEach(el => el.style.display = "none");
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
	document.querySelector("#seriesFilter").innerHTML += str;
}


window.onload = setup;
