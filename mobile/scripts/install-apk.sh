#!/usr/bin/env bash
# Instala el APK release de Nexo en un dispositivo Android conectado por adb.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APK="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
if [ ! -f "$APK" ]; then
  echo "No existe $APK. Ejecuta: cd android && ./gradlew assembleRelease" >&2
  exit 1
fi
export PATH="$HOME/.local/share/android-sdk/platform-tools:$PATH"
adb devices
adb install -r "$APK"
echo "Instalado: $APK"
