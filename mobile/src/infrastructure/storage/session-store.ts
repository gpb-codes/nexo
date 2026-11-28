import * as SecureStore from "expo-secure-store";

const SESSION_KEY = "nexo_session_token";
const BIOMETRIC_KEY = "nexo_biometric_enabled";

export async function getSessionToken(): Promise<string | null> {
  return SecureStore.getItemAsync(SESSION_KEY);
}

export async function setSessionToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, token);
}

export async function clearSessionToken(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export async function getBiometricEnabled(): Promise<boolean> {
  return (await SecureStore.getItemAsync(BIOMETRIC_KEY)) === "1";
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  if (enabled) {
    await SecureStore.setItemAsync(BIOMETRIC_KEY, "1");
  } else {
    await SecureStore.deleteItemAsync(BIOMETRIC_KEY);
  }
}

export async function clearBiometricEnabled(): Promise<void> {
  await SecureStore.deleteItemAsync(BIOMETRIC_KEY);
}
