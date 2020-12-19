//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes(); // to change to get all episodes fetching API
  makePageForEpisodes(allEpisodes);
  search(allEpisodes);
  loadFilter(allEpisodes);
  filterEpisode(allEpisodes);
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
	str += `<section id=${episodeCode}>
			<div class="title"><h4>${episodeCode} - ${el.name}</h4></div>
			<img src=${el.image.medium}>
			<article>${el.summary}</article>
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

// Create dropdown menu
function loadFilter(episodeList) {
	let str = "";
	episodeList.forEach(function(el) {
		let episodeCode = `S${String(el.season).padStart(2, '0')}E${String(el.number).padStart(2, '0')}`;
		str += `<option value=${episodeCode}>${episodeCode} - ${el.name}</option>`
	})
	document.querySelector("#episodeFilter").innerHTML += str;
}


window.onload = setup;
