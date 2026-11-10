# GamesTech HU R14.4 – Scrap + Python 3.15.2 + Nomad V3 + Subnautica 2 UI

**Teljes ZIP összeállítva és helyben ellenőrizve, de GitHub Release-mellékletként még NINCS feltöltve.**

- Fájl: `GamesTech_HU_PROFESSIONAL_UNIFIED_HUB_R14.4_SCRAP_PY3152_NOMAD_SUBNAUTICA2_GUI_FIX_WINDOWS_LINUX.zip`
- Méret: `203411776` bájt
- SHA-256: `4f9104c40e4a8c810c3bdb59b595dfacbbb7bd53eb1c818b2a5e72800efccdf6`
- Forrás: Scrap Mechanic javított, Python 3.15.2-es, Nomad Drive V3-at az AION 2 után tartalmazó teljes R14.4 GUI HUB.
- Subnautica 2: 225 ellenőrzött angol–magyar UI szövegpár a 2026-11-10-i `Subnautica2/Content/Localization/Game/en/Game.locres` exportból, külön Lua override réteg.
- A meglévő GamesTechHU UE4SS-modhoz tartozó 2 Lua fájl biztonságos frissítése; az eredeti PAK/UTOC/UCAS és UE4SS betöltő nem módosul.
- A GUI telepítés/ellenőrzés/visszaállítás gombjai Python 3.15.2-re kötve, mentéssel és SHA-256 ellenőrzéssel.
- Linux: natív grafikus HUB elindult Xvfb alatt; 225/225 szövegkulcs egyezik az exporttal; ZIP CRC PASS, egyetlen régi fordítási fájl sem hiányzik.
- Szintetikus próba: telepítés, állapotellenőrzés, módosult fájl védelme, visszaállítás, hiányzó UE4SS miatti biztonságos leállás – PASS.
- Nem igazolt: tényleges Subnautica 2 játékbeli működés frissített builden, natív Windows-futtatás.
- A frissítő nem telepíti automatikusan a régi UE4SS betöltőt ismeretlen új játékverzióra. Ha nincs korábbi működő GamesTechHU/UE4SS, biztonságosan leáll.

A honlapot és a `latest.json`-t a bináris ZIP teljes GitHub Release-feltöltése és integritásellenőrzése előtt **nem szabad erre a kiadásra átállítani**.
