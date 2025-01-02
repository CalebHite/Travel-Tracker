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
      } else {
        reject(new Error(`Geocoding failed with status: ${status}`));
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
  });
  // Check if the marker is already in the array
  if (!markers.some(m => m.position.equals(marker.position))) {
    markers.push(marker);
  }
  return marker;
}

async function removeMarkers() {
  markers.forEach((marker) => {
    marker.setMap(null);
  });
  markers = [];
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

export { initMap, findNearbyPlaces, createMarkerForPlace, removeMarkers, findPlacesByText };