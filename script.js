// Setup initial view (series list)
function setup() {
  let seriesList = getAllShows();
  seriesList = seriesList.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)); 
  loadSeriesView(seriesList);
  document.getElementById("alphabetic").checked = true;
}

// Get average color of image to set div background
function get_average_rgb(img) {
    var context = document.createElement('canvas').getContext('2d');
    if (typeof img == 'string') {
        var src = img;
        img = new Image;
        img.setAttribute('crossOrigin', ''); 
		img.src = src;
	}
	img.setAttribute('crossOrigin', ''); 
    context.imageSmoothingEnabled = true;
	context.drawImage(img, 0, 0, 1, 1);
    return context.getImageData(0, 0, 1, 1).data.slice(0,3);
}

// Load series view
function loadSeriesView(seriesList) {
	const rootElem = document.getElementById("root");
	rootElem.innerHTML = "";
	makePageForShows(seriesList);
	addColor();
	addEpisodeClick();
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
  for (let i=0; i<seriesList.length; i++) {
	  let image = seriesList[i].image ? seriesList[i].image.medium : "http://via.placeholder.com/210x295/0000FF/808080/?Text=Image%20not%20available";
	  let summary = seriesList[i].summary ? seriesList[i].summary : "<p>Summary not available</p>";
	  str += `<section class="seriesClass" id="https://api.tvmaze.com/shows/${seriesList[i].id}/episodes">
			<div class="seriesTitle"><h1>${seriesList[i].name}</h1></div>
			<div class="seriesDescription">
				<img src=${image}>
				<article class="seriesArticle">${summary}</article>
				<aside>
					<p><strong>Rated:&nbsp;</strong>${seriesList[i].rating.average}</p>
					<p><strong>Genres:&nbsp;</strong>${seriesList[i].genres.join(" | ")}</p>
					<p><strong>Status:&nbsp;</strong>${seriesList[i].status}</p>
					<p><strong>Runtime:&nbsp;</strong>${seriesList[i].runtime}</p>
				</aside>
			</div>
			</section>`;
  }
  series.innerHTML = str;
  rootElem.append(series);
}

// Add background color to series div
function addColor() {
	let img = document.querySelectorAll("img");
	for (let i=0; i<img.length; i++) {
		if (img[i].src.slice(0,13) === "http://static") {
			let color = get_average_rgb(img[i]);
			let c1 = color[0] + 80 <= 255 ? color[0] + 80 : 255;
			let c2 = color[1] + 80 <= 255 ? color[1] + 80 : 255;
			let c3 = color[2] + 80 <= 255 ? color[2] + 80 : 255;
			color = [c1,c2,c3];
			img[i].parentElement.parentElement.style.backgroundColor = `rgb(${c1},${c2},${c3})`
		}
	}
}

// When user clicks on series, they will go to episode view
function addEpisodeClick() {
	let seriesList = document.querySelectorAll(".seriesClass");
	for (let i=0; i<seriesList.length; i++) {
		seriesList[i].addEventListener("click", function() {
			let series = seriesList[i].id;
			let color = seriesList[i].style.backgroundColor;
			let seriesName = seriesList[i].children[0].innerText;
			loadEpisodeView(series, color, seriesName);
		})	
	}
}

// Load episode view
function loadEpisodeView(series, color, seriesName) {
	const seriesView = document.getElementById("series");
	seriesView.style.display = "none";
	const seriesSearch = document.getElementById("seriesSearchBar");
	seriesSearch.style.display = "none";
	createSearchBar();
	fetchData(series).then(allEpisodes => {	
		makePageForEpisodes(allEpisodes, color, seriesName);
		addSearchFunction();
		loadFilter(allEpisodes);
		filterEpisode();
	})
}

