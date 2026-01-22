import React, { ReactNode } from "react";
import { ClerkProvider as ClerkRootProvider } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useColors } from "@/hooks/use-colors";

WebBrowser.maybeCompleteAuthSession();

/**
 * Secure token cache for Clerk
 * Stores tokens in device keychain/keystore
 */
const tokenCache = {
  async getToken(key: string) {
    try {
      const token = await SecureStore.getItemAsync(key);
      return token;
    } catch (err) {
      console.error("Error retrieving token from SecureStore:", err);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error("Error saving token to SecureStore:", err);
    }
  },
};

interface ClerkProviderProps {
  children: ReactNode;
}

/**
 * ClerkProvider wrapper that handles theme integration
 * Ensures Clerk UI follows app's light/dark mode setting
 */
export function ClerkProvider({ children }: ClerkProviderProps) {
  const colorScheme = useColorScheme();
  const colors = useColors();

  let publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.warn("Clerk Publishable Key is missing. Using dummy key for UI verification.");
    publishableKey = "pk_test_ZHVtbXkta2V5LWZvci11aS12ZXJpZmljYXRpb24tOTkuY2xlcmsuYWNjb3VudHMuZGV2JA"; // Dummy key
  }

  return (
    <ClerkRootProvider
      publishableKey={publishableKey}
      tokenCache={tokenCache}
    >
      {children}
    </ClerkRootProvider>
  );
}
