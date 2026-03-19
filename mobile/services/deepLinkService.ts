import { Alert, Linking } from 'react-native';
import type { SmartCartIngredient, StoreType } from '../types/smartCart';

async function tryOpenApp(scheme: string, webFallback: string): Promise<void> {
  try {
    const canOpen = await Linking.canOpenURL(scheme);
    await Linking.openURL(canOpen ? scheme : webFallback);
  } catch {
    await Linking.openURL(webFallback).catch(() => {});
  }
}

export async function openInStore(
  store: StoreType,
  ingredients: SmartCartIngredient[]
): Promise<void> {
  const unchecked = ingredients.filter((i) => !i.isChecked);
  const firstItem = encodeURIComponent(unchecked[0]?.name ?? ingredients[0]?.name ?? 'groceries');
  const storeName = store === 'woolworths' ? 'Woolworths' : 'Coles';
  const count = unchecked.length;

  return new Promise((resolve) => {
    Alert.alert(
      `Opening ${storeName}`,
      `We'll open ${storeName} and search for your first item. You have ${count} ingredient${count !== 1 ? 's' : ''} to add to your cart.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve() },
        {
          text: `Open ${storeName}`,
          onPress: async () => {
            if (store === 'woolworths') {
              await tryOpenApp(
                'woolworths://',
                `https://www.woolworths.com.au/shop/search?searchTerm=${firstItem}`
              );
            } else {
              await tryOpenApp(
                'coles://',
                `https://www.coles.com.au/search?q=${firstItem}`
              );
            }
            resolve();
          },
        },
      ]
    );
  });
}
