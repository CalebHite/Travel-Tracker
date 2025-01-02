"use client"
import { initMap, findNearbyPlaces, createMarkerForPlace, removeMarkers } from './maps';
import { useEffect, useState } from 'react';

export default function Home() {
  const [location, setLocation] = useState("Lawrence, Kansas");
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    initMap(location);
    findNearbyPlaces(location).then((places) => setPlaces(places));
  }, [location]);

  const handleCreateMarker = (place) => {
    createMarkerForPlace(place);
  }

  const handleRemoveMarkers = () => {
    removeMarkers();
  }

  return (
    <div>
      <button onClick={() => handleRemoveMarkers()} style={{ backgroundColor: "red", color: "white", padding: "5px", borderRadius: "5px", position: "absolute", top: "0", right: "0", zIndex: "1000", margin: "10px" }}>Remove Markers</button>
      <input type="text" id="location" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
      <div id="map" style={{ height: "800px", width: "100%" }}></div>
      <div id="places" style={{ display: "flex", flexFlow: "row wrap", gap: "10px", position: "absolute", top: "0", left: "0", zIndex: "1000", backgroundColor: "white", padding: "10px" , width: "20%", height: "800px", overflowY: "scroll"}}>
        <div style={{ width: "100%"}}>
          <h2>Places</h2>
        </div>
        {places.map((place) => (
          <div key={place.placeId} style={{ border: "1px solid black", padding: "10px", borderRadius: "5px" }} onClick={() => handleCreateMarker(place)}>
            <h2>{place.displayName}</h2>
            <button onClick={() => handleCreateMarker(place)} style={{ backgroundColor: "blue", color: "white", padding: "5px", borderRadius: "5px" }}>Create Marker</button>
          </div>
        ))}
      </div>
    </div>
  );
}


