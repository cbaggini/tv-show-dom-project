// Add cast listing to series page
function addCast(series, color) {
  let article = document.querySelector(".cast");
  article.style.backgroundColor = color;
  const seriesId = series.slice(29, series.indexOf("/episodes"));
  if (sessionStorage.getItem(`cast${seriesId}`) === null) {
    fetchData(`https://api.tvmaze.com/shows/${seriesId}/cast`).then(
      (allCast) => {
        sessionStorage.setItem(`cast${seriesId}`, JSON.stringify(allCast));
        const maxLen = allCast.length > 9 ? 9 : allCast.length;
        let str = "<h2>Cast</h2><div>";
        for (let i = 0; i < maxLen; i++) {
          str += `<p class="actors"><a onclick = "getCredit('${allCast[i].person.id}','${allCast[i].person.name}')">${allCast[i].person.name}</a> as ${allCast[i].character.name}</p>`;
        }
        str += "</div>";
        article.innerHTML = str;
      }
    );
  } else {
    let storedCast = JSON.parse(sessionStorage.getItem(`cast${seriesId}`));
    const maxLen = storedCast.length > 9 ? 9 : storedCast.length;
    let str = "<h2>Cast</h2><div>";
    for (let i = 0; i < maxLen; i++) {
      str += `<p class="actors"><a onclick = "getCredit('${storedCast[i].person.id}','${storedCast[i].person.name}')">${storedCast[i].person.name}</a> as ${storedCast[i].character.name}</p>`;
    }
    str += "</div>";
    article.innerHTML = str;
  }
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
function getCredit(castId, castName) {
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
  // create and populate credit view (using only the ones in the initial series list)
  const creditDiv = document.createElement("div");
  creditDiv.id = "credits";
  creditDiv.innerHTML = `<h1>${castName}</h1>`;
  if (sessionStorage.getItem(`credit${castId}`) === null) {
    fetchData(
      `https://api.tvmaze.com/people/${castId}/castcredits?embed=show`
    ).then((credits) => {
      credits = removeDuplicatesBy((x) => x._embedded.show.id, credits);
      sessionStorage.setItem(`credit${castId}`, JSON.stringify(credits));
      for (let i = 0; i < credits.length; i++) {
        let series = document.getElementById(
          `https://api.tvmaze.com/shows/${credits[i]._embedded.show.id}/episodes`
        );
        if (series) {
          let cln = series.cloneNode(true);
          cln.classList = "creditsClass";
          creditDiv.append(cln);
        }
      }
      rootElem.append(creditDiv);
      addEpisodeClick("creditsClass");
      history.pushState(null, null, "credits");
    });
  } else {
    let storedCredits = JSON.parse(sessionStorage.getItem(`credit${castId}`));
    for (let i = 0; i < storedCredits.length; i++) {
      let series = document.getElementById(
        `https://api.tvmaze.com/shows/${storedCredits[i]._embedded.show.id}/episodes`
      );
      // Only keep series that are in provided series JSON file
      if (series) {
        let cln = series.cloneNode(true);
        cln.classList = "creditsClass";
        creditDiv.append(cln);
      }
    }
    rootElem.append(creditDiv);
    addEpisodeClick("creditsClass");
    history.pushState(null, null, "credits");
  }
}
