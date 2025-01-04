"use client"
import { useState } from 'react';
import Trip from './components/trip';
import PastTrips from './components/pastTrips';

export default function Home() {
  const [location, setLocation] = useState("");
  const [beginTrip, setBeginTrip] = useState(false);

  return (
    <div>
      {!beginTrip && (
        <div className="main-menu">
          <div className="menu-header">
            <h1>Plan Your Adventure</h1>
            <p>Discover and create memorable journeys around the world</p>
          </div>
          
          <div className="location-input-container">
            <input 
              type="text" 
              id="location" 
              className="location-input"
              placeholder="Where would you like to explore?" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
            />
            <button 
              onClick={() => setBeginTrip(true)} 
              className="begin-trip-button"
            >
              Begin Trip
            </button>
          </div>

          <div className="trips-section">
            <div className="trips-section-header">
              <h2>Your Past Adventures</h2>
            </div>
            <PastTrips />
          </div>
        </div>
      )}
      
      {beginTrip && (
        <Trip 
          location={location}
          setLocation={setLocation}
          beginTrip={beginTrip}
          setBeginTrip={setBeginTrip}
        />
      )}
    </div>
  );
}