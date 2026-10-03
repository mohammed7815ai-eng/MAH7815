# Cancer Screening Guide (Kurdistan Region)

A citizen-facing cancer screening guidance app for the Kurdistan Region of Iraq, available as a website (installable, works offline), a Windows desktop app and an Android app, in **English, Kurdish Sorani, Kurdish Kurmanji, Kurdish Badini and Arabic**.

## What it does

- **Screening plan**: a short questionnaire (age, sex, symptoms, family history, smoking, PSA, etc.) runs through a deterministic rule engine and shows, per cancer, whether screening is recommended, not yet due, a matter for discussion, or needs specialist assessment — with the test, interval, international comparison and sources.
- **Learn**: risk factors, warning signs and prevention for the five screenable cancers.
- **AI assistant (optional, off by default)**: six specialist agents (navigator, breast, cervical, colorectal, lung, prostate) powered by Claude, grounded in the guideline text, answering in the user's language. Uses the user's own Anthropic API key, stored only on the device.
- **Privacy**: answers never leave the device. Nothing is sent anywhere unless the AI assistant is turned on.

## Clinical basis

| Cancer | Rules from | Notes |
|---|---|---|
| Breast | KRG MOH 2023 | Average risk: mammogram every 2 years, 45–69. High-risk groups A/B/C: BSE/CBE from 30, annual MRI/mammogram 35–40, annual mammogram 45–69, genetic counselling for group C. KRG text does not specify ages 41–44 for high risk; the app says so. |
| Lung | KRG MOH 2023 | Age 55–70 with >30 pack-years and smoking now or quit ≤10 years, Tammemagi 6-year risk >2%, occupational exposure, or COPD/TB → annual LDCT (Lung-RADS). Exclusions applied. |
| Prostate | KRG MOH 2023 | Informed choice; 45+ with risk factors, 55–72 shared decision, >72 only if life expectancy >10 y. PSA/DRE follow-up algorithm and re-test intervals included. |
| Cervical | KRG MOH 2023 | MoH programme for married women from 30 (private sector from 25; within 3 years of sexual debut). HPV DNA every 5–10 y, or Pap every 3 y to 49 and every 5 y at 50–69. Extra tests at OCP/IUD/HRT start, genital warts, pelvic infection, pre-op. WHO used where KRG is silent (HIV, after 69). |
| Colorectal | KRG MOH 2023 | Average risk 45–75: colonoscopy every 10 y (FIT yearly if refused). Moderate risk: colonoscopy from 40 every 10 y. High risk: from 40 or 10 y before youngest relative's diagnosis, every 5 y. 76–85 individualised. Polyp/IBD/Lynch → specialist. |

All rules live in `src/engine/rules.ts`, sources in `src/engine/sources.ts`, tests in `src/engine/rules.test.ts`.

## Translations

- English (`src/i18n/en.ts`) is the reference. Every other language is one plain JSON file in `src/i18n/locales/` (`ckb.json` Sorani, `kmr.json` Kurmanji, `badini.json` Badini, `ar.json` Arabic) that anyone can edit.
- **In the app**: the *Edit translations* tab lets a reviewer change any text. Edits are saved on the device and used immediately. *Download full language file* gives a file that can replace `src/i18n/locales/<lang>.json` directly; *Load a translation file* imports one (full file or just the changes). On Android, use *Copy full language file* and paste it into an email or message.
- Badini (`badini.json`) was drafted by transliterating Kurmanji into Kurdish Arabic script (`node scripts/kmr-to-badini.mjs`; re-running it overwrites the file, so stop using it once Badini has been edited by hand).
- All Kurdish and Arabic text was machine-drafted and must be reviewed by native-speaking clinicians before public release. The test suite checks that every language has every key and keeps every `{placeholder}`.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # rule-engine and translation tests
npm run build      # web build in dist/ (PWA, works offline)
```

## Build the apps

GitHub Actions (`.github/workflows/build.yml`) builds everything on every push to `main` (or the `cancer-screening-app` branch):

- **Web**: `dist/` artifact, deployed to GitHub Pages (enable Pages → Source: GitHub Actions once).
- **Windows**: `release/*.exe` (installer + portable) via Electron.
- **Android**: `CancerScreeningGuide.apk` (debug-signed) via Capacitor.

Push a tag like `v1.0.0` to attach all three to a GitHub Release.

Local builds: `npm run electron:win` on Windows; for Android, install Android Studio + JDK 21, then `npm run build && npx cap add android && npx cap sync android && cd android && ./gradlew assembleDebug`.

For the Google Play Store, create a signing key and build `assembleRelease` / `bundleRelease` instead of the debug APK.

## Disclaimer

General health information, not medical advice, diagnosis or treatment. People with symptoms should see a doctor rather than wait for screening.
