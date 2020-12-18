//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes(); // to change to get all episodes fetching API
  makePageForEpisodes(allEpisodes);
  addSearchBar();
  search();
}

function addSearchBar() {
	const rootElem = document.getElementById("root");
	const search = document.createElement("div");
	search.id = "searchBar";
	search.innerHTML = `<input type=text></input><p id="selected"></p>`;
	rootElem.insertBefore(search, rootElem.firstChild);
}

function search() {
	document.querySelector("input").addEventListener("input", function(event) {
		let search = event.target.value;
		if (search === "") {
			const allEpisodes = getAllEpisodes(); // to change to get all episodes from local copy
			makePageForEpisodes(allEpisodes);
			let selected = document.querySelector("#selected");
			selected.innerHTML = "";
		} else {
			const allEpisodes = getAllEpisodes(); // to change to get all episodes from local copy
			let newEpisodes = allEpisodes.filter(function(el) {
				return el.name.toLowerCase().includes(search.toLowerCase()) || el.summary.toLowerCase().includes(search.toLowerCase())
			})
			let selected = document.querySelector("#selected");
			selected.innerHTML = `Displaying ${newEpisodes.length}/${allEpisodes.length} episodes`;
			console.log(newEpisodes.length);
			makePageForEpisodes(newEpisodes);
		}
	})
}

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
	let episodeCode = `S${String(el.season).padStart(2, '0')}E${String(el.number).padStart(2, '0')}`
	str += `<section id=${episodeCode}>
			<div class="title"><h4>${episodeCode} - ${el.name}</h4></div>
			<img src=${el.image.medium}>
			<article>${el.summary}</article>
			</section>`;
  })
  episodes.innerHTML = str;
  rootElem.append(episodes);
}



window.onload = setup;
