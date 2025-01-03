import axios from 'axios';

export class PinataService {
  constructor() {
    this.jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
    this.gateway = process.env.NEXT_PUBLIC_GATEWAY_URL;
  }

  async saveTrip(places) {
    try {
      const data = {
        tripDetails: {
          title: `Trip on ${new Date().toLocaleDateString()}`,
          createdAt: new Date().toISOString(),
          places: places.map(place => ({
            name: place.displayName,
            address: place.formattedAddress,
            rating: place.rating,
            coordinates: place.location
          }))
        }
      };

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        data,
        {
          headers: {
            'Authorization': `Bearer ${this.jwt}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.IpfsHash;
    } catch (error) {
      console.error('Error saving trip to IPFS:', error);
      throw error;
    }
  }

  async getTrip(ipfsHash) {
    try {
      const gateway = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      const response = await fetch(gateway);
      const data = await response.json();
      return data.tripDetails.places;
    } catch (error) {
      console.error('Error fetching trip from IPFS:', error);
      throw error;
    }
  }

  async getAllTrips() {
    try {
      const response = await axios.get(
        'https://api.pinata.cloud/data/pinList',
        {
          headers: {
            'Authorization': `Bearer ${this.jwt}`
          }
        }
      );
      
      const trips = await Promise.all(
        response.data.rows.map(async (pin) => {
          try {
            const gateway = `https://gateway.pinata.cloud/ipfs/${pin.ipfs_pin_hash}`;
            const tripResponse = await fetch(gateway);
            const rawData = await tripResponse.text(); // Get raw text first
            
            // Log the raw response for debugging
            console.log('Raw IPFS response:', rawData);
            
            // Try to parse the JSON
            const tripData = JSON.parse(rawData);
            
            return {
              ipfsHash: pin.ipfs_pin_hash,
              ...tripData.tripDetails
            };
          } catch (innerError) {
            console.error('Error processing individual trip:', {
              hash: pin.ipfs_pin_hash,
              error: innerError.message
            });
            return null; // Skip this trip if there's an error
          }
        })
      );
      
      // Filter out any null entries from failed retrievals
      return trips.filter(trip => trip !== null);
    } catch (error) {
      console.error('Error fetching all trips from IPFS:', error);
      throw error;
    }
  }

  async deleteTrip(ipfsHash) {
    try {
      const response = await axios.delete(
        `https://api.pinata.cloud/pinning/unpin/${ipfsHash}`,
        {
          headers: {
            'Authorization': `Bearer ${this.jwt}`
          }
        }
      );
      
      return response.status === 200;
    } catch (error) {
      console.error('Error deleting trip from IPFS:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const pinataService = new PinataService();
export default pinataService;
