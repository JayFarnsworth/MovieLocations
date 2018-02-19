document.querySelector('#main-search').addEventListener('submit', handleSubmit);
var picList = [];


function handleSubmit(event){
  event.preventDefault()
  let formObj = new FormData(event.target)
  const fromForm = {
    'search': formObj.get('main')
  };
  console.log(fromForm.search)
  fetchSearch(fromForm.search)
}
function fetchSearch(search) {
  fetch('https://api.themoviedb.org/3/search/movie?api_key=0d94905d202237598d00f6b083cf5004&language=en-US&query=' + search + '&page=1&include_adult=false')
    .then(resp=>resp.json())
    .then(resp=>{
      console.log(resp)
      confirmSearchResults(resp)
      let movie = resp.results[0].title;
      console.log(movie)
      // getImdbId(movie)
    })
}
function confirmSearchResults(resp){
  document.querySelector('#left-bar').style.visibility = 'visible';
  document.querySelector('#movie-title-container').style.visibility = 'hidden';
  document.querySelector('#filming-locations-title').style.visibility = 'hidden';
  let searchResults = [];
  let results = resp.results;
  var sorted = results.sort((a, b)=>{
    if (a.popularity > b.popularity) {
      return -1
    }
    if (a.popularity < b.popularity) {
      return 1
    }
  })
  console.log(sorted)
  if (resp.results.length === 1){
    console.log('1')
    let movie = resp.results[0].title;
    document.querySelector('#results').style.display = 'none';
    getImdbId(movie)
  } else if (resp.results[0].title == resp.results[1].title){
    console.log('2')
    for (let i=0;i<resp.results.length;i++){
      let titleSame = resp.results[0].title;
      if (resp.results[i].title == titleSame) {
        searchResults.push(resp.results[i])
      }
    }
    displayResults(searchResults)
  } else if ((sorted[0].popularity / sorted[1].popularity) > 3) {
    console.log('3')
    let movie = resp.results[0].title;
    getImdbId(movie)
  } else {
    console.log('4')
    let movie = resp.results[0].title;
    // getImdbId(movie)
    for (let i=0;i<resp.results.length;i++){
      if (sorted[i].popularity > (sorted[0].popularity / 4)) {
        searchResults.push(resp.results[i].title);
      }
  }
  // searchResults.sort((a, b)=>{
  //   if (a.)
  // })
  displayResults(searchResults)
}
  console.log(searchResults)

}
function displayResults(results){
  for (let i=0;i<results.length;i++){
    let resultsC = document.getElementById('results')
    let a = resultsC.appendChild(document.createElement('a'))
    let b = a.appendChild(document.createElement('h4'))
    b.className = 'search-result'
    b.addEventListener('click', searchThis)
    b.innerText = results[i]
  }
}
function searchThis(event){
  event.preventDefault();
  document.querySelector('#results').style.display = 'none';
  console.log(event.target.textContent)
  getImdbId(event.target.textContent)
}
function getImdbId(title){
  fetch('https://www.omdbapi.com/?t=' + title + '&plot=full&apikey=7594119a')
    .then(resp=>resp.json())
    .then(resp=>{
      renderMovieDetails(resp)
      let id = resp.imdbID
      console.log(id)
      fetchScrape(id)
    })
}
function renderMovieDetails(details){
  document.querySelector('#movie-title-container').style.visibility = 'visible';
  document.querySelector('#filming-locations-title').style.visibility = 'visible';
  console.log(details)
  document.getElementById('movie-title').innerHTML = details.Title;
  document.getElementById('poster').src = details.Poster;
}

function fetchScrape(id){
  fetch('https://locations-scraper.herokuapp.com/scrape/?id=' + id, {mode: 'cors'})
    .then(resp=>resp.json())
    .then(resp=>{
      var dates = resp.pop();
      renderDate(dates)
      var ficLocations = [];
      var realLocations = [];
      var json = '{"locations": ['
      for (let i=0;i<resp.length;i++){
        let a = resp[i].realLocation;
        let b = a.replace("'", "");
        let x = '{\'street\':\'' + b +'\'},'
        json += x;
        ficLocations.push(resp[i].movieLocation);
        // scrapeImages(resp[i].realLocation)
      }
      var end = '],"options":{"thumbMaps": false,"maxResults": "3"}}';
      json += end;
      renderList(resp)
      console.log(json)
      getCoordinates(json, ficLocations)
    })
}
function renderDate(date){
  document.querySelector('#filming-dates').innerHTML = date;
}
function renderList(locations){
  for (let i=0;i<locations.length;i++){
    if (i % 2 === 0) {
      let locationList = document.querySelector('#locations-container')
      let a = locationList.appendChild(document.createElement('div'))
      a.className = 'even';
      let c = a.appendChild(document.createElement('img'))
      c.className = 'result-pic';
      let b = a.appendChild(document.createElement('h4'))
      b.className = 'bold'
      b.innerText = locations[i].realLocation
      if (locations[i].movieLocation !== '') {
        let c = a.appendChild(document.createElement('h4'))
        c.innerText = 'As: ' + locations[i].movieLocation
      }
    }
  else {
   let locationList = document.querySelector('#locations-container')
   let a = locationList.appendChild(document.createElement('div'))
   a.className = 'odd';
   let c = a.appendChild(document.createElement('img'))
   c.className = 'result-pic';
  let b = a.appendChild(document.createElement('h4'))
  b.className = 'bold'
  b.innerText = locations[i].realLocation;
  if (locations[i].movieLocation !== '') {
    let c = a.appendChild(document.createElement('h4'))
    c.innerText = 'As: ' + locations[i].movieLocation
    }
    } 
  }
  fetchPics(locations)
  // renderPics()
}
function getCoordinates(json, ficLocations){
  var json1 = encodeURIComponent(json)
  var url = 'https://www.mapquestapi.com/geocoding/v1/batch?&inFormat=json&outFormat=json&json=' + json1 + '&key=7Fzd8MlurFgfUNNgXP8edg56JhhxfRlb';
     fetch(url)
    .then(resp=>resp.json())
    .then(resp=>{
      console.log(resp)
      var coordinates = []
      for (let i=0;i<resp.results.length;i++){
        coordinates.push({
          location: `${resp.results[i].providedLocation.street}`,
          lat: Number(`${resp.results[i].locations[0].latLng.lat}`),
          lng: Number(`${resp.results[i].locations[0].latLng.lng}`),
        })
      }
      console.log(coordinates)
      newMap(coordinates, ficLocations)
    })
}
function formatLocations(coordinates, ficLocations){
  console.log(coordinates)
  var locations1 = [];
  for (let i=0;i<coordinates.length;i++) {
    let x = []
    x.push(coordinates[i].location)
    x.push(coordinates[i].lat)
    x.push(coordinates[i].lng)
    locations1.push(x)
  }
  newMap(locations1, ficLocations)
}


