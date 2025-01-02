"use client"
import { initMap, findNearbyPlaces, createMarkerForPlace, findPlacesByText } from './maps';
import { useEffect, useState } from 'react';
import './styles.css'

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

  const handleFindPlaceByName = (placeName) => {
    findPlacesByText(placeName).then((places) => setPlaces(places));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      {!beginTrip && <div style={{ marginTop: "20%" }}>
        <input type="text" id="location" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} style={{ padding: "5px", borderRadius: "5px", border: "1px solid #ccc" }}  />
        <button onClick={() => {
          setBeginTrip(true);
          handleInitMap(location);
        }} style={{ 
          backgroundColor: "#3470e0", 
          color: "white", 
          padding: "5px 10px", 
          borderRadius: "5px", 
          marginLeft: "10px",
          cursor: "pointer",
          transition: "background-color 0.2s",
          ":hover": {
            backgroundColor: "#2857b8"
          }
        }}>Begin Trip!</button>
      </div>}
      <div id="map" style={{ height: "800px", width: "100%" }}></div>
      {beginTrip && (
        <div>
          <div id="places" style={{ 
            display: "flex", 
            flexDirection: "column",
            position: "absolute", 
            top: "0", 
            left: "0", 
            zIndex: "1000", 
            backgroundColor: "white", 
            width: "20%", 
            height: "700px", 
            marginTop: "100px", 
            marginLeft: "1%",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
          }}>
            <div style={{ 
              position: "sticky",
              top: 0,
              backgroundColor: "white",
              padding: "10px",
              borderBottom: "1px solid #eee",
              zIndex: 1
            }}>
              <h2 style={{ fontWeight: "bold", fontSize: "1.5rem" }}>Places</h2>
              <input type="text" id="placeName" placeholder="Search for a place" value={placeName} style={{ padding: "5px", borderRadius: "5px", border: "1px solid #ccc" }} onChange={(e) => setPlaceName(e.target.value)} />
              <button onClick={() => handleFindPlaceByName(placeName)} style={{ 
                backgroundColor: "#3470e0", 
                color: "white", 
                padding: "5px 10px", 
                borderRadius: "5px", 
                marginLeft: "10px",
                cursor: "pointer",
                transition: "background-color 0.2s",
                ":hover": {
                  backgroundColor: "#2857b8"
                }
              }}>Find Place</button>
            </div>
            <div style={{
              overflowY: "auto",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}>
              {places.map((place) => (
                <div className="place-select" key={place.placeId} style={{ 
                  padding: "10px", 
                  borderRadius: "5px",
                  width: "100%",
                  height: "fit-content",
                  minHeight: "min-content",
                  backgroundColor: "#f7f7f7",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  ":hover": {
                    backgroundColor: "#e0e0e0"
                  }
                }} onClick={() => handleCreateMarker(place)}>
                  <h2>{place.displayName}</h2>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


