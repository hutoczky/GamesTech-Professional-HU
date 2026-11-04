# GamesTech HU Professional HUB – R14.21

**Állapot: a csomag elkészült és tesztelt, de a GitHub Release ZIP-melléklete még nincs feltöltve.** Ne hivatkozz rá kész nyilvános letöltésként.

## Kiadás adatai

- Kiadás: `GamesTech_HU_PROFESSIONAL_UNIFIED_HUB_R14.21_AUTODETECT_FIX_WINDOWS_LINUX.zip`
- Méret: `213669871` bájt
- SHA-256: `f612d3bde3bffcc5da42cd46ec540f345bde70a0d76f667a9ae430cddc523045`
- Támogatás: Windows + Linux/Bazzite, grafikus, dupla kattintásos indítás
- Játékprofilok: 14 (Nomad Drive FULL V3 – 1307 rekord és a korábbi magyarítások)
- Javítás: kézi gombnyomásra induló, több Steam-könyvtárat és külső meghajtót kezelő automatikus játékkereső
- Linux ellenőrzés: 14/14 szintetikus játékprofil PASS, Steam `libraryfolders.vdf`, nem Steam telepítés, demó kizárása, Xvfb felületi gomb → automatikus felismerés PASS
- Windows: külön folyamatban futó kereső (nem blokkolja a WinForms főszálát); natív Windows-gépen történő futtatási teszt még szükséges

## Közzétételi feltétel

A ZIP-et a GitHub [Releases](https://github.com/hutoczky/GamesTech-Professional-HU/releases) részére, külön `r14.21-autodetect` kiadásba kell feltölteni. **A weboldali közvetlen letöltési hivatkozást csak a tényleges feltöltés és SHA-256 ellenőrzése után szabad bekapcsolni.**

Ez a dokumentum forrás-/kiadás-nyilvántartás, **nem maga a letölthető HUB**. A korábbi nyilvános kiadásokhoz tartozó `latest.json` ezért egyelőre változatlan.
