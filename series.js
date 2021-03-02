// Global variables referring to event listeners functions (sort by name and sort by rating)
let nameHandler;
let ratingHandler;

let Series = {
  // Load series view
  loadSeriesView: function (seriesList) {
    const rootElem = document.getElementById("root");
    rootElem.innerHTML = "";
    const oldCredits = document.getElementById("credits");
    if (oldCredits) {
      oldCredits.remove();
    }
    Series.makePageForShows(seriesList);
    Episodes.addEpisodeClick("seriesClass");
    Series.createSeriesSearchBar(seriesList);
    Series.addSeriesSearchFunction(seriesList);
    Series.addColor();
  },

  // Load series list
  makePageForShows: function (seriesList) {
    const rootElem = document.getElementById("root");
    const oldSeries = document.getElementById("series");
    if (oldSeries) {
      oldSeries.remove();
    }
    const series = document.createElement("div");
    series.id = "series";
    let str = "";
    for (let i = 0; i < seriesList.length; i++) {
      str += Series.makeSeries(seriesList[i], i);
    }
    series.innerHTML = str;
    rootElem.append(series);
  },

  // Create HTML for one series
  makeSeries: function (series, index) {
    // Give default value for image, runtime and summary if not present
    let image = series.image
      ? series.image.medium
      : "https://via.placeholder.com/210x295/0000FF/808080/?Text=Image%20not%20available";
    let summary = series.summary
      ? series.summary
      : "<p>Summary not available</p>";
    let runtime = series.runtime || "Unavailable";
    return `<section class="seriesClass" id="${series.id}" order="${index + 1}">
			<div class="seriesTitle"><h1>${series.name}</h1></div>
			<div class="seriesDescription">
				<img class="seriesImage" src=${image}>
				<article class="seriesArticle"><p>${summary}</p><i class="fa fa-heart-o" onclick="Series.toggleLike(event)" style="font-size:24px;"></i></article>
				<aside>
					<p><strong>Rated:&nbsp;</strong>${series.rating.average}</p>
					<p><strong>Genres:&nbsp;</strong>${series.genres.join(" | ")}</p>
					<p><strong>Status:&nbsp;</strong>${series.status}</p>
					<p><strong>Runtime:&nbsp;</strong>${runtime}</p>
				</aside>
			</div>
			</section>`;
  },

  // Like/unlike show
  toggleLike: function (e) {
    e.stopPropagation();
    if (e.target.className === "fa fa-heart-o") {
      e.target.className = "fa fa-heart";
    } else {
      e.target.className = "fa fa-heart-o";
    }
  },

  // Add background color to series div
  addColor: function () {
    let series = document.querySelectorAll(".seriesClass");
    for (let i = 0; i < series.length; i++) {
      let c1 = (Math.random() * 255 + 255) / 2;
      let c2 = (Math.random() * 255 + 255) / 2;
      let c3 = (Math.random() * 255 + 255) / 2;
      series[i].style.backgroundColor = `rgb(${c1},${c2},${c3})`;
    }
  },

  // Create search bar for series
  createSeriesSearchBar: function (seriesList) {
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
    Series.loadSeriesFilter(seriesList);
    Series.filterSeries();
    Series.alphabeticSort(seriesList);
    Series.ratingSort(seriesList);
  },

  // Add event listener to sort series by name
  alphabeticSort: function (seriesList) {
    let targetEl = document.getElementById("alphabetic");
    if (nameHandler) {
      targetEl.removeEventListener("change", nameHandler);
    }
    nameHandler = Series.sortByName.bind(null, seriesList);
    targetEl.addEventListener("change", nameHandler);
  },

  // function to rearrange series by name
  sortByName: function (seriesList) {
    document.getElementById("alphabetic").checked = true;
    document.getElementById("rating").checked = false;
    seriesList = Series.nameSort(seriesList);
    for (let i = 0; i < seriesList.length; i++) {
      document.getElementById(seriesList[i].id).style.order = `${i + 1}`;
    }
    Series.loadSeriesFilter(seriesList);
  },

  // function to sort series by name
  nameSort: function (arr) {
    return arr.sort((a, b) => {
      if (a.name.toLowerCase() > b.name.toLowerCase()) {
        return 1;
      } else if (a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1;
      } else {
        return 0;
      }
    });
  },

  // Add event listener to sort series by rating
  ratingSort: function (seriesList) {
    let targetEl = document.getElementById("rating");
    if (ratingHandler) {
      targetEl.removeEventListener("change", ratingHandler);
    }
    ratingHandler = Series.sortByRating.bind(null, seriesList);
    targetEl.addEventListener("change", ratingHandler);
  },

  // Function to arrange series by rating
  sortByRating: function (seriesList) {
    document.getElementById("alphabetic").checked = false;
    document.getElementById("rating").checked = true;
    seriesList = Series.ratingSortArr(seriesList);
    for (let i = 0; i < seriesList.length; i++) {
      document.getElementById(seriesList[i].id).style.order = `${i + 1}`;
    }
    Series.loadSeriesFilter(seriesList);
  },

  // Function to sort series by rating
  ratingSortArr: function (arr) {
    return arr.sort((a, b) => a.rating.average < b.rating.average);
  },

  // Search series
  addSeriesSearchFunction: function (seriesList) {
    document
      .querySelector("#seriesSearchInput")
      .addEventListener("input", function (event) {
        let search = event.target.value;
        let series = document.querySelectorAll(".seriesClass");
        let selected = document.querySelector("#selectedSeries");
        let filteredSeries;
        // If nothing in search input, show all series
        if (search === "") {
          filteredSeries = seriesList;
        } else {
          // Make all shows invisible
          for (let i = 0; i < series.length; i++) {
            series[i].style.display = "none";
          }
          // Filter complete series list
          filteredSeries = seriesList.filter(function (el) {
            return (
              (el.name
                ? el.name.toLowerCase().includes(search.toLowerCase())
                : false) ||
              (el.summary
                ? el.summary.toLowerCase().includes(search.toLowerCase())
                : false)
            );
          });
        }
        // Sort filtered series list depending on which sorting method is currently selected
        if (document.getElementById("rating").checked === true) {
          filteredSeries = Series.ratingSortArr(filteredSeries);
        } else {
          filteredSeries = Series.nameSort(filteredSeries);
        }
        // Alter order of selected shows and make them visible
        for (let i = 0; i < filteredSeries.length; i++) {
          let el = document.getElementById(filteredSeries[i].id);
          el.style.order = `${i + 1}`;
          el.style.display = "flex";
        }
        Series.loadSeriesFilter(seriesList);
        selected.innerHTML = `found ${filteredSeries.length} shows`;
        Series.alphabeticSort(seriesList);
        Series.ratingSort(seriesList);
      });
  },

  // Filter series
  filterSeries: function () {
    document
      .querySelector("#seriesFilter")
      .addEventListener("change", function (e) {
        const selectedSeriesLink = e.currentTarget.value;
        const color = document.getElementById(`${selectedSeriesLink}`).style
          .backgroundColor;
        const seriesName = document.getElementById(`${selectedSeriesLink}`)
          .children[0].innerText;
        Episodes.loadEpisodeView(selectedSeriesLink, color, seriesName);
      });
  },

  // Create dropdown menu for series
  loadSeriesFilter: function (seriesList) {
    let str = "";
    for (let i = 0; i < seriesList.length; i++) {
      str += `<option value= "${seriesList[i].id}">${seriesList[i].name}</option>`;
    }
    document.querySelector("#seriesFilter").innerHTML = str;
  },
};
