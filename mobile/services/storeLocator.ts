import * as Location from 'expo-location';
import type { NearbyStore, StoreType } from '../types/smartCart';
import { GOOGLE_PLACES_KEY as GOOGLE_KEY } from '../constants/apiKeys';

// ── Location ──────────────────────────────────────────────────────────────────

export async function getUserLocation(): Promise<{ lat: number; lng: number }> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission required to find nearby stores');
  }
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return { lat: pos.coords.latitude, lng: pos.coords.longitude };
}

// ── Haversine distance (metres) ───────────────────────────────────────────────

export function calculateHaversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6_371_000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Google Places nearby search ───────────────────────────────────────────────

interface PlacesResult {
  place_id: string;
  name: string;
  vicinity: string;
  opening_hours?: { open_now: boolean };
  geometry: { location: { lat: number; lng: number } };
}

async function searchNearbyStore(
  lat: number,
  lng: number,
  keyword: string,
  store: StoreType
): Promise<NearbyStore[]> {
  if (!GOOGLE_KEY) return [];
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
    url.searchParams.set('location', `${lat},${lng}`);
    url.searchParams.set('radius', '5000');
    url.searchParams.set('keyword', keyword);
    url.searchParams.set('key', GOOGLE_KEY);

    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data = await res.json() as { results?: PlacesResult[] };
    const results = data?.results ?? [];

    return results
      .slice(0, 3)
      .map((place): NearbyStore => ({
        id: place.place_id,
        name: place.name,
        store,
        address: place.vicinity,
        distance: calculateHaversineDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
        isOpen: place.opening_hours?.open_now ?? false,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      }))
      .sort((a, b) => a.distance - b.distance);
  } catch {
    return [];
  }
}

export async function findNearbyStores(lat: number, lng: number): Promise<NearbyStore[]> {
  const [woolworths, coles] = await Promise.all([
    searchNearbyStore(lat, lng, 'Woolworths Supermarket', 'woolworths'),
    searchNearbyStore(lat, lng, 'Coles Supermarket', 'coles'),
  ]);
  return [...woolworths, ...coles].sort((a, b) => a.distance - b.distance);
}
