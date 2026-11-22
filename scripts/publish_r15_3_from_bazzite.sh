#!/usr/bin/env bash
# GamesTech Professional HU R15.3 – ellenőrzött teljes ZIP kiadása GitHubon.
# Nincs Python-telepítés; a korábbi kiadások változatlanok.
set -Eeuo pipefail

REPO="hutoczky/GamesTech-Professional-HU"
TAG="gamestech-hu-r15.3"
FILE="GamesTech_HU_PROFESSIONAL_UNIFIED_HUB_R15.3_MAIN_SEQUENCE_IOSTORE_FIX_WINDOWS_LINUX.zip"
EXPECTED_SIZE=193351780
EXPECTED_SHA="000fa66856766bf8257753080409aa13beb6a27e325baa9497ad4459eaf5efd7"

ZIP="${1:-}"
if [[ -z "$ZIP" ]]; then
  for DIR in "$(xdg-user-dir DOWNLOAD 2>/dev/null || true)" "$HOME/Letöltések" "$HOME/Downloads"; do
    if [[ -f "$DIR/$FILE" ]]; then
      ZIP="$DIR/$FILE"
      break
    fi
  done
fi

if [[ -z "$ZIP" || ! -f "$ZIP" ]]; then
  echo "HIBA: A teljes R15.3 ZIP nincs a Letöltések/Downloads mappában."
  echo "Töltsd le az R15.3 ZIP-et, vagy add meg a fájlt első argumentumként."
  echo "Példa: bash publish_r15_3_from_bazzite.sh '/teljes/utvonal/$FILE'"
  exit 2
fi

for CMD in stat sha256sum unzip grep curl; do
  command -v "$CMD" >/dev/null 2>&1 || {
    echo "HIBA: hiányzó parancs: $CMD"
    exit 3
  }
done

echo "==== GAMESTECH PROFESSIONAL HU R15.3 – GITHUB KIADÁS ===="
echo "Fájl: $ZIP"

if [[ "$(stat -c %s "$ZIP")" != "$EXPECTED_SIZE" ]]; then
  echo "HIBA: hibás fájlméret, a feltöltést leállítottam."
  exit 4
fi
printf '%s  %s\n' "$EXPECTED_SHA" "$ZIP" | sha256sum -c -
unzip -tqq "$ZIP"
CONTENTS="$(unzip -Z -1 "$ZIP")"
for REQUIRED in "/GamesTech_HU_DUPLA_KATT_WINDOWS.exe" "/GamesTech_HU_DUPLA_KATT_LINUX" "/R15.3_QA_REPORT.json"; do
  if ! grep -Fq "$REQUIRED" <<< "$CONTENTS"; then
    echo "HIBA: a csomagból hiányzik $REQUIRED"
    exit 4
  fi
done
echo "[PASS] R15.3 méret + SHA-256 + ZIP + indítók"

if ! command -v gh >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    echo "Hiányzó GitHub CLI telepítése Homebrew-val..."
    brew install gh
  else
    echo "HIBA: GitHub CLI (gh) nincs telepítve."
    echo "Bazzite alatt telepítsd Homebrew-val (brew install gh), majd futtasd újra."
    exit 5
  fi
fi

if ! gh auth status --hostname github.com >/dev/null 2>&1; then
  echo "A GitHub-hitelesítéshez böngészős jóváhagyás szükséges."
  gh auth login --hostname github.com --git-protocol https --web
fi

if ! gh release view "$TAG" --repo "$REPO" >/dev/null 2>&1; then
  gh release create "$TAG" --repo "$REPO" --target main --draft \
    --title "GamesTech HU Professional HUB R15.3 – Main Sequence magyarítás – Windows + Linux" \
    --notes "A Main Sequence Demo magyar főmenüje felhasználói képen igazolt. 14 játékprofil; Windows/Linux. A teljes játékbeli fordítás és a natív Windows-teszt még nem igazolt."
fi

RELEASE_ID="$(gh api "repos/$REPO/releases?per_page=100" \
  --jq '.[] | select(.tag_name == "gamestech-hu-r15.3") | .id')"
if [[ ! "$RELEASE_ID" =~ ^[0-9]+$ ]]; then
  echo "HIBA: R15.3 Release-azonosító nem található."
  exit 6
fi

EXISTING_SIZE="$(gh api "repos/$REPO/releases/$RELEASE_ID" \
  --jq '.assets[]? | select(.name == "GamesTech_HU_PROFESSIONAL_UNIFIED_HUB_R15.3_MAIN_SEQUENCE_IOSTORE_FIX_WINDOWS_LINUX.zip") | .size')"
if [[ -n "$EXISTING_SIZE" && "$EXISTING_SIZE" != "$EXPECTED_SIZE" ]]; then
  echo "HIBA: már van ugyanezen néven eltérő méretű asset. Nem írom felül."
  exit 7
fi

if [[ -z "$EXISTING_SIZE" ]]; then
  echo "R15.3 feltöltése GitHub Releases tárhelyre..."
  gh release upload "$TAG" "$ZIP" --repo "$REPO"
fi

REMOTE_SIZE="$(gh api "repos/$REPO/releases/$RELEASE_ID" \
  --jq '.assets[]? | select(.name == "GamesTech_HU_PROFESSIONAL_UNIFIED_HUB_R15.3_MAIN_SEQUENCE_IOSTORE_FIX_WINDOWS_LINUX.zip") | .size')"
REMOTE_DIGEST="$(gh api "repos/$REPO/releases/$RELEASE_ID" \
  --jq '.assets[]? | select(.name == "GamesTech_HU_PROFESSIONAL_UNIFIED_HUB_R15.3_MAIN_SEQUENCE_IOSTORE_FIX_WINDOWS_LINUX.zip") | (.digest // "")')"
if [[ "$REMOTE_SIZE" != "$EXPECTED_SIZE" ]]; then
  echo "HIBA: feltöltött méret eltér, a kiadást nem publikálom."
  exit 8
fi
if [[ -n "$REMOTE_DIGEST" && "$REMOTE_DIGEST" != "sha256:$EXPECTED_SHA" ]]; then
  echo "HIBA: feltöltött SHA-256 eltér, a kiadást nem publikálom."
  exit 8
fi

if [[ -z "$REMOTE_DIGEST" ]]; then
  echo "A GitHub nem adott digestet, az asset visszaellenőrzése letöltéssel..."
  TMP="$(mktemp -d)"
  trap 'rm -rf -- "$TMP"' EXIT
  gh release download "$TAG" --repo "$REPO" --pattern "$FILE" --dir "$TMP"
  printf '%s  %s\n' "$EXPECTED_SHA" "$TMP/$FILE" | sha256sum -c -
fi

echo "[PASS] A távoli ZIP mérete és ellenőrzőösszege megfelelő."
gh release edit "$TAG" --repo "$REPO" --draft=false --latest
echo
echo "PASS: az R15.3 GitHub Release nyilvánosan megjelent."
echo "A GitHub Actions ellenőrzés után automatikusan átállítja a honlap latest.json és README hivatkozásait."
echo "https://github.com/$REPO/releases/tag/$TAG"
