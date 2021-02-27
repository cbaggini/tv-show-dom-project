// Global variables referring to event listeners functions (sort by name and sort by rating)
let nameHandler;
let ratingHandler;

// Load series view
function loadSeriesView(seriesList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";
  const oldCredits = document.getElementById("credits");
  if (oldCredits) {
    oldCredits.remove();
  }
  makePageForShows(seriesList);
  addEpisodeClick("seriesClass");
  createSeriesSearchBar(seriesList);
  addSeriesSearchFunction(seriesList);
  addColor();
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
  let str = "";
  for (let i = 0; i < seriesList.length; i++) {
    str += makeSeries(seriesList[i]);
  }
  series.innerHTML = str;
  rootElem.append(series);
}

// Create div for one series
function makeSeries(series) {
  let image = series.image
    ? series.image.medium
    : "http://via.placeholder.com/210x295/0000FF/808080/?Text=Image%20not%20available";
  let summary = series.summary
    ? series.summary
    : "<p>Summary not available</p>";
  return `<section class="seriesClass" id="https://api.tvmaze.com/shows/${
    series.id
  }/episodes" style="background-color: rgb(80, 80, 80);">
			<div class="seriesTitle"><h1>${series.name}</h1></div>
			<div class="seriesDescription">
				<img class="seriesImage" src=${image}>
				<article class="seriesArticle"><p>${summary}</p><i class="fa fa-heart-o" onclick="toggleLike()" style="font-size:24px;"></i></article>
				<aside>
					<p><strong>Rated:&nbsp;</strong>${series.rating.average}</p>
					<p><strong>Genres:&nbsp;</strong>${series.genres.join(" | ")}</p>
					<p><strong>Status:&nbsp;</strong>${series.status}</p>
					<p><strong>Runtime:&nbsp;</strong>${series.runtime}</p>
				</aside>
			</div>
			</section>`;
}

// Like/unlike show
function toggleLike() {
  event.stopPropagation();
  if (event.target.className === "fa fa-heart-o") {
    event.target.className = "fa fa-heart";
  } else {
    event.target.className = "fa fa-heart-o";
  }
}

// Add background color to series div
function addColor() {
  let series = document.querySelectorAll(".seriesClass");
  for (let i = 0; i < series.length; i++) {
    let c1 = (Math.random() * 255 + 255) / 2;
    let c2 = (Math.random() * 255 + 255) / 2;
    let c3 = (Math.random() * 255 + 255) / 2;
    series[i].style.backgroundColor = `rgb(${c1},${c2},${c3})`;
  }
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
			<label for="alphabetic">
			<input type="radio" id="alphabetic" name="sort" value="alphabetic">
			Sort by name</label><br>
			<label for="rating">
			<input type="radio" id="rating" name="sort" value="rating">
			Sort by rating</label> `;
  rootElem.insertBefore(searchBar, rootElem.firstChild);
  loadSeriesFilter(seriesList);
  filterSeries();
  alphabeticSort(seriesList);
  ratingSort(seriesList);
}

// Add event listener to sort series by name
function alphabeticSort(seriesList) {
  let targetEl = document.getElementById("alphabetic");
  if (nameHandler) {
    targetEl.removeEventListener("change", nameHandler);
  }
  nameHandler = sortByName.bind(null, seriesList);
  targetEl.addEventListener("change", nameHandler);
}

// function to sort series by name
function sortByName(seriesList) {
  document.getElementById("alphabetic").checked = true;
  document.getElementById("rating").checked = false;
  seriesList = seriesList.sort((a, b) =>
    a.name > b.name ? 1 : b.name > a.name ? -1 : 0
  );
  for (let i = 0; i < seriesList.length; i++) {
    document.getElementById(
      `https://api.tvmaze.com/shows/${seriesList[i].id}/episodes`
    ).style.order = `${i + 1}`;
  }
  loadSeriesFilter(seriesList);
}

// Add event listener to sort series by rating
function ratingSort(seriesList) {
  let targetEl = document.getElementById("rating");
  if (ratingHandler) {
    targetEl.removeEventListener("change", ratingHandler);
  }
  ratingHandler = sortByRating.bind(null, seriesList);
  targetEl.addEventListener("change", ratingHandler);
}

// Function to sort series by rating
function sortByRating(seriesList) {
  document.getElementById("alphabetic").checked = false;
  document.getElementById("rating").checked = true;
  seriesList = seriesList.sort((a, b) =>
    a.rating.average < b.rating.average
      ? 1
      : b.rating.average < a.rating.average
      ? -1
      : 0
  );
  for (let i = 0; i < seriesList.length; i++) {
    document.getElementById(
      `https://api.tvmaze.com/shows/${seriesList[i].id}/episodes`
    ).style.order = `${i + 1}`;
  }
  loadSeriesFilter(seriesList);
}

// Search series
function addSeriesSearchFunction(seriesList) {
  document
    .querySelector("#seriesSearchInput")
    .addEventListener("input", function (event) {
      let search = event.target.value;
      let series = document.querySelectorAll(".seriesClass");
      let selected = document.querySelector("#selectedSeries");
      if (search === "") {
        for (let i = 0; i < series.length; i++) {
          series[i].style.display = "flex";
        }
        loadSeriesFilter(seriesList);
        selected.innerHTML = `found ${seriesList.length} shows`;
        alphabeticSort(seriesList);
        ratingSort(seriesList);
      } else {
        for (let i = 0; i < series.length; i++) {
          series[i].style.display = "none";
        }
        let newSeriesList = seriesList.filter(function (el) {
          return (
            (el.name
              ? el.name.toLowerCase().includes(search.toLowerCase())
              : false) ||
            (el.summary
              ? el.summary.toLowerCase().includes(search.toLowerCase())
              : false)
          );
        });
        selected.innerHTML = `found ${newSeriesList.length} shows`;
        if (document.getElementById("rating").checked === true) {
          newSeriesList = newSeriesList.sort((a, b) =>
            a.rating.average < b.rating.average
              ? 1
              : b.rating.average < a.rating.average
              ? -1
              : 0
          );
        } else {
          newSeriesList = newSeriesList.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0
          );
        }
        for (let i = 0; i < newSeriesList.length; i++) {
          let el = document.getElementById(
            `https://api.tvmaze.com/shows/${newSeriesList[i].id}/episodes`
          );
          el.style.order = `${i + 1}`;
          el.style.display = "flex";
        }
        loadSeriesFilter(newSeriesList);
        alphabeticSort(newSeriesList);
        ratingSort(newSeriesList);
      }
    });
}

// Filter series
function filterSeries() {
  document
    .querySelector("#seriesFilter")
    .addEventListener("change", function (e) {
      const selectedSeriesLink = e.currentTarget.value;
      const color = document.getElementById(`${selectedSeriesLink}`).style
        .backgroundColor;
      const seriesName = document.getElementById(`${selectedSeriesLink}`)
        .children[0].innerText;
      loadEpisodeView(selectedSeriesLink, color, seriesName);
    });
}

// Create dropdown menu for series
function loadSeriesFilter(seriesList) {
  let str = "";
  for (let i = 0; i < seriesList.length; i++) {
    str += `<option value= "https://api.tvmaze.com/shows/${seriesList[i].id}/episodes">${seriesList[i].name}</option>`;
  }
  document.querySelector("#seriesFilter").innerHTML = str;
}
