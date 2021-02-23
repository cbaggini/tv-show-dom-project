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
    let image = seriesList[i].image
      ? seriesList[i].image.medium.replace("http", "https")
      : "http://via.placeholder.com/210x295/0000FF/808080/?Text=Image%20not%20available";
    let summary = seriesList[i].summary
      ? seriesList[i].summary
      : "<p>Summary not available</p>";
    // Add style="display: none;" for infinite scroll
    str += `<section class="seriesClass" id="https://api.tvmaze.com/shows/${
      seriesList[i].id
    }/episodes" style="background-color: rgb(80, 80, 80);">
			<div class="seriesTitle"><h1>${seriesList[i].name}</h1></div>
			<div class="seriesDescription">
				<img class="seriesImage" src=${image}>
				<article class="seriesArticle"><p>${summary}</p><i class="fa fa-heart-o" onclick="toggleLike()" style="font-size:24px;"></i></article>
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
  let img = document.querySelectorAll(".seriesImage");
  for (let i = 0; i < img.length; i++) {
    if (
      img[i].src.slice(0, 14) === "https://static" &&
      img[i].parentElement.parentElement.style.backgroundColor ===
        `rgb(80, 80, 80)`
    ) {
      let c1 = (Math.random() * 255 + 255) / 2;
      let c2 = (Math.random() * 255 + 255) / 2;
      let c3 = (Math.random() * 255 + 255) / 2;
      img[
        i
      ].parentElement.parentElement.style.backgroundColor = `rgb(${c1},${c2},${c3})`;
    }
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
  document.getElementById("alphabetic").addEventListener("change", function () {
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
  });
}

// Add event listener to sort series by rating
function ratingSort(seriesList) {
  document.getElementById("rating").addEventListener("change", function () {
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
  });
}

// Search series
function addSeriesSearchFunction(seriesList) {
  document
    .querySelector("#seriesSearchInput")
    .addEventListener("input", function (event) {
      let search = event.target.value;
      let series = document.querySelectorAll(".seriesClass");
      if (search === "") {
        for (let i = 0; i < series.length; i++) {
          series[i].style.display = "flex";
        }
        loadSeriesFilter(seriesList);
        let selected = document.querySelector("#selectedSeries");
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
        let selected = document.querySelector("#selectedSeries");
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