// Create search bar for episodes
function createSearchBar() {
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
			<select name="series" id="seriesFilter"></select>
			<input type="radio" id="alphabetic" name="sort" value="alphabetic">
			<label for="alphabetic">Sort by name</label><br>
			<input type="radio" id="rating" name="sort" value="rating">
			<label for="rating">Sort by rating</label> `			
	rootElem.insertBefore(searchBar, rootElem.firstChild);
	loadSeriesFilter(seriesList);
	filterSeries();
	alphabeticSort(seriesList);
	ratingSort(seriesList);
}

// Add event listener to sort series by name
function alphabeticSort(seriesList) {
	document.getElementById("alphabetic").addEventListener("change", function() {
		document.getElementById("alphabetic").checked = true;
		document.getElementById("rating").checked = false;
		seriesList = seriesList.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)); 
		for (let i=0; i<seriesList.length; i++) {
			document.getElementById(`https://api.tvmaze.com/shows/${seriesList[i].id}/episodes`).style.order = `${i + 1}`;
		}
		loadSeriesFilter(seriesList);
	})
}

// Add event listener to sort series by rating
function ratingSort(seriesList) {
	document.getElementById("rating").addEventListener("change", function() {
		document.getElementById("alphabetic").checked = false;
		document.getElementById("rating").checked = true;
		seriesList = seriesList.sort((a,b) => (a.rating.average < b.rating.average) ? 1 : ((b.rating.average < a.rating.average) ? -1 : 0)); 
		for (let i=0; i<seriesList.length; i++) {
			document.getElementById(`https://api.tvmaze.com/shows/${seriesList[i].id}/episodes`).style.order = `${i + 1}`;
		}
		loadSeriesFilter(seriesList);
	})
}

// Search series
function addSeriesSearchFunction(seriesList) {
	document.querySelector("#seriesSearchInput").addEventListener("input", function(event) {
		let search = event.target.value;
		let series = document.querySelectorAll(".seriesClass");
		if (search === "") {
			for (let i=0; i<series.length; i++) {
				series[i].style.display = "flex";
			}
			loadSeriesFilter(seriesList);
			let selected = document.querySelector("#selectedSeries");
			selected.innerHTML = `found ${seriesList.length} shows`;
			alphabeticSort(seriesList);
			ratingSort(seriesList);
		} else {
			for (let i=0; i<series.length; i++) {
				series[i].style.display = "none";
			}
			let newSeriesList = seriesList.filter(function(el) {
				return (el.name ? el.name.toLowerCase().includes(search.toLowerCase()) : false) || (el.summary ? el.summary.toLowerCase().includes(search.toLowerCase()) : false)
			})
			let selected = document.querySelector("#selectedSeries");
			selected.innerHTML = `found ${newSeriesList.length} shows`;
			if (document.getElementById("rating").checked === true) {
				newSeriesList = newSeriesList.sort((a,b) => (a.rating.average < b.rating.average) ? 1 : ((b.rating.average < a.rating.average) ? -1 : 0));
			} else {
				newSeriesList = newSeriesList.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)); 
			}
			for (let i=0; i<newSeriesList.length; i++) {
				let el = document.getElementById(`https://api.tvmaze.com/shows/${newSeriesList[i].id}/episodes`)
				el.style.order = `${i + 1}`;
				el.style.display = "flex";
			}
			loadSeriesFilter(newSeriesList);
			alphabeticSort(newSeriesList);
			ratingSort(newSeriesList);
		}
	})
}

// Add event listener to back button
function backToSeries() {
	document.querySelector("#backBtn").addEventListener("click", function() {
		document.querySelector(".episodes").remove();
		document.getElementById("searchBar").remove();
		const seriesView = document.getElementById("series");
		seriesView.style.display = "flex";
		const seriesSearch = document.getElementById("seriesSearchBar");
		seriesSearch.style.display = "flex";
	})	
}

// Fetch data from api
async function fetchData(url){
	let result;
	await fetch(url)
		.then(response => response.json())
		.then(data => JSON.stringify(data))
		.then(data => JSON.parse(data))
		.then(data => result = data)
		.catch(error => console.log(error));
	console.log(`You queried the API at ${Date()}`);
	return result;
}

