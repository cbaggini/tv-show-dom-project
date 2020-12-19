//You can edit ALL of the code here
function setup() {
  //const allEpisodes = getAllEpisodes(); // to change to get all episodes fetching API
  let seriesList = getAllShows();
  seriesList = seriesList.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)); 
  loadSeriesFilter(seriesList);
  filterSeries();
  let series = "https://api.tvmaze.com/shows/82/episodes";
  fetchData(series).then(allEpisodes => {
	makePageForEpisodes(allEpisodes);
	search(allEpisodes);
	loadFilter(allEpisodes);
	filterEpisode(allEpisodes);
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
function search(allEpisodes) {
	document.querySelector("input").addEventListener("input", function(event) {
		let search = event.target.value;
		if (search === "") {
			makePageForEpisodes(allEpisodes);
			let selected = document.querySelector("#selected");
			selected.innerHTML = "";
		} else {
			let newEpisodes = allEpisodes.filter(function(el) {
				return el.name.toLowerCase().includes(search.toLowerCase()) || el.summary.toLowerCase().includes(search.toLowerCase())
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
function filterSeries() {
	document.querySelector("#seriesFilter").addEventListener("change", function(e) {
		const selectedSeriesLink = e.currentTarget.value;
		//console.log(selectedSeriesLink)
		fetchData(selectedSeriesLink).then(allEpisodes => {
			//console.log(allEpisodes)
			makePageForEpisodes(allEpisodes);
			search(allEpisodes);
			loadFilter(allEpisodes);
			filterEpisode(allEpisodes);
		}) 
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
