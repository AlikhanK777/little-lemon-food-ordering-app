# Little Lemon — React Native / Expo learning starter

This is a **reference implementation for learning and customization**. It was generated as an AI-assisted starter and has **not been run on a physical device**. Do not present it unchanged as your own Coursera capstone submission. Follow your course's Honor Code and implement, test, and document your own work.

## Contents

- `App.js`: onboarding, home menu, profile, native-stack screen navigation and UI.
- `src/database.js`: local SQLite storage of menu and profile. On the first launch it tries the course demonstration JSON URL; later launches read SQLite instead. An offline fallback menu is available.
- `src/menuData.js`: sample menu data and API normalization.
- `src/theme.js`: shared palette and category labels.
- `design/`: instructions for making your own Figma wireframe (no made-up personal design provided).

## Run it

Requirements: Node.js LTS (22.13+ for Expo SDK 57), Expo Go app on your phone.

Open a terminal in **this extracted folder** and run:

```bash
npm install
npx expo install --check
npx expo start
```

Scan the QR code with Expo Go. If Expo displays version incompatibilities, follow its recommendations (for example `npx expo install --fix`).

## Test scenarios

1. The first launch should display Onboarding. **Next** is disabled until the first name and a valid email are entered.
2. After onboarding, the Home screen should display the hero, categories, search and food items.
3. Tap a category and type part of a dish name. Filtering works together; search is delayed by 300 ms.
4. Tap the avatar to open the Profile screen. Change the name or phone and save.
5. Stop the app and reopen it. Profile and SQLite menu should persist.
6. Tap Log out. The profile should be erased and Onboarding should reappear.
7. Use the back arrow in the profile header to return to Home.

## Important work before a Coursera submission

- **Make and export your own wireframe in Figma**; commit it as a JPG/PNG. The file in `design/` is a checklist, not your actual wireframe.
- Replace the sample/demo data, text and emoji illustrations with the designs and assets you created.
- Compare each screen to the rubric and adjust behavior, labels and styling.
- Test the app on an emulator or physical device; save screenshots and document any bugs fixed.
- Add your own explanatory README and acknowledgments as required by your course policy.
- Ensure that your git repository contains **extracted project files**, not just this ZIP. Never commit `node_modules`.

## Notes

Requires an Internet connection for the initial dependency installation. The optional menu endpoint is a course-provided demo endpoint and may change. If it is unavailable, the app initializes from `SAMPLE_MENU` so you can still explore the UI. Platform-specific behavior is not yet verified.
