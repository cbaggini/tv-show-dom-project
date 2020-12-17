//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  let str = '';
  episodeList.forEach(function (el) {
	let episodeCode = `S${String(el.season).padStart(2, '0')}E${String(el.number).padStart(2, '0')}`
	str += `<section>
			<div class="title"><h3>${episodeCode} - ${el.name}</h3></div>
			<img src=${el.image.medium}>
			<article>${el.summary}</article>
			</section>`;
  })
  rootElem.innerHTML = str;
}

window.onload = setup;
