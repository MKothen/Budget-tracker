# Budget Calendar Template (React + Firebase)

Minimal, calendar-first budgeting template using React, FullCalendar and Firebase Firestore.

## New features added
- Firebase Authentication (Email/password + Google)
- Edit & delete events
- Recurring events with client-side expansion (weekly, biweekly, monthly)
- Cashflow chart (running balance) using chart.js
- Month navigation controls (Prev / Today / Next)

## Features
- Calendar is central input: add incomes/expenses as events
- Auto-calc job income from hours × hourly rate
- Recurring events support
- Daily running balance (cashflow) calculation
- Stores data in Firestore (cloud)

## Quick start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Replace the Firebase config in `src/firebase.js` with your project's config.
3. Run locally:
   ```bash
   npm run dev
   ```
4. Deploy to Firebase Hosting:
   - Install Firebase tools: `npm install -g firebase-tools`
   - `firebase login`
   - `firebase init` (select Hosting + Firestore rules if desired)
   - `npm run build`
   - `firebase deploy --only hosting`

## Notes
- This template uses Firestore modular SDK (v9+). Auth is required to separate user data.
- Recurring events are expanded client-side for preview; server-side expansion or Cloud Functions can be added for heavy-duty production usage.
- Configure Firestore rules to require `uid` matching authenticated user.

## Final updates
- Global light/dark theme toggle saved to user settings in Firestore.
- Firestore offline persistence enabled (IndexedDB).
- Firestore security rules included in `firestore.rules`.
- Cashflow forecast extended to 6 months and risk-day detection.
- Hourly rate and starting balance should be stored under `users/{uid}` (you can extend the Settings page to edit these).
