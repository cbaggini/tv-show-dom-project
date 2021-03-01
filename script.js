// Setup initial view (series list)
async function setup() {
  let seriesList = await fetchData("https://api.tvmaze.com/shows?page=0");
  seriesList = seriesList.sort((a, b) =>
    a.name > b.name ? 1 : b.name > a.name ? -1 : 0
  );
  loadSeriesView(seriesList);
  history.pushState(null, null, "series");
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

window.onload = setup;