function initMap(locations, ficLocations) {

  var usCenter = { lat: 39.8283, lng: -98.57 }

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 3,
    center: usCenter
    
  });


}

function newMap(locations, ficLocations) {
  var geoOnly = [];
  var locationOnly = [];
  for (let i=0;i<locations.length;i++){
    let a = {};
    a.lat = locations[i].lat;
    a.lng = locations[i].lng;
    geoOnly.push(a)
  }
  var maxMin = getMaxMin(geoOnly);


  for (let i = 0; i < locations.length; i++) {
    locationOnly.push(locations.location)
  }
  

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: geoOnly[0]
  });
  
  map.setCenter(new google.maps.LatLng(
    ((maxMin.latMax + maxMin.latMin) / 2.0),
    ((maxMin.lngMax + maxMin.lngMin) / 2.0)
  ));
  map.fitBounds(new google.maps.LatLngBounds(
    //bottom left
    new google.maps.LatLng(maxMin.latMin, maxMin.lngMin),
    //top right
    new google.maps.LatLng(maxMin.latMax, maxMin.lngMax)
  ));

  var infowindow = new google.maps.InfoWindow();

  var marker, i;

  for (let i=0;i<geoOnly.length;i++){
    var marker = new google.maps.Marker({
      position: geoOnly[i],
      map: map,
      title: ficLocations[i]
    });
    google.maps.event.addListener(marker, 'click', (function (marker, i) {
      return function () {
        var location = locations[i].location;
        var fic = ficLocations[i]
        var html = '<b class=\'bold\'>' + location + '</b> <br /> As: ' + fic;
        infowindow.setContent(html);
        infowindow.open(map, marker);
      }
    })(marker, i));
}

}
function getMaxMin(geo){
  var latMin = geo[0].lat;
  var latMax = geo[0].lat;
  var lngMin = geo[0].lng;
  var lngMax = geo[0].lng;
  for (let i=0;i<geo.length;i++){
    if (geo[i].lat < latMin) latMin = geo[i].lat;
    if (geo[i].lat > latMax) latMax = geo[i].lat;
    if (geo[i].lng < lngMin) lngMin = geo[i].lng;
    if (geo[i].lng > lngMax) lngMax = geo[i].lng;
  }
  return {
    latMin: latMin,
    latMax: latMax,
    lngMin: lngMin,
    lngMax: lngMax
  }
}

function removeCountryNames(string){
  ['spain', 'italy']
}

var testQueries = ['Schmid Ranch, Telluride, Colorado, USA', 'Wilson Mesa, San Miguel Mountains, Colorado, USA', 'Red Studios, 846 N. Cahuenga Blvd., Hollywood, Los Angeles, California, USA']

function scrapeImages(query){
  fetch('http://localhost:5000/image/?search=' + query)
  .then(resp=>resp.json())
  .then(resp=>{
    let pic = resp[1].url;
    picList.push(pic);
  })
}

// function removeDuplicates(locations){
//   for (let i=0;i<locations.length;i++){

//   }
// }

// function renderPics(){
//   for (let i=0;i<picList.length;i++){
//     document.getElementsByClassName('result-pic')[i].src = picList[i];
//   }
// }

function fetchPics(locations) {
  var request = async () => {
    var picUrls = [];
    for (var i = 0; i < locations.length; i++) {
      let query = locations[i].realLocation;
      let a = query.replace(",", "");
      var response = await fetch('https://image-scrape-sup.herokuapp.com/image/?search=' + a);
      var json = await response.json();
      picUrls.push(json);
    }
    var details = await populateImages(picUrls);
  }
  request();
}
function populateImages(urls){
  console.log(urls)
  for (let i=0;i<urls.length;i++){
    if (urls[i][0]){
      document.getElementsByClassName('result-pic')[i].src = urls[i][0].url;
    }
  }
}