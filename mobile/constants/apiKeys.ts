import Constants from 'expo-constants';

// Read from both process.env (Expo Go) and Constants.expoConfig.extra (builds)
// so the key is always found regardless of how the app is run.
const extra = Constants.expoConfig?.extra as Record<string, string> | undefined;

export const RAPIDAPI_KEY: string =
  process.env.EXPO_PUBLIC_RAPIDAPI_KEY ||
  extra?.rapidApiKey ||
  '';

export const GOOGLE_PLACES_KEY: string =
  process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ||
  extra?.googlePlacesKey ||
  '';

if (!RAPIDAPI_KEY) {
  console.warn('⚠️  RAPIDAPI_KEY is empty — Smart Cart will use mock data');
} else {
  console.log('✅ RAPIDAPI_KEY loaded, first 8 chars:', RAPIDAPI_KEY.substring(0, 8));
}

if (!GOOGLE_PLACES_KEY) {
  console.warn('⚠️  GOOGLE_PLACES_KEY is empty — store finder disabled');
} else {
  console.log('✅ GOOGLE_PLACES_KEY loaded');
}