// Search episodes
function addSearchFunction() {
	document.querySelector("#searchInput").addEventListener("input", function(event) {
		let search = event.target.value;
		let episodes = document.querySelectorAll(".episodeSection");
		if (search === "") {
			for (let i=0; i<episodes.length; i++) {
				episodes[i].style.display = "block";
			}
			let selected = document.querySelector("#selected");
			selected.innerHTML = "";
		} else {
			let newEpisodes = [...episodes].filter(function(el) {
				return el.innerText.toLowerCase().includes(search.toLowerCase());
			})
			let selected = document.querySelector("#selected");
			selected.innerHTML = `Displaying ${newEpisodes.length}/${episodes.length} episodes`;
			for (let i=0; i<episodes.length; i++) {
				if (newEpisodes.includes(episodes[i])) {
					episodes[i].style.display = "block";
				} else {
					episodes[i].style.display = "none";
				}
			}
		}
	})
}

// Load episodes
function makePageForEpisodes(episodeList, color, seriesName) {
  const rootElem = document.getElementById("root");
  let existingEpisodes = document.querySelector(".episodes");
  if (existingEpisodes) {
	  existingEpisodes.remove();
  }
  const episodes = document.createElement("div");
  episodes.classList = "episodes";
  let str = `<h1>${seriesName}</h1>`;
  for (let i=0; i<episodeList.length; i++) {
	let episodeCode = `S${String(episodeList[i].season).padStart(2, '0')}E${String(episodeList[i].number).padStart(2, '0')}`;
	let image = episodeList[i].image ? episodeList[i].image.medium : "http://via.placeholder.com/250x140/0000FF/808080/?Text=Image%20not%20available";
	let summary = episodeList[i].summary ? episodeList[i].summary : "<p>Summary not available</p>";
	str += `<section id=${episodeCode} class="episodeSection">
			<div class="title"><h4>${episodeCode} - ${episodeList[i].name}</h4></div>
			<img class="episodeImage" src=${image}>
			<article class="episodeArticle">${summary}</article>
			</section>`;
  }
  episodes.innerHTML = str;
  rootElem.append(episodes);
  let eps = document.querySelectorAll(".episodeSection");
  for (let i=0; i<eps.length; i++) {
	  eps[i].style.backgroundColor = color;
  }
  document.querySelector("#searchBar").style.backgroundColor = color;
}

// Filter episodes
function filterEpisode() {
	document.querySelector("#episodeFilter").addEventListener("change", function(e) {
		let selectedEpisode = e.currentTarget.value;
		let episodes = document.querySelectorAll(".episodeSection");
		if (selectedEpisode === "allEpisodes") {
			for (let i=0; i<episodes.length; i++) {
				episodes[i].style.display = "block";
			}
		} else {
			let selected = document.querySelector("#selected");
			selected.innerHTML = "";
			document.querySelector("input").value = "";
			let showEpisode = document.querySelector(`#${selectedEpisode}`);
			for (let i=0; i<episodes.length; i++) {
				episodes[i].style.display = "none";
			}
			showEpisode.style.display = "block";
		}
	});
}

// Create dropdown menu for episodes
function loadFilter(episodeList) {
	let str = '<option value="allEpisodes">See all episodes</option>';
	for(let i=0; i<episodeList.length; i++) {
		let episodeCode = `S${String(episodeList[i].season).padStart(2, '0')}E${String(episodeList[i].number).padStart(2, '0')}`;
		str += `<option value=${episodeCode}>${episodeCode} - ${episodeList[i].name}</option>`
	}
	document.querySelector("#episodeFilter").innerHTML = str;
}

// Filter series
function filterSeries() {
	document.querySelector("#seriesFilter").addEventListener("change", function(e) {
		const selectedSeriesLink = e.currentTarget.value;
		const color = document.getElementById(`${selectedSeriesLink}`).style.backgroundColor
		const seriesName = document.getElementById(`${selectedSeriesLink}`).children[0].innerText;
		loadEpisodeView(selectedSeriesLink, color, seriesName); 
	});
}

// Create dropdown menu for series
function loadSeriesFilter(seriesList) {
	let str = "";
	for(let i=0; i<seriesList.length; i++) {
		str += `<option value= "https://api.tvmaze.com/shows/${seriesList[i].id}/episodes">${seriesList[i].name}</option>`
	}
	document.querySelector("#seriesFilter").innerHTML = str;
}


window.onload = setup;
