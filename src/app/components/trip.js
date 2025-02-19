"use client"
import { initMap, findNearbyPlaces, createMarkerForPlace, findPlacesByText, placeSuggestion as getPlaceSuggestion} from '../maps';
import { useEffect, useState } from 'react';
import '../styles.css'
import Image from 'next/image';
import Link from 'next/link';

export default function Trip({ location, setLocation, beginTrip, setBeginTrip }) {
  const [places, setPlaces] = useState([]);
  const [placeName, setPlaceName] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [suggestedPlace, setSuggestedPlace] = useState(null);

  useEffect(() => {
    if (beginTrip) {
      handleInitMap(location);
      findNearbyPlaces(location).then((places) => setPlaces(places));
    }
  }, [location, beginTrip]);

  const handleInitMap = (location) => {
    setTimeout(() => {
      initMap(location);
    }, 100);
  }

  const handleCreateMarker = (place) => {
    createMarkerForPlace(place);
  }

  const handleFindPlaceByName = (placeName) => {
    findPlacesByText(placeName).then((places) => setPlaces(places));
  }

  const handleGeneratePlaceSuggestion = () => {
    getPlaceSuggestion().then((place) => setSuggestion(place));
  }

  const handleSuggestedPlaceClick = () => {
    if (suggestedPlace) {
      handleCreateMarker(suggestedPlace);
      setSuggestion("");
      setSuggestedPlace(null);  
    }
  }

  const handleSuggestedPlaceHover = () => {
    findPlacesByText(suggestion).then((places) => {
      if (places && places.length > 0) {
        setSuggestedPlace(places[0]);
      }
    });
  }

  return (
    <div>
      <div id="map" style={{ height: "900px", width: "100%" }}></div>
      {beginTrip && (
        <div>
          <Link href="/">
            <button
              style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                zIndex: "1000",
                padding: "10px 20px",
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "5px",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
              onClick={() => setBeginTrip(false)}
            >
              ← Back
            </button>
          </Link>
          <div id="places" style={{ 
            display: "flex", 
            flexDirection: "column",
            position: "absolute", 
            top: "0", 
            left: "0", 
            zIndex: "1000", 
            backgroundColor: "white", 
            width: "25%", 
            height: "700px", 
            marginTop: "100px", 
            marginLeft: "1%",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            overflowY: "auto",
            padding: "0 10px 10px"
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
              <button 
                onClick={() => handleFindPlaceByName(placeName)} 
                className="find-place-button"
              >
                Find Place
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {!suggestion && <div 
                key="generate-suggestion"
                className="generate-place-button"
                onClick={() => handleGeneratePlaceSuggestion()}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <h2 style={{
                  background: "linear-gradient(90deg, #8B5CF6, #3B82F6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginRight: "5px",
                }}>Generate Trip Suggestion</h2>
                <Image 
                  src="/google-gemini-icon.webp" 
                  alt="Gemini Icon" 
                  width={20} 
                  height={20}
                  style={{ background: "none" }}
                />
              </div>}
              {suggestion && <div 
                key="suggested-place"
                className="place-select"
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
                onMouseEnter={handleSuggestedPlaceHover}
                onClick={handleSuggestedPlaceClick}
              >
                <h2>Suggested Place: {suggestion}</h2>
                {suggestedPlace && <div className="dropdown">
                  <p style={{ fontWeight: "bold" }}>{suggestedPlace.formattedAddress}</p>
                  <p>{suggestedPlace.rating}★</p>
                  <p>{suggestedPlace.editorialSummary}</p>
                </div>}
              </div>}
              {places.map((place) => (
                place.businessStatus === "OPERATIONAL" && (
                  <div 
                    key={place.id || place.name}
                    className="place-select" 
                  >
                    <h2 onClick={() => handleCreateMarker(place)}>{place.displayName}</h2>
                    <div className="dropdown">
                      <p style={{ fontWeight: "bold" }}>{place.formattedAddress}</p>
                      <p>{place.rating}★</p>
                      <p>{place.editorialSummary}</p>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}