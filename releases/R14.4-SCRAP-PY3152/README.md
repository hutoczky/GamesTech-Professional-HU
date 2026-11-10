# GamesTech HUB R14.4 – Scrap Mechanic magyar felület + Python 3.15.2

## Csomag (kész, GitHubra még nem feltöltött)
- Fájlnév: `GamesTech_HU_PROFESSIONAL_UNIFIED_HUB_R14.4_SCRAP_GUI_FIX_PY3152_WINDOWS_LINUX.zip`
- Méret: `184092308` bájt
- SHA-256: `7baf149e545216f7fbff3a9f8e52032caa42c7032359b803137635e667d6ea5e`
- Alap: a nyilvános **R14.4** Windows/Linux natív grafikus HUB, a meglévő játékprofilok és fordítási adatállományok megőrzésével.

## Javítás
- Scrap Mechanic: a Windows korábbi `core_data_hu.cbo` másolása helyett a játék aktuális `English` forrásfájljai alapján fordító Python-modul.
- A telepítő az `English` és `Polish` lokalizációs helyre is telepíti a magyar szöveget; mindkét platform azonos fordítómotort használ.
- Telepítés előtti mentés, ellenőrzés, helyreállítás, változott játékfájlok kímélése.
- Python-alapú fordítóknál **pontosan Python 3.15.2**. Nincs Python 3.14/3.13 fallback. A natív HUB-indítókat és más játékok magyarítási payloadját nem módosítottuk.
- A csomag Python-fájljainak szintaxisa és az összes shellszkript ellenőrzött, a ZIP CRC-integriása rendben, ellenőrzőösszeg-manifeszt frissült.
- Scrap Mechanic szintetikus install/diagnostics/reinstall/Steam-update/restore teszt PASS.

## Még elvégzendő ellenőrzés
Natív Windows GUI/PowerShell futtatás, Python 3.15.2 tényleges végrehajtás, teljes játékfelület és multiplayer kompatibilitás csak a célgépen ellenőrizhető. A Dune és Subnautica 2 **frissített** fordításai nem részei ennek a specifikus Scrap/Python javításnak.

## Publikálási szabály
**Ne** állítsuk át a [hivatalos GamesTech honlap](https://hutoczky.github.io/GamesTech-Professional-HU/) letöltési linkjét, amíg az új ZIP a GitHub Releases részben meg nem jelent, és az ellenőrzőösszeg nem egyezik. A korábbi R14.4 stabil letöltést addig tartsuk meg.
