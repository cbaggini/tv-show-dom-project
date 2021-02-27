// Setup initial view (series list)
async function setup() {
  let seriesList = await fetchData("https://api.tvmaze.com/shows");
  seriesList = seriesList.sort((a, b) =>
    a.name > b.name ? 1 : b.name > a.name ? -1 : 0
  );
  loadSeriesView(seriesList);
  history.pushState(null, null, "series");
  document.getElementById("alphabetic").checked = true;
}

// Fetch data from api
async function fetchData(url) {
  let result;
  await fetch(url)
    .then((response) => response.json())
    .then((data) => JSON.stringify(data))
    .then((data) => JSON.parse(data))
    .then((data) => (result = data))
    .catch((error) => console.log(error));
  console.log(`You queried the API at ${Date()}`);
  return result;
}

window.onload = setup;
