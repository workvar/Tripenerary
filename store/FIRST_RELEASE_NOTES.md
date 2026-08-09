# First Google Play release notes — Tripenerary

Paste-ready copy for Play Console. Character counts are for the Play “Release notes”
field (max **500** per language).

CI uploads every file under `store/whatsnew/` named `whatsnew-<LOCALE>`.

## en-US (English)

File: `store/whatsnew/whatsnew-en-US`

```
Welcome to Tripenerary — your day-by-day travel companion.

• Add trips from a JSON link; keep several side by side
• Home screen sorted around what’s happening now
• Date strip, day picker, and jump-to-today
• Schedule with times, photos, notes, and stays
• Map previews, open in Maps, and directions
• Offline cache for trips, tickets, and PDFs
• Optional sign-in to sync across devices
• Works offline once a trip is saved

No ads. Your plans stay under your control.
```

## hi-IN (Hindi)

File: `store/whatsnew/whatsnew-hi-IN`

```
Tripenerary में आपका स्वागत है — आपका दिन-प्रतिदिन यात्रा साथी।

• JSON लिंक से यात्राएँ जोड़ें; कई यात्राएँ साथ रखें
• होम स्क्रीन अभी चल रही योजना के अनुसार
• तारीख पट्टी, दिन चयन और आज पर जाएँ
• समय, फ़ोटो, नोट्स और ठहरने की सूची
• मानचित्र पूर्वावलोकन, Maps में खोलें और दिशा
• यात्रा, टिकट और PDF का ऑफ़लाइन कैश
• वैकल्पिक साइन-इन से डिवाइस सिंक
• सेव के बाद बिना नेटवर्क भी चलता है

कोई विज्ञापन नहीं। आपकी योजना आपके नियंत्रण में।
```

## fr-FR (French)

File: `store/whatsnew/whatsnew-fr-FR`

```
Bienvenue dans Tripenerary — votre compagnon de voyage au jour le jour.

• Ajoutez des voyages via un lien JSON ; plusieurs à la fois
• Accueil trié autour de ce qui se passe maintenant
• Bandeau de dates, choix du jour et aller à aujourd’hui
• Planning avec horaires, photos, notes et séjours
• Aperçus de carte, ouvrir dans Maps et itinéraires
• Cache hors ligne pour voyages, billets et PDF
• Connexion optionnelle pour synchroniser les appareils
• Fonctionne hors ligne une fois le voyage enregistré

Sans pubs. Vos plans restent sous votre contrôle.
```

## de-DE (German)

File: `store/whatsnew/whatsnew-de-DE`

```
Willkommen bei Tripenerary — Ihr Reisebegleiter Tag für Tag.

• Reisen per JSON-Link hinzufügen; mehrere parallel
• Startbildschirm nach dem aktuellen Tag sortiert
• Datumsleiste, Tageswahl und Sprung zu heute
• Zeitplan mit Zeiten, Fotos, Notizen und Unterkünften
• Kartenvorschau, in Maps öffnen und Wegbeschreibung
• Offline-Cache für Reisen, Tickets und PDFs
• Optionale Anmeldung zum Geräte-Sync
• Offline nutzbar, sobald eine Reise gespeichert ist

Keine Werbung. Ihre Pläne bleiben unter Ihrer Kontrolle.
```

## zh-CN (Chinese, Simplified)

File: `store/whatsnew/whatsnew-zh-CN`

```
欢迎使用 Tripenerary — 您的逐日旅行助手。

• 通过 JSON 链接添加行程，可同时管理多个旅程
• 主页按当前进行中的行程排序
• 日期条、选日与跳转到今天
• 含时间、照片、备注与住宿的日程
• 地图预览，打开 Maps 与导航路线
• 行程、票据与 PDF 离线缓存
• 可选登录以跨设备同步
• 保存后可在无网络时使用

无广告。行程始终由您掌控。
```

## Feature checklist covered

| Area | Covered in notes |
|---|---|
| Add / manage multiple trips from JSON URLs | yes |
| Home library sorted by “now” | yes |
| Date strip, day picker, jump-to-today | yes |
| Day schedule, photos, notes, stays | yes |
| Maps preview + directions | yes |
| Offline itinerary + PDF/ticket cache | yes |
| Optional Firebase sign-in / sync | yes |
| Offline-first after download | yes |
| No ads | yes |

## Longer reviewer blurb (English only; not for the 500-char field)

Tripenerary is a travel itinerary companion. Users paste a URL to a trip JSON file;
the app downloads and caches it, then shows a day-by-day schedule with times, places,
stays, photos, emergency info, and linked tickets/PDFs. Embedded map previews open
into Google Maps for place details or directions. Optional sign-in syncs the trip
library across devices; without sign-in the app remains fully local. Once cached,
trips and opened documents work offline.
