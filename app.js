document.querySelector('#main-search').addEventListener('submit', handleSubmit);

function handleSubmit(event){
  event.preventDefault()
  let formObj = new FormData(event.target)
  const fromForm = {
    'search': formObj.get('main')
  };
  fetchSearch(fromForm.search)
}
function fetchSearch(search) {
  fetch('https://api.themoviedb.org/3/search/movie?api_key=0d94905d202237598d00f6b083cf5004&language=en-US&query=' + search + '&page=1&include_adult=false')
    .then(resp=>resp.json())
    .then(resp=>{
      console.log(resp)
      confirmSearchResults(resp)
      let movie = resp.results[0].title;
      getImdbId(movie)
    })
}
function confirmSearchResults(resp){
  let searchResults = [];
  if (resp.results.length === 1){
    let movie = resp.results[0].title;
    getImdbId(movie)
  } else if (resp.results[0].popularity / resp.results[1].popularity > 4) {
    let movie = resp.results[0].title;
    getImdbId(movie)
  } else {
    let movie = resp.results[0].title;
    getImdbId(movie)
    // for (let i=0;i<5;i++){
    //   searchResults.push(resp.results[i].title);
  // }
  // displayResults(searchResults)
  // console.log(searchResults)
}
}
// function displayResults(results){
//   for (let i=0;i<results.length;i++){

//   }
//   document.getElementById('#title-results-bar').create
// }

function getImdbId(title){
  fetch('https://www.omdbapi.com/?t=' + title + '&plot=full&apikey=7594119a')
    .then(resp=>resp.json())
    .then(resp=>{
      renderMovieDetails(resp)
      let id = resp.imdbID
      fetchScrape(id)
    })
}
function renderMovieDetails(details){
  console.log(details)
  document.getElementById('movie-title').innerHTML = details.Title;
  document.getElementById('poster').src = details.Poster;
}

function fetchScrape(id){
  fetch('http://localhost:4000/scrape/?id=' + id, {mode: 'cors'})
    .then(resp=>resp.json())
    .then(resp=>{
      console.log(resp)
      var fictionalLocations = [];
      var json = '{"locations": ['
      for (let i=0;i<resp.length;i++){
        let x = '{\'street\':\'' + `${resp[i].realLocation}` +'\'},'
        json += x;
        fictionalLocations.push(resp[i].movieLocation);
      }
      var end = '],"options":{"thumbMaps": false,"maxResults": "3"}}';
      json += end;
      console.log(fictionalLocations)
      // getCoordinates(json)
    })
}
function getCoordinates(json){
  fetch('https://www.mapquestapi.com/geocoding/v1/batch?&inFormat=json&outFormat=json&json=' + json + '&key=7Fzd8MlurFgfUNNgXP8edg56JhhxfRlb')
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
      newMap(coordinates)
    })
}
function formatLocations(coordinates){
  console.log(coordinates)
  var locations1 = [];
  for (let i=0;i<coordinates.length;i++) {
    let x = []
    x.push(coordinates[i].location);
    x.push(coordinates[i].lat)
    x.push(coordinates[i].lng)
    locations1.push(x)
  }
  newMap(locations1)
}


function initMap(locations) {
  var myLatLng = { lat: -25.363, lng: 131.044 };

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: myLatLng
  });

  var marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    title: 'Hello World!'
  });
}

function newMap(locations) {
  var geoOnly = [];
  var locationOnly = [];
  for (let i=0;i<locations.length;i++){
    let a = {};
    a.lat = locations[i].lat;
    a.lng = locations[i].lng;
    geoOnly.push(a)
  }
  for (let i = 0; i < locations.length; i++) {
    locationOnly.push(locations.location)
  }
  console.log(geoOnly)
  var myLatLng = { lat: -25.363, lng: 131.044 };

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: myLatLng
  });

  var infowindow = new google.maps.InfoWindow();

  var marker, i;

  for (let i=0;i<geoOnly.length;i++){
    var marker = new google.maps.Marker({
      position: geoOnly[i],
      map: map,
    });
    google.maps.event.addListener(marker, 'click', (function (marker, i) {
      return function () {
        infowindow.setContent(locations[i].location);
        infowindow.open(map, marker);
      }
    })(marker, i));
}
}