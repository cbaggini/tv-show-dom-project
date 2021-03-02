// Add cast listing to series page
async function addCast(series, color) {
  let article = document.querySelector(".cast");
  article.style.backgroundColor = color;
  // If cast listing already stored in session, use that, otherwise call API
  if (sessionStorage.getItem(`cast${series}`) === null) {
    const allCast = await fetchData(
      `https://api.tvmaze.com/shows/${series}/cast`
    );
    sessionStorage.setItem(`cast${series}`, JSON.stringify(allCast));
    article.innerHTML = createCastListing(allCast);
  } else {
    let storedCast = JSON.parse(sessionStorage.getItem(`cast${series}`));
    article.innerHTML = createCastListing(storedCast);
  }
}

// Create HTML for cast listing
function createCastListing(allCast) {
  const maxLen = allCast.length > 9 ? 9 : allCast.length;
  let str = "<h2>Cast</h2><div>";
  for (let i = 0; i < maxLen; i++) {
    str += `<p class="actors"><a onclick = "getCredit('${allCast[i].person.id}','${allCast[i].person.name}')">
	${allCast[i].person.name}</a> as ${allCast[i].character.name}</p>`;
  }
  str += "</div>";
  return str;
}

// Remove duplicates from array of objects based on a property
function removeDuplicatesBy(keyFn, array) {
  let mySet = new Set();
  return array.filter(function (x) {
    let key = keyFn(x),
      isNew = !mySet.has(key);
    if (isNew) mySet.add(key);
    return isNew;
  });
}

// Create cast credit view
async function getCredit(castId, castName) {
  // make episode view invisible
  const episodeView = document.querySelector(".episodes");
  episodeView.style.display = "none";
  const searchEpisode = document.querySelector("#searchBar");
  searchEpisode.style.display = "none";
  // if another credit already present, delete it
  const rootElem = document.getElementById("root");
  const oldCredits = document.getElementById("credits");
  if (oldCredits) {
    oldCredits.remove();
  }
  // If actor page already stored in session, use that, otherwise call API
  let credits;
  if (sessionStorage.getItem(`credit${castId}`) === null) {
    credits = await fetchData(
      `https://api.tvmaze.com/people/${castId}/castcredits?embed=show`
    );
    credits = removeDuplicatesBy((x) => x._embedded.show.id, credits);
    sessionStorage.setItem(`credit${castId}`, JSON.stringify(credits));
  } else {
    credits = JSON.parse(sessionStorage.getItem(`credit${castId}`));
  }
  const creditDiv = createCredits(credits, castName);
  rootElem.append(creditDiv);
  addEpisodeClick("creditsClass");
  history.pushState({ page_id: "credits" }, null, "credits");
}

// Create HTML for credits view
function createCredits(credits, castName) {
  // create and populate credit view (using only the ones in the initial series list)
  const creditDiv = document.createElement("div");
  creditDiv.id = "credits";
  creditDiv.innerHTML = `<h1>${castName}</h1>`;
  for (let i = 0; i < credits.length; i++) {
    let series = document.getElementById(credits[i]._embedded.show.id);
    // Only keep series that are in provided series JSON file
    if (series) {
      let cln = series.cloneNode(true);
      cln.classList = "creditsClass";
      creditDiv.append(cln);
    }
  }
  return creditDiv;
}
