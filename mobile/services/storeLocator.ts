import * as Location from 'expo-location';
import type { NearbyStore, StoreType } from '../types/smartCart';
import { GOOGLE_PLACES_KEY as GOOGLE_KEY } from '../constants/apiKeys';

// ── Location ──────────────────────────────────────────────────────────────────

const AU_STATE: Record<string, string> = {
  'New South Wales': 'NSW', 'Victoria': 'VIC', 'Queensland': 'QLD',
  'South Australia': 'SA', 'Western Australia': 'WA', 'Tasmania': 'TAS',
  'Australian Capital Territory': 'ACT', 'Northern Territory': 'NT',
};

export async function getSuburb(lat: number, lng: number): Promise<string> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    const r = results[0];
    if (!r) return '';
    const suburb = r.district || r.subregion || r.city || '';
    const state = AU_STATE[r.region ?? ''] || r.region || '';
    return [suburb, state].filter(Boolean).join(', ');
  } catch {
    return '';
  }
}

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

// ── Australian supermarket chains ────────────────────────────────────────────

interface StoreChain {
  keyword: string;
  type: StoreType;
}

const AU_CHAINS: StoreChain[] = [
  { keyword: 'Woolworths Supermarket', type: 'woolworths' },
  { keyword: 'Coles Supermarket',     type: 'coles' },
  { keyword: 'ALDI Supermarket',       type: 'aldi' },
  { keyword: 'IGA Supermarket',        type: 'iga' },
  { keyword: 'Costco Wholesale',       type: 'costco' },
];

const SEARCH_RADIUS = 10_000; // 10 km
const MAX_PER_CHAIN = 3;

// ── Google Places nearby search ───────────────────────────────────────────────

interface PlacesResult {
  place_id: string;
  name: string;
  vicinity: string;
  opening_hours?: { open_now: boolean };
  geometry: { location: { lat: number; lng: number } };
}

async function searchChain(
  lat: number, lng: number, chain: StoreChain
): Promise<NearbyStore[]> {
  if (!GOOGLE_KEY) return [];
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
    url.searchParams.set('location', `${lat},${lng}`);
    url.searchParams.set('radius', String(SEARCH_RADIUS));
    url.searchParams.set('keyword', chain.keyword);
    url.searchParams.set('key', GOOGLE_KEY);

    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data = await res.json() as { results?: PlacesResult[] };

    return (data?.results ?? [])
      .slice(0, MAX_PER_CHAIN)
      .map((place): NearbyStore => ({
        id: place.place_id,
        name: place.name,
        store: chain.type,
        address: place.vicinity,
        distance: calculateHaversineDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
        isOpen: place.opening_hours?.open_now ?? false,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      }));
  } catch {
    return [];
  }
}

// ── Mock fallback stores (major AU cities) ──────────────────────────────────

export const MOCK_STORES: NearbyStore[] = [
  // Sydney
  { id: 'mock-syd-w1', name: 'Woolworths Town Hall', store: 'woolworths', address: '436 George St, Sydney NSW 2000', distance: 500, isOpen: true, lat: -33.8731, lng: 151.2065 },
  { id: 'mock-syd-c1', name: 'Coles World Square', store: 'coles', address: '644 George St, Sydney NSW 2000', distance: 700, isOpen: true, lat: -33.8784, lng: 151.2057 },
  { id: 'mock-syd-a1', name: 'ALDI Surry Hills', store: 'aldi', address: '153 Elizabeth St, Sydney NSW 2000', distance: 900, isOpen: true, lat: -33.8765, lng: 151.2099 },
  { id: 'mock-syd-i1', name: 'IGA Darlinghurst', store: 'iga', address: '182 Victoria St, Darlinghurst NSW 2010', distance: 1200, isOpen: true, lat: -33.8785, lng: 151.2175 },
  // Melbourne
  { id: 'mock-mel-w1', name: 'Woolworths Melbourne Central', store: 'woolworths', address: '300 Lonsdale St, Melbourne VIC 3000', distance: 600, isOpen: true, lat: -37.8117, lng: 144.9633 },
  { id: 'mock-mel-c1', name: 'Coles Bourke St', store: 'coles', address: '299 Bourke St, Melbourne VIC 3000', distance: 800, isOpen: true, lat: -37.8136, lng: 144.9653 },
  { id: 'mock-mel-a1', name: 'ALDI CBD', store: 'aldi', address: '115 Swanston St, Melbourne VIC 3000', distance: 1000, isOpen: true, lat: -37.8129, lng: 144.9656 },
  // Brisbane
  { id: 'mock-bne-w1', name: 'Woolworths Brisbane CBD', store: 'woolworths', address: 'Queen St Mall, Brisbane QLD 4000', distance: 500, isOpen: true, lat: -27.4698, lng: 153.0251 },
  { id: 'mock-bne-c1', name: 'Coles Myer Centre', store: 'coles', address: 'Queen St, Brisbane QLD 4000', distance: 600, isOpen: true, lat: -27.4705, lng: 153.0258 },
];

// ── Detect closest city for fallback ─────────────────────────────────────────

const AU_CITIES = [
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'Melbourne', lat: -37.8136, lng: 144.9631 },
  { name: 'Brisbane', lat: -27.4698, lng: 153.0251 },
  { name: 'Perth', lat: -31.9505, lng: 115.8605 },
  { name: 'Adelaide', lat: -34.9285, lng: 138.6007 },
  { name: 'Gold Coast', lat: -28.0167, lng: 153.4000 },
  { name: 'Canberra', lat: -35.2809, lng: 149.1300 },
  { name: 'Hobart', lat: -42.8821, lng: 147.3272 },
];

function getMockStoresForLocation(lat: number, lng: number): NearbyStore[] {
  // Find closest AU city
  let closestCity = AU_CITIES[0];
  let minDist = Infinity;
  for (const city of AU_CITIES) {
    const d = calculateHaversineDistance(lat, lng, city.lat, city.lng);
    if (d < minDist) { minDist = d; closestCity = city; }
  }

  // Recalculate mock store distances from user's actual position
  const prefix = closestCity.name === 'Melbourne' ? 'mock-mel'
    : closestCity.name === 'Brisbane' ? 'mock-bne' : 'mock-syd';

  const cityStores = MOCK_STORES.filter(s => s.id.startsWith(prefix));
  if (cityStores.length === 0) {
    // Default to Sydney stores if no match
    return MOCK_STORES.filter(s => s.id.startsWith('mock-syd')).map(s => ({
      ...s,
      distance: calculateHaversineDistance(lat, lng, s.lat, s.lng),
    })).sort((a, b) => a.distance - b.distance);
  }

  return cityStores.map(s => ({
    ...s,
    distance: calculateHaversineDistance(lat, lng, s.lat, s.lng),
  })).sort((a, b) => a.distance - b.distance);
}

// ── Main search: all AU chains in parallel ───────────────────────────────────

export async function findNearbyStores(lat: number, lng: number): Promise<NearbyStore[]> {
  const results = await Promise.all(
    AU_CHAINS.map(chain => searchChain(lat, lng, chain))
  );
  const allStores = results.flat().sort((a, b) => a.distance - b.distance);

  // If Google Places returned nothing, use location-aware mock stores
  if (allStores.length === 0) {
    return getMockStoresForLocation(lat, lng);
  }

  return allStores;
}
