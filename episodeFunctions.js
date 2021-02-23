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
function loadEpisodeView(series, color, seriesName) {
  const seriesView = document.getElementById("series");
  seriesView.style.display = "none";
  const oldCredits = document.getElementById("credits");
  if (oldCredits) {
    oldCredits.remove();
  }
  const seriesSearch = document.getElementById("seriesSearchBar");
  seriesSearch.style.display = "none";
  createSearchBar();
  if (sessionStorage.getItem(series) === null) {
    fetchData(series).then((allEpisodes) => {
      sessionStorage.setItem(series, JSON.stringify(allEpisodes));
      makePageForEpisodes(allEpisodes, color, seriesName, series);
      addSearchFunction();
      loadFilter(allEpisodes);
      filterEpisode();
      addCast(series, color);
      history.pushState(null, null, "episodes");
    });
  } else {
    let storedEpisodes = JSON.parse(sessionStorage.getItem(series));
    makePageForEpisodes(storedEpisodes, color, seriesName, series);
    addSearchFunction();
    loadFilter(storedEpisodes);
    filterEpisode();
    addCast(series, color);
    history.pushState(null, null, "episodes");
  }
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
      if (search === "") {
        for (let i = 0; i < episodes.length; i++) {
          episodes[i].style.display = "none";
        }
        let season1 = document.querySelectorAll(`[id^="S01"]`);
        for (let i = 0; i < season1.length; i++) {
          season1[i].style.display = "block";
        }
        let selected = document.querySelector("#selected");
        selected.innerHTML = "";
      } else {
        let newEpisodes = [...episodes].filter(function (el) {
          return el.innerText.toLowerCase().includes(search.toLowerCase());
        });
        let selected = document.querySelector("#selected");
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
  let existingEpisodes = document.querySelector(".episodes");
  if (existingEpisodes) {
    existingEpisodes.remove();
  }
  const episodes = document.createElement("div");
  episodes.classList = "episodes";
  let str = `<h1>${seriesName}</h1> <article class="cast"></article>`;
  const uniqueSeries = episodeList
    .map((el) => String(el.season).padStart(2, "0"))
    .filter((value, index, arr) => arr.indexOf(value) === index);
  str += `<div class="paginate">`;
  for (let i = 0; i < uniqueSeries.length; i++) {
    str += `<button type="button" class="paginationBtn" style="background-color: ${color}; border: 1px solid ${color}"id="${uniqueSeries[i]}">Series ${uniqueSeries[i]}</button>`;
  }
  str += "</div>";
  for (let i = 0; i < episodeList.length; i++) {
    let episodeCode = `S${String(episodeList[i].season).padStart(
      2,
      "0"
    )}E${String(episodeList[i].number).padStart(2, "0")}`;
    let image = episodeList[i].image
      ? episodeList[i].image.medium
      : "http://via.placeholder.com/250x140/0000FF/808080/?Text=Image%20not%20available";
    let summary = episodeList[i].summary
      ? episodeList[i].summary
      : "<p>Summary not available</p>";
    let maxLength = 200;
    let seriesId = series.slice(29, series.indexOf("/episodes"));
    str += `<section id=${episodeCode} class="episodeSection">
			<div class="title"><h4>${episodeCode} - ${episodeList[i].name}</h4></div>
			<img class="episodeImage" src=${image}>`;
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
    if (sessionStorage.getItem(`${seriesId}${episodeCode}`) !== null) {
      let obj = JSON.parse(sessionStorage.getItem(`${seriesId}${episodeCode}`));
      str += '<p class="episodeComment"><strong>Comments:</strong></p>';
      for (let i = 0; i < obj.length; i++) {
        str += `<p class="episodeComment">${obj[i]}</p>`;
      }
    }
    str += `<button class="commentEpisode">Add comment</button>
			<div class="newComment" style="display: none;"><textarea></textarea><button class="sendComment">Save</button></div>
			</section>`;
  }
  episodes.innerHTML = str;
  rootElem.append(episodes);
  addComments(series, color);
  showSelectedSeason(uniqueSeries, color);
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
        eps[i].lastElementChild.lastElementChild.addEventListener(
          "click",
          function (e) {
            eps[i].lastElementChild.style.display = "none";
            let seriesId = series.slice(29, series.indexOf("/episodes"));
            let txt = e.target.previousElementSibling.value;
            if (txt.length > 0) {
              let comment = document.createElement("p");
              comment.classList = "episodeComment";
              comment.innerText = txt;
              let episodeCode = eps[i].id;
              if (
                sessionStorage.getItem(`${seriesId}${episodeCode}`) === null
              ) {
                let commentArray = [txt];
                sessionStorage.setItem(
                  `${seriesId}${episodeCode}`,
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
                  sessionStorage.getItem(`${seriesId}${episodeCode}`)
                );
                obj.push(txt);
                sessionStorage.setItem(
                  `${seriesId}${episodeCode}`,
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
  for (let i = 0; i < season1.length; i++) {
    season1[i].style.display = "block";
  }
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
      if (selectedEpisode === "allEpisodes") {
        for (let i = 0; i < episodes.length; i++) {
          episodes[i].style.display = "none";
        }
        let season1 = document.querySelectorAll(`[id^="S01"]`);
        for (let i = 0; i < season1.length; i++) {
          season1[i].style.display = "block";
        }
      } else {
        let selected = document.querySelector("#selected");
        selected.innerHTML = "";
        document.querySelector("input").value = "";
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
