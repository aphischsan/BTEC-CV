# Security Spec

## Data invariants

- A CV submission can be created without a student login.
- A submission has exactly five fields: `status`, `studentName`, `studentEmail`, `cvData`, and `createdAt`.
- `cvData` is stringified JSON and is limited to 50,000 characters.
- `studentName` and `studentEmail` are strings limited to 200 characters.
- `status` must be `submitted` when a student creates a document.
- Only an administrator can read, list, update, or delete submissions.
- The bootstrap teacher email must be verified.
- Additional administrators can be granted access with an `admins/{uid}` document.

## AI data handling

- The Gemini API key must never be bundled into the browser.
- AI generation is performed by the Firebase callable function `generateCoverLetter`.
- The Gemini secret is stored in Firebase Secret Manager as `GEMINI_API_KEY`.
- The AI request intentionally excludes student email, phone number and home address.
- The callable function validates and truncates input before sending it to Gemini.

## Browser data

The CV builder uses local storage so students do not lose work after a refresh.

- Successful submission removes the persisted CV from local storage.
- A visible **Clear this CV** control lets a student clear the current device before another student uses it.

## Firestore rule tests

`firestore.rules.test.ts` covers:

1. Valid unauthenticated submission.
2. Extra-field rejection.
3. Rejection of `reviewed` on student creation.
4. Rejection of CV payloads over 50,000 characters.
5. Rejection of unauthenticated reads.
6. Rejection of authenticated non-admin reads.
7. Verified bootstrap-admin read.
8. Admin status update.
9. Rejection of admin edits to protected student fields.

Run the suite with:

`npm run test:rules`

## Production hardening still requiring Firebase project configuration

Enable Firebase App Check for the production web app and enforce it for Firestore and callable Functions. This requires provider/site configuration in Firebase and therefore is not safely hard-coded into source control.
