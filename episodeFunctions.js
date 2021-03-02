// When user clicks on series, they will go to episode view
function addEpisodeClick(className) {
  let seriesList = document.querySelectorAll(`.${className}`);
  for (let i = 0; i < seriesList.length; i++) {
    seriesList[i].addEventListener("click", function () {
      let series = seriesList[i].id;
      let color = seriesList[i].style.backgroundColor;
      let seriesName = seriesList[i].children[0].innerText;
      loadEpisodeView(series, color, seriesName);
      history.pushState(null, null, "episodes");
    });
  }
}

// Load episode view
async function loadEpisodeView(series, color, seriesName) {
  const seriesView = document.getElementById("series");
  seriesView.style.display = "none";
  // If credits already present, remove them
  const oldCredits = document.getElementById("credits");
  if (oldCredits) {
    oldCredits.remove();
  }
  const seriesSearch = document.getElementById("seriesSearchBar");
  seriesSearch.style.display = "none";
  createSearchBar();
  // If episode view for that show already stored in session, use that, otherwise call API
  if (
    sessionStorage.getItem(
      `https://api.tvmaze.com/shows/${series}/episodes`
    ) === null
  ) {
    const allEpisodes = await fetchData(
      `https://api.tvmaze.com/shows/${series}/episodes`
    );
    sessionStorage.setItem(
      `https://api.tvmaze.com/shows/${series}/episodes`,
      JSON.stringify(allEpisodes)
    );
    makeEpisodeView(allEpisodes, color, seriesName, series);
  } else {
    let storedEpisodes = JSON.parse(
      sessionStorage.getItem(`https://api.tvmaze.com/shows/${series}/episodes`)
    );
    makeEpisodeView(storedEpisodes, color, seriesName, series);
  }
}

// Create episode page and add episode selector + filter
function makeEpisodeView(allEpisodes, color, seriesName, series) {
  makePageForEpisodes(allEpisodes, color, seriesName, series);
  addSearchFunction();
  loadFilter(allEpisodes);
  filterEpisode();
  addCast(series, color);
  history.pushState(null, null, "episodes");
}

