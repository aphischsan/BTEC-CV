<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# BTEC Simple CV

A React + Vite + TypeScript app for BTEC students to build a CV, submit it to a teacher dashboard, and generate a simple AI-assisted cover letter.

## Security model

- CV submissions are stored in Firestore.
- Only the configured teacher/admin can read, review or delete submissions.
- Students do not need an account to submit a CV.
- The Gemini API key is **not stored in the browser or Vite environment**.
- AI generation runs through a Firebase callable Cloud Function.
- Phone number, email address and home address are not sent to Gemini.
- Student CV data saved in the browser can be cleared with the **Clear this CV** button and local persistence is removed after a successful submission.

## Run the frontend locally

Prerequisite: Node.js 22 or newer.

1. Install dependencies:

   `npm install`

2. Start Vite:

   `npm run dev`

The normal Firebase web configuration in `firebase-applet-config.json` is client configuration. Do not put a Gemini secret in that file.

## Firebase Cloud Function setup

The AI cover-letter feature now uses `functions/src/index.ts`.

1. Install the function dependencies:

   `cd functions && npm install`

2. Store the Gemini API key in Firebase Secret Manager:

   `npx firebase-tools@15.29.0 functions:secrets:set GEMINI_API_KEY`

3. Deploy the callable function:

   `npx firebase-tools@15.29.0 deploy --only functions:generateCoverLetter`

4. Deploy the Firestore rules:

   `npx firebase-tools@15.29.0 deploy --only firestore:rules`

The function currently uses the same Gemini model name as the existing app, `gemini-3-flash-preview`, so the migration does not intentionally change model behavior.

## Security-rule tests

Run:

`npm run test:rules`

This starts the Firestore emulator and executes the rule tests in `firestore.rules.test.ts`.

Run all local checks:

`npm run check`

## Before using with students

Firebase App Check should also be enabled for the production web app and Firestore/Functions to reduce automated abuse. App Check requires site/provider configuration in your Firebase project, so it is intentionally not hard-coded into this repository.
