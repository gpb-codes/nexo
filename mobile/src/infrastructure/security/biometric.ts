import * as LocalAuthentication from "expo-local-authentication";

export type BiometricCapability = {
  available: boolean;
  enrolled: boolean;
  label: string;
};

export async function getBiometricCapability(): Promise<BiometricCapability> {
  try {
    const [hardware, enrolled, types] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ]);
    const hasFace = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
    const hasFingerprint = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
    return {
      available: hardware && enrolled,
      enrolled,
      label: hasFace ? "rostro / Face ID" : hasFingerprint ? "huella dactilar" : "biometría",
    };
  } catch {
    return { available: false, enrolled: false, label: "biometría" };
  }
}

export async function authenticateWithBiometrics(reason = "Desbloquea tu sesión de Nexo"): Promise<boolean> {
  try {
    const capability = await getBiometricCapability();
    if (!capability.available) return false;
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      cancelLabel: "Cancelar",
      fallbackLabel: "Usar contraseña",
      disableDeviceFallback: false,
    });
    return result.success;
  } catch {
    return false;
  }
}