// Create search bar for episodes
function createSearchBar() {
  // If a search bar is already present, remove it
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
			<p id="selected"></p>`;
  rootElem.insertBefore(searchBar, rootElem.firstChild);
  backToSeries();
}

// Add event listener to back button
function backToSeries() {
  document.querySelector("#backBtn").addEventListener("click", function () {
    document.querySelector(".episodes").remove();
    document.getElementById("searchBar").remove();
    const seriesView = document.getElementById("series");
    seriesView.style.display = "flex";
    const seriesSearch = document.getElementById("seriesSearchBar");
    seriesSearch.style.display = "flex";
    history.pushState(null, null, "series");
  });
}

// Search episodes
function addSearchFunction() {
  document
    .querySelector("#searchInput")
    .addEventListener("input", function (event) {
      let search = event.target.value;
      let episodes = document.querySelectorAll(".episodeSection");
      let selected = document.querySelector("#selected");
      document
        .querySelectorAll(".paginationBtn")
        .forEach((el) => (el.style.border = "none"));
      // If nothing in search bar, show season 1 by default
      if (search === "") {
        for (let i = 0; i < episodes.length; i++) {
          if (episodes[i].id.includes("S01")) {
            episodes[i].style.display = "block";
          } else {
            episodes[i].style.display = "none";
          }
        }
        selected.innerHTML = "";
        document.getElementById("01").style.border = "1px solid black";
      } else {
        let newEpisodes = [...episodes].filter(function (el) {
          return el.innerText.toLowerCase().includes(search.toLowerCase());
        });
        selected.innerHTML = `Displaying ${newEpisodes.length}/${episodes.length} episodes`;
        for (let i = 0; i < episodes.length; i++) {
          if (newEpisodes.includes(episodes[i])) {
            episodes[i].style.display = "block";
          } else {
            episodes[i].style.display = "none";
          }
        }
      }
    });
}

// Read more function
function readMore() {
  let lnk = event.target;
  lnk.style.display = "none";
  let section = lnk.parentNode;
  let readLess = section.children[5];
  readLess.style.display = "block";
  let span = section.children[4];
  section.children[2].innerHTML = `<p>${
    section.children[2].innerText + span.innerText
  }</p>`;
}

// Read less function
function readLess() {
  let lnk = event.target;
  lnk.style.display = "none";
  let section = lnk.parentNode;
  let readMore = section.children[3];
  readMore.style.display = "block";
  let article = section.children[2];
  let maxLength = 200;
  article.innerHTML = `<p>${article.innerText.slice(
    0,
    article.innerText.indexOf(" ", maxLength)
  )}</p>`;
}

// Load episodes
function makePageForEpisodes(episodeList, color, seriesName, series) {
  const rootElem = document.getElementById("root");
  // If episode view already exists, remove it
  const existingEpisodes = document.querySelector(".episodes");
  if (existingEpisodes) {
    existingEpisodes.remove();
  }
  const episodes = document.createElement("div");
  episodes.classList = "episodes";
  // Create page title and cast listing div
  let str = `<h1>${seriesName}</h1> <article class="cast"></article>`;
  // Make array of seasons and create pagination buttons to only show selected season
  const uniqueSeries = episodeList
    .map((el) => String(el.season).padStart(2, "0"))
    .filter((value, index, arr) => arr.indexOf(value) === index);
  str += `<div class="paginate">`;
  for (let i = 0; i < uniqueSeries.length; i++) {
    str += `<button type="button" class="paginationBtn" 
	style="background-color: ${color}; border: 1px solid ${color}" 
	id="${uniqueSeries[i]}">Series ${uniqueSeries[i]}</button>`;
  }
  str += "</div>";
  // Add episodes HTML to page
  const maxLength = 200;
  for (let i = 0; i < episodeList.length; i++) {
    str += createEpisode(episodeList[i], maxLength, series);
  }
  episodes.innerHTML = str;
  rootElem.append(episodes);
  addComments(series, color);
  showSelectedSeason(uniqueSeries, color);
}

// Create HTML for a single episode
function createEpisode(episode, maxLength, seriesId) {
  let str = "";
  let episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(
    episode.number
  ).padStart(2, "0")}`;
  // Assign default values to image and summary if they are not present
  let image = episode.image
    ? episode.image.medium
    : "https://via.placeholder.com/250x140/0000FF/808080/?Text=Image%20not%20available";
  let summary = episode.summary
    ? episode.summary
    : "<p>Summary not available</p>";
  // Create HTML for episode section
  str += `<section id=${episodeCode} class="episodeSection">
			<div class="title"><h4>${episodeCode} - ${episode.name}</h4></div>
			<img class="episodeImage" src=${image}>`;
  // If episode summary is longer than maxLength characters, put a read more button at the bottom of episode summary
  if (summary.length <= maxLength) {
    str += `<article class="episodeArticle">${summary}</article>`;
  } else {
    str += `<article class="episodeArticle">${summary.slice(
      0,
      summary.indexOf(" ", maxLength)
    )}</article>
			<p class="read" onclick="readMore()">Read more</p>
			<span style="display: none;">${summary.slice(
        summary.indexOf(" ", maxLength)
      )}</span>
			<p class="read" onclick="readLess()" style="display: none;">Read less</p>`;
  }
  // Check if comments already stored in session storage; if they are, render them
  if (sessionStorage.getItem(`${seriesId}${episodeCode}`) !== null) {
    let obj = JSON.parse(sessionStorage.getItem(`${seriesId}${episodeCode}`));
    str += '<p class="episodeComment"><strong>Comments:</strong></p>';
    for (let i = 0; i < obj.length; i++) {
      str += `<p class="episodeComment">${obj[i]}</p>`;
    }
  }
  // Add buttons and textbox to add new comments
  str += `<button class="commentEpisode">Add comment</button>
			<div class="newComment" style="display: none;"><textarea></textarea><button class="sendComment">Save</button></div>
			</section>`;
  return str;
}

