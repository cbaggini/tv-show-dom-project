// Setup initial view (series list)
async function setup() {
  let seriesList = await fetchData("https://api.tvmaze.com/shows?page=0");
  seriesList = Series.nameSort(seriesList);
  Series.loadSeriesView(seriesList);
  history.pushState({ page_id: "series" }, null, "series");
  document.getElementById("alphabetic").checked = true;
  window.path = "/series";
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
  if (window.path === "/episodes") {
    document.getElementById("credits").style.display = "none";
    document.getElementById("seriesSearchBar").style.display = "flex";
    document.getElementById("series").style.display = "flex";
    document.getElementById("searchBar").style.display = "none";
    document.getElementById("eps").style.display = "none";
    history.pushState({ page_id: "series" }, null, "series");
    window.path = "/series";
  } else if (window.path === "/credits") {
    document.getElementById("credits").style.display = "none";
    document.getElementById("seriesSearchBar").style.display = "none";
    document.getElementById("series").style.display = "none";
    document.getElementById("searchBar").style.display = "flex";
    document.getElementById("eps").style.display = "flex";
    history.pushState({ page_id: "episodes" }, null, "episodes");
    window.path = "/episodes";
  }
};

window.onload = setup;
