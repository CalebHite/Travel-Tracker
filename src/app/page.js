"use client"
import { initMap, findNearbyPlaces, createMarkerForPlace, removeMarkers, findPlacesByText } from './maps';
import { useEffect, useState } from 'react';

export default function Home() {
  const [location, setLocation] = useState("");
  const [beginTrip, setBeginTrip] = useState(false);
  const [places, setPlaces] = useState([]);
  const [placeName, setPlaceName] = useState("");
  useEffect(() => {
    if (beginTrip) {
      findNearbyPlaces(location).then((places) => setPlaces(places));
    }
  }, [location, beginTrip]);

  const handleInitMap = (location) => {
    initMap(location);
  }

  const handleCreateMarker = (place) => {
    createMarkerForPlace(place);
  }

  const handleRemoveMarkers = () => {
    removeMarkers();
  }

  const handleFindPlaceByName = (placeName) => {
    findPlacesByText(placeName).then((places) => setPlaces(places));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      {!beginTrip && <div style={{ marginTop: "20%" }}>
        <input type="text" id="location" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <button onClick={() => {
          setBeginTrip(true);
          handleInitMap(location);
        }} style={{ backgroundColor: "blue", color: "white", padding: "5px", borderRadius: "5px" }}>Begin Trip!</button>
      </div>}
      <div id="map" style={{ height: "800px", width: "100%" }}></div>
      {beginTrip && <div><button onClick={() => handleRemoveMarkers()} style={{ backgroundColor: "red", color: "white", padding: "5px 12px", borderRadius: "50%", position: "absolute", top: "100px", right: "0", zIndex: "1000", margin: "10px" }}>X</button>
      <div id="places" style={{ display: "flex", flexFlow: "row wrap", gap: "10px", position: "absolute", top: "0", left: "0", zIndex: "1000", backgroundColor: "white", padding: "10px" , width: "20%", height: "700px", overflowY: "scroll", marginTop: "120px", marginLeft: ".5%"}}>
        <div style={{ width: "100%" }}>
          <h2>Places</h2>
          <input type="text" id="placeName" placeholder="Place Name" value={placeName} onChange={(e) => setPlaceName(e.target.value)} />
          <button onClick={() => handleFindPlaceByName(placeName)} style={{ backgroundColor: "blue", color: "white", padding: "5px", borderRadius: "5px" }}>Find Place</button>
        </div>
        {places.map((place) => (
          <div key={place.placeId} style={{ 
            border: "1px solid black", 
            padding: "10px", 
            borderRadius: "5px",
            width: "100%",
            height: "fit-content",
            minHeight: "min-content"
          }} onClick={() => handleCreateMarker(place)}>
            <h2>{place.displayName}</h2>
            <button onClick={() => handleCreateMarker(place)} style={{ backgroundColor: "blue", color: "white", padding: "5px", borderRadius: "5px" }}>Create Marker</button>
          </div>
        ))}
      </div></div>}
    </div>
  );
}


