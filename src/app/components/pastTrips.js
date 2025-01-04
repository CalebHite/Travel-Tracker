"use client"
import { useEffect, useState } from 'react';
import { PinataService } from '../pinata';
import { loader } from '../maps';
import { marker_colors } from '../maps';
import { useRouter } from 'next/navigation';

const pinata = new PinataService();

export default function PastTrips() {
  const [trips, setTrips] = useState([]);
  const router = useRouter();

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    const savedTrips = await pinata.getAllTrips();
    setTrips(savedTrips);
  };

  const handleTripClick = (tripId) => {
    router.push(`/trips/${tripId}`);
  };

  if (trips.length === 0) {
    return (
      <div className="trips-gallery">
        <p style={{ 
          textAlign: 'center', 
          color: '#666',
          padding: '2rem'
        }}>
          No trips saved yet.
        </p>
      </div>
    );
  }

  return (
    <div className="trips-gallery">
      <div className="trips-grid">
        {trips.map((trip, index) => (
          <TripCard 
            key={index} 
            trip={trip} 
            onClick={() => handleTripClick(trip.id)}
          />
        ))}
      </div>
    </div>
  );
}

function TripCard({ trip, onClick }) {
  const mapId = `map-${trip.id}`;
  
  useEffect(() => {
    let mapInstance = null;
    
    const initMap = async () => {
      if (!trip.places || trip.places.length === 0) return;
      
      const google = await loader.load();
      const mapElement = document.getElementById(mapId);
      
      // Guard against the element not existing
      if (!mapElement) return;
      
      const firstLocation = trip.places[0].coordinates;
      
      mapInstance = new google.maps.Map(mapElement, {
        center: { lat: firstLocation.lat, lng: firstLocation.lng },
        zoom: 15,
        mapId: "76b769ec81c864d3",
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: false,
      });

      // Add markers and connect them
      const markers = [];
      const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

      trip.places.forEach((place, i) => {
        if (!place.coordinates || typeof place.coordinates.lat !== 'number' || typeof place.coordinates.lng !== 'number') {
          console.error(`Invalid location data for place ${i}:`, place.coordinates);
          return;
        }

        const markerElement = document.createElement("div");
        markerElement.className = "place-marker";
        markerElement.textContent = i + 1;
        markerElement.style.backgroundColor = marker_colors[i % marker_colors.length];

        const marker = new AdvancedMarkerElement({
          map: mapInstance,
          position: { lat: place.coordinates.lat, lng: place.coordinates.lng },
          content: markerElement,
          title: place.name || '',
        });
        
        markers.push(marker);

        if (i > 0) {
          const prevPlace = trip.places[i-1];
          new google.maps.Polyline({
            path: [
              { lat: prevPlace.coordinates.lat, lng: prevPlace.coordinates.lng },
              { lat: place.coordinates.lat, lng: place.coordinates.lng }
            ],
            strokeColor: "black",
            strokeOpacity: 1.0,
            strokeWeight: 2,
            map: mapInstance,
          });
        }
      });

      if (markers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach(marker => bounds.extend(marker.position));
        mapInstance.fitBounds(bounds);
      }
    };

    initMap();

    // Cleanup function
    return () => {
      if (mapInstance) {
        // Clear the map instance
        mapInstance = null;
      }
    };
  }, [trip.places, mapId, trip.id]);

  return (
    <div className="trip-card" onClick={onClick}>
      <div id={mapId} className="trip-map"></div>
      <div className="trip-info">
        <h3>{trip.title}</h3>
        <p>{new Date(trip.createdAt).toLocaleDateString()}</p>
        <p>{trip.places.length} Locations</p>
      </div>
    </div>
  );
}
