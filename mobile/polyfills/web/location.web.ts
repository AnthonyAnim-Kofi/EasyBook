import type { LocationGeocodedAddress } from 'expo-location';
import * as NativeLocation from 'expo-location';

type Coords = { latitude: number; longitude: number };

export async function reverseGeocodeAsync({
  latitude,
  longitude,
}: Coords): Promise<LocationGeocodedAddress[]> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'EasyBook-App',
        },
      }
    );
    const data = await response.json();
    
    if (data.address) {
      return [
        {
          city: data.address.city || data.address.town || data.address.village || data.address.suburb || null,
          street: data.address.road || null,
          district: data.address.neighbourhood || data.address.suburb || null,
          region: data.address.state || null,
          postalCode: data.address.postcode || null,
          country: data.address.country || null,
          isoCountryCode: data.address.country_code?.toUpperCase() || null,
          name: data.display_name,
          streetNumber: data.address.house_number || null,
          subregion: data.address.county || null,
          timezone: null,
          formattedAddress: data.display_name,
        },
      ];
    }
  } catch (error) {
    console.error('Reverse geocode error:', error);
  }

  return [
    {
      city: 'Unknown City',
      street: null,
      district: null,
      region: null,
      postalCode: null,
      country: 'Unknown Country',
      isoCountryCode: null,
      name: `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      streetNumber: null,
      subregion: null,
      timezone: null,
      formattedAddress: null,
    },
  ];
}

export * from 'expo-location';

export default {
  ...NativeLocation,
  reverseGeocodeAsync,
};
