import * as Location from 'expo-location';

export const getCurrentLocation = async () => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { error: 'Permission to access location was denied' };
    }

    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    // Reverse geocode to get the city name
    let reverseGeocode = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (reverseGeocode.length > 0) {
      const address = reverseGeocode[0];
      const city = address.city || address.district || address.region || 'Unknown Location';
      const country = address.country || '';
      return {
        city,
        country,
        fullAddress: country ? `${city}, ${country}` : city,
      };
    }

    return { city: 'Unknown Location', latitude, longitude };
  } catch (error) {
    console.error('Error getting location:', error);
    return { error: error.message };
  }
};
