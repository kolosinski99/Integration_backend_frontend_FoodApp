const OSRM_BASE = 'http://router.project-osrm.org';

export const calculateDeliveryRoute = async (
  restaurantLon,
  restaurantLat,
  clientLon,
  clientLat
) => {
  const coords =
    `${restaurantLon},${restaurantLat};${clientLon},${clientLat}`;
  const url =
    `${OSRM_BASE}/route/v1/driving/${coords}?overview=false`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('OSRM request failed');
  const data = await res.json();

  if (data.code !== 'Ok' || !data.routes || !data.routes[0]) {
    throw new Error('No route found');
  }

  const route = data.routes[0];
  const distanceKm = (route.distance / 1000).toFixed(1);
  const durationMin = Math.ceil(route.duration / 60);

  return { distanceKm, durationMin };
};

export const geocodeAddress = async (street, houseNumber, city) => {
  const query = encodeURIComponent(
    `${street} ${houseNumber}, ${city}, Poland`
  );
  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?format=jsonv2&q=${query}&limit=1&accept-language=pl`;

  const res = await fetch(url, {
    headers: { 'Accept-Language': 'pl' },
  });
  if (!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  if (!data || data.length === 0) return null;

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
  };
};
