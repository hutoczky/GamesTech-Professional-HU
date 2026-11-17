# GamesTech Professional HU – R14.4 All Backends Fix

**Státusz:** előkészített GitHub Release. A teljes ZIP feltöltése és SHA-256 ellenőrzése szükséges a nyilvános közzététel előtt.

- Csomag: `GamesTech_HU_PROFESSIONAL_UNIFIED_HUB_R14.4_ALL_BACKENDS_FIX_SCRAP_NOMAD_SUB2_EXPERIMENTAL_WINDOWS_LINUX.zip`
- Méret: **203 436 939 bájt** (~194 MiB)
- SHA-256: `d3f0aaeb5fc966200a9b523f99ae7ead489d2de51d83d1e79b7cc5ef51223dd9`
- Projekt: `hutoczky/GamesTech-Professional-HU`
- GitHub Release tag: `gamestech-hu-r14.4-all-backends-fix`
- Alap: GamesTech Professional Unified HUB R14.4, Windows és Linux, grafikus felület
- Javítás: Linux backend-dispatch sikeres visszatérés és hibakódok; Windows fordítómodul-kapcsolatok; Python 3.15.2 továbbadása
- Tartalmazza: Scrap Mechanic AutoRepair, Nomad Drive V3, Subnautica 2 Experimental UI és korábbi HUB-fordítások
- Kicsomagolás után indítók: `GamesTech_HU_DUPLA_KATT_LINUX`, `GamesTech_HU_DUPLA_KATT_WINDOWS.exe`
- ZIP-integritás: `unzip -t` PASS (ellenőrzés: 2026-11-17)
- Natív Windows és tényleges játékos end-to-end ellenőrzés: **nem igazolt**

## Közzétételi biztonsági ellenőrzés

A `publish-r144-all-backends.yml` GitHub Actions workflow csak akkor engedélyezi az új letöltést, ha a feltöltött ZIP valódi bájtjai megfelelnek a fenti méretnek és SHA-256 értéknek. Az automatikus ellenőrzés a ZIP belső épségét is vizsgálja.

A korábbi működő R14.4 kiadás és honlapos link addig változatlan marad.

## Feltöltés a GitHub webes felületén

1. Nyisd meg: https://github.com/hutoczky/GamesTech-Professional-HU/releases
2. Nyisd meg az `R14.4 All Backends Fix` **Draft** kiadást.
3. Válaszd az **Edit** lehetőséget; az **Attach binaries** mezőbe húzd be a fenti ZIP-et (ne nevezd át).
4. **Ne kattints a Publish release gombra.** Mentés: **Save draft**.
5. Indítsd a `Publish verified R14.4 All Backends Fix` GitHub Actions folyamatot a **Run workflow** gombbal. Ez ellenőrzi a teljes fájlt, publikálja a kiadást, majd frissíti a `latest.json` verzióadatot.

Így a honlap csak akkor mutat az új csomagra, ha a teljes ZIP ténylegesen feltöltődött és igazoltan sértetlen.
