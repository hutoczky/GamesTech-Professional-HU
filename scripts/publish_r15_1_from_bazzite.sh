#!/usr/bin/env bash
# GamesTech Professional HU R15.1 – ellenőrzött GitHub Release feltöltés Bazzite/Linux alatt
# A rendszerre nem telepít Pythont és nem módosít játékfájlokat.
set -Eeuo pipefail

REPO='hutoczky/GamesTech-Professional-HU'
TAG='gamestech-hu-r15.1'
FILE='GamesTech_HU_PROFESSIONAL_UNIFIED_HUB_R15.1_MAIN_SEQUENCE_AUTO_FIX_WINDOWS_LINUX.zip'
EXPECTED_SIZE='193346029'
EXPECTED_SHA='18b8069f6c49dbf764153ea610cfd9c6eeb80b291179fd9ba00fbd9aae5b4f36'

ZIP="${1:-}"
if [[ -z "$ZIP" ]]; then
  for DIR in "$(xdg-user-dir DOWNLOAD 2>/dev/null || true)" "$HOME/Letöltések" "$HOME/Downloads"; do
    if [[ -n "$DIR" && -f "$DIR/$FILE" ]]; then
      ZIP="$DIR/$FILE"
      break
    fi
  done
fi

if [[ -z "$ZIP" || ! -f "$ZIP" ]]; then
  echo "HIBA: R15.1 ZIP nem található. Add meg a fájl teljes elérési útját."
  echo "Használat: bash publish_r15_1_from_bazzite.sh '/útvonal/$FILE'"
  exit 2
fi

for CMD in sha256sum stat unzip grep; do
  if ! command -v "$CMD" >/dev/null 2>&1; then
    echo "HIBA: hiányzó parancs: $CMD"
    exit 2
  fi
done

echo '=== GAMESTECH R15.1 GITHUB RELEASE KÖZZÉTÉTEL ==='
echo "Fájl: $ZIP"
SIZE="$(stat -c '%s' "$ZIP")"
if [[ "$SIZE" != "$EXPECTED_SIZE" ]]; then
  echo "HIBA: rossz ZIP méret: $SIZE / $EXPECTED_SIZE"
  exit 3
fi
printf '%s  %s\n' "$EXPECTED_SHA" "$ZIP" | sha256sum --check --status || {
  echo 'HIBA: ZIP SHA-256 eltérés. Feltöltés leállítva.'
  exit 3
}
unzip -tqq "$ZIP" || {
  echo 'HIBA: sérült ZIP. Feltöltés leállítva.'
  exit 3
}
LIST="$(unzip -Z -1 "$ZIP")"
for REQUIRED in '/GamesTech_HU_DUPLA_KATT_LINUX' '/GamesTech_HU_DUPLA_KATT_WINDOWS.exe' '/R15.1_QA_REPORT.json'; do
  if ! grep -Fq "$REQUIRED" <<< "$LIST"; then
    echo "HIBA: hiányzó kötelező fájl: $REQUIRED"
    exit 3
  fi
done
echo 'ZIP méret, SHA-256 és szerkezet: PASS'

if ! command -v gh >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    echo 'GitHub CLI telepítése Homebrew segítségével...'
    brew install gh
  else
    echo 'HIBA: GitHub CLI (gh) nincs telepítve. Telepítsd a GitHub CLI-t, majd futtasd újra.'
    exit 4
  fi
fi

if ! gh auth status --hostname github.com >/dev/null 2>&1; then
  echo 'GitHub-belépés szükséges a saját böngésződön keresztül.'
  gh auth login --hostname github.com --git-protocol https --web
fi

if ! gh release view "$TAG" --repo "$REPO" >/dev/null 2>&1; then
  gh release create "$TAG" --repo "$REPO" --target main --draft \
    --title 'GamesTech HU Professional HUB R15.1 – Windows + Linux' \
    --notes 'R15.1: Main Sequence Demo Steam-mappa automatikus felismerés javítás; 14 játékprofil.'
fi

echo 'Ellenőrzött ZIP feltöltése a GitHub Releases tárhelyre...'
gh release upload "$TAG" "$ZIP" --clobber --repo "$REPO"

ASSET_SIZE="$(gh api "repos/$REPO/releases/tags/$TAG" \
  --jq '.assets[] | select(.name == "GamesTech_HU_PROFESSIONAL_UNIFIED_HUB_R15.1_MAIN_SEQUENCE_AUTO_FIX_WINDOWS_LINUX.zip") | .size')"
if [[ "$ASSET_SIZE" != "$EXPECTED_SIZE" ]]; then
  echo "HIBA: GitHub feltöltésméret eltérés: $ASSET_SIZE"
  echo 'A kiadás vázlat marad; a jelenlegi weboldali letöltés nem változik.'
  exit 5
fi

ASSET_DIGEST="$(gh api "repos/$REPO/releases/tags/$TAG" \
  --jq '.assets[] | select(.name == "GamesTech_HU_PROFESSIONAL_UNIFIED_HUB_R15.1_MAIN_SEQUENCE_AUTO_FIX_WINDOWS_LINUX.zip") | (.digest // "")')"
if [[ -n "$ASSET_DIGEST" && "$ASSET_DIGEST" != "sha256:$EXPECTED_SHA" ]]; then
  echo "HIBA: GitHub SHA-256 digest eltérés: $ASSET_DIGEST"
  echo 'A kiadás vázlat marad.'
  exit 5
fi

gh release edit "$TAG" --repo "$REPO" --draft=false
echo
echo 'PASS: GitHub Release R15.1 közzétéve.'
echo 'A weboldal és a HUB automatikus frissítési adatai a GitHub ellenőrző folyamatával váltanak át.'
echo "https://github.com/$REPO/releases/tag/$TAG"
