import { Loader } from "@googlemaps/js-api-loader";

async function getLoader() {
  const loader = new Loader({
    apiKey: "",
    version: "weekly",
    libraries: ["places", "geocoding"],
  });
  return loader;
}

async function getCoordinates(google, location) {
  const geocoder = new google.maps.Geocoder();
  
  const { results } = await new Promise((resolve, reject) => {
    geocoder.geocode({ address: location }, (results, status) => {
      if (status === "OK") {
        resolve({ results });
      }
    });
  });

  return results[0].geometry.location.toJSON(); 
}

let currentMap = null;

async function initMap(location = "Lawrence, Kansas") {
  const loader = await getLoader();

  try {
    const google = await loader.load();

    let { lat, lng } = location;
    
    // allow for location to be coordinates or a string
    if (location.lat && location.lng) {
      lat = location.lat;
      lng = location.lng;
    } else {
      ({ lat, lng } = await getCoordinates(google, location));
    }
    
    // Initialize map with geocoded coordinates and Map ID
    currentMap = new google.maps.Map(document.getElementById("map"), {
      center: { lat, lng },
      zoom: 20,
      mapTypeId: "hybrid",
      mapId: " ",
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_CENTER,
      },
    });
    currentMap.setTilt(45);

    return currentMap;
  } catch (error) {
    console.error("Error initializing map:", error);
  }
}

async function findNearbyPlaces(location = "Lawrence, Kansas") {
  const loader = await getLoader();

  const google = await loader.load();
  
  const { lat, lng } = await getCoordinates(google, location);

  const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary(
    "places",
  );

  const request = {
    fields: ["displayName", "location", "businessStatus"],
    locationRestriction: {
      center: { lat, lng },
      radius: 500,
    },
  };

  //@ts-ignore
  const { places } = await Place.searchNearby(request);
  return places;
}

let markers = [];
let polylines = [];

const marker_colors = ["red", "blue", "green", "yellow", "purple", "orange", "pink", "brown", "gray", "black"];

async function createMarkerForPlace(place) {
  const loader = await getLoader();
  const google = await loader.load();
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  const place_marker = document.createElement("div");
  place_marker.className = "place-marker";
  place_marker.textContent = markers.length;
  place_marker.style.backgroundColor = marker_colors[markers.length % marker_colors.length];
  // Use existing map if available, otherwise create new one
  if (!currentMap) {
    currentMap = await initMap(place.displayName);
  } else {
    // Recenter the map to the new marker's location
    currentMap.setCenter(place.location);
  }
  
  const marker = new AdvancedMarkerElement({
    map: currentMap,
    position: place.location,
    content: place_marker,
    title: place.displayName || '',
  });
  if (markers.length > 0) {
    connectMarkers(markers[markers.length - 1], marker);
  }
  // Check if the marker is already in the array
  if (!markers.some(m => m.position.equals(marker.position))) {
    markers.push(marker);
  }
  return marker;
}

async function removeMarker() {
  markers[markers.length - 1].setMap(null);
  markers.pop();
}

async function findPlacesByText(placeName) {
  const loader = await getLoader();
  const google = await loader.load();

  const { Place } = await google.maps.importLibrary("places");

  const request = {
    textQuery: placeName,
    fields: ["displayName", "location", "businessStatus"],
    locationBias: currentMap ? currentMap.getCenter() : undefined
  };

  try {
    //@ts-ignore
    const { places } = await Place.searchByText(request);
    currentMap.setCenter(places[0].location);
    return places; // Return the first (most relevant) result
  } catch (error) {
    console.error("Error finding place:", error);
    return null;
  }
}

async function connectMarkers(marker1, marker2) {
  const loader = await getLoader();
  const google = await loader.load();
  const { Polyline } = await google.maps.importLibrary("marker");
  const lineSymbol = {
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
  };
  const polyline = new google.maps.Polyline({
    path: [marker1.position, marker2.position],
    strokeColor: "black",
    strokeOpacity: 1.0,
    strokeWeight: 2,
    icons: [
      {
        icon: lineSymbol,
        offset: "100%",
      },
    ],
    map: currentMap,
  });
  polyline.addListener("click", (e) => {
    handleClick(e);
  });

  polylines.push(polyline);
}

function handleClick(event) {
  // Highlight all polylines
  for (let i = 0; i < polylines.length; i++) {
    polylines[i].setOptions({ strokeColor: "#ffd505" });
  }
  
  // Create buttons container
  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'trip-buttons';
  buttonsDiv.style.cssText = `
    position: absolute;
    z-index: 1000;
    background: white;
    padding: 8px;
    border-radius: 4px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  `;

  // Create save button
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save Trip';
  saveButton.style.cssText = `
    background: green;
    color: white;
    border-radius: 4px;
    padding: 8px;
    margin: 0 5px;
  `;
  saveButton.onclick = () => {
    // TODO: Add save trip logic here
    buttonsDiv.remove();
  };

  // Create cancel button
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.style.cssText = `
    background: red;
    color: white;
    border-radius: 4px;
    padding: 8px;
    margin: 0 5px;
  `;
  cancelButton.onclick = () => {
    buttonsDiv.remove();
  };

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'X';
  deleteButton.style.cssText = `
    color: black;
    background: white;
    border-radius: 4px;
    padding: 8px;
  `;
  deleteButton.onclick = () => {
    buttonsDiv.remove();
    for (let i = 0; i < polylines.length; i++) {
      polylines[i].setOptions({ strokeColor: "black" });
    }
  };
  // Add buttons to container
  buttonsDiv.appendChild(saveButton);
  buttonsDiv.appendChild(cancelButton);
  buttonsDiv.appendChild(deleteButton);

  // Position the buttons at the click location
  const mapDiv = document.getElementById('map');
  mapDiv.appendChild(buttonsDiv);

  // Position buttons at the mouse click position
  if (event && event.domEvent) {  // Use domEvent instead of latLng
    buttonsDiv.style.left = `${event.domEvent.clientX}px`;
    buttonsDiv.style.top = `${event.domEvent.clientY}px`;
  }
}

export { initMap, findNearbyPlaces, createMarkerForPlace, removeMarker, findPlacesByText };