// Add comments
function addComments(series, color) {
  let eps = document.querySelectorAll(".episodeSection");
  for (let i = 0; i < eps.length; i++) {
    eps[i].style.backgroundColor = color;
    eps[i].style.display = "none";
    eps[i].lastElementChild.previousElementSibling.addEventListener(
      "click",
      function () {
        eps[i].lastElementChild.style.display = "flex";
        // Add event listener to save comment button
        eps[i].lastElementChild.lastElementChild.addEventListener(
          "click",
          function (e) {
            eps[i].lastElementChild.style.display = "none";
            let txt = e.target.previousElementSibling.value;
            // If comment is not empty, save it to session storage and render it on the page
            if (txt.length > 0) {
              let comment = document.createElement("p");
              comment.classList = "episodeComment";
              comment.innerText = txt;
              let episodeCode = eps[i].id;
              // If no other comments saved in session storage, create new comment array
              if (sessionStorage.getItem(`${series}${episodeCode}`) === null) {
                let commentArray = [txt];
                sessionStorage.setItem(
                  `${series}${episodeCode}`,
                  JSON.stringify(commentArray)
                );
                let commentTitle = document.createElement("p");
                commentTitle.classList = "episodeComment";
                commentTitle.innerHTML = "<strong>Comments:</strong>";
                eps[i].insertBefore(
                  commentTitle,
                  eps[i].lastElementChild.previousElementSibling
                );
              } else {
                let obj = JSON.parse(
                  sessionStorage.getItem(`${series}${episodeCode}`)
                );
                obj.push(txt);
                sessionStorage.setItem(
                  `${series}${episodeCode}`,
                  JSON.stringify(obj)
                );
              }
              eps[i].insertBefore(
                comment,
                eps[i].lastElementChild.previousElementSibling
              );
              e.target.previousElementSibling.value = "";
            }
          }
        );
      }
    );
  }
}

// Show only selected season
function showSelectedSeason(uniqueSeries, color) {
  document.querySelector("#searchBar").style.backgroundColor = color;
  let season1 = document.querySelectorAll(`[id^="S01"]`);
  document.querySelector(".paginationBtn").style.border = "1px solid black";
  // Show season 1 when episode view loads
  for (let i = 0; i < season1.length; i++) {
    season1[i].style.display = "block";
  }
  // Add event listener to select the season to make visible
  for (let i = 0; i < uniqueSeries.length; i++) {
    document
      .getElementById(`${uniqueSeries[i]}`)
      .addEventListener("click", function (e) {
        document
          .querySelectorAll(".paginationBtn")
          .forEach((el) => (el.style.border = "none"));
        e.target.style.border = "1px solid black";
        let eps = document.querySelectorAll(".episodeSection");
        for (let i = 0; i < eps.length; i++) {
          eps[i].style.display = "none";
        }
        let episodeSeason = document.querySelectorAll(
          `[id^="S${uniqueSeries[i]}"]`
        );
        for (let i = 0; i < episodeSeason.length; i++) {
          episodeSeason[i].style.display = "block";
        }
        // Remove any existing episode search
        let selected = document.querySelector("#selected");
        selected.innerHTML = "";
        document.querySelector("input").value = "";
      });
  }
}

// Filter episodes
function filterEpisode() {
  document
    .querySelector("#episodeFilter")
    .addEventListener("change", function (e) {
      let selectedEpisode = e.currentTarget.value;
      let episodes = document.querySelectorAll(".episodeSection");
      document
        .querySelectorAll(".paginationBtn")
        .forEach((el) => (el.style.border = "none"));
      // If no episodes selected, show season 1
      if (selectedEpisode === "allEpisodes") {
        document.getElementById("01").style.border = "1px solid black";
        for (let i = 0; i < episodes.length; i++) {
          if (episodes[i].id.includes("S01")) {
            episodes[i].style.display = "block";
          } else {
            episodes[i].style.display = "none";
          }
        }
      } else {
        // Remove any existing episode search
        let selected = document.querySelector("#selected");
        selected.innerHTML = "";
        document.querySelector("input").value = "";
        // Show selected episode
        let showEpisode = document.querySelector(`#${selectedEpisode}`);
        for (let i = 0; i < episodes.length; i++) {
          episodes[i].style.display = "none";
        }
        showEpisode.style.display = "block";
      }
    });
}

// Create dropdown menu for episodes
function loadFilter(episodeList) {
  let str = '<option value="allEpisodes">See all episodes</option>';
  for (let i = 0; i < episodeList.length; i++) {
    let episodeCode = `S${String(episodeList[i].season).padStart(
      2,
      "0"
    )}E${String(episodeList[i].number).padStart(2, "0")}`;
    str += `<option value=${episodeCode}>${episodeCode} - ${episodeList[i].name}</option>`;
  }
  document.querySelector("#episodeFilter").innerHTML = str;
}
