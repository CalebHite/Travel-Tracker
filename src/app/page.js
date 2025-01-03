"use client"
import { useState } from 'react';
import Trip from './components/trip';

export default function Home() {
  const [location, setLocation] = useState("");
  const [beginTrip, setBeginTrip] = useState(false);

  return (
    <div>
      {!beginTrip && <div>
        <input 
          type="text" 
          id="location" 
          placeholder="Location" 
          value={location} 
          onChange={(e) => setLocation(e.target.value)} 
          style={{ padding: "5px", borderRadius: "5px", border: "1px solid #ccc" }} 
        />
        <button 
          onClick={() => setBeginTrip(true)} 
          className="begin-trip-button"
        >
          Begin Trip!
        </button>
      </div>}
      
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