// Setup initial view (series list)
async function setup() {
  let seriesList = await fetchData("https://api.tvmaze.com/shows?page=0");
  seriesList = Series.nameSort(seriesList);
  Series.loadSeriesView(seriesList);
  history.pushState({ page_id: "series" }, null, "series");
  document.getElementById("alphabetic").checked = true;
}

// Fetch data from api
async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = response.json();
    console.log(`You queried the API at ${Date()}`);
    return data;
  } catch (err) {
    console.log(err);
  }
}

window.onpopstate = function () {
  if (document.location.pathname === "/episodes") {
    document.getElementById("seriesSearchBar").style.display = "flex";
    document.getElementById("series").style.display = "flex";
    document.getElementById("searchBar").style.display = "none";
    document.getElementById("eps").style.display = "none";
    history.pushState({ page_id: "series" }, null, "series");
  }
};

window.onload = setup;
