# Security Spec

## Data Invariants
- A CV Submission can be created by anyone (unauthenticated users allowed as per MVP requirements, no login for students).
- `cvData` is a stringified JSON payload to simplify the structure in Firestore and prevent deep nesting abuse. It must be a string and limited to say, 50,000 characters.
- `studentName` and `studentEmail` are strings. `studentName` must not exceed 200 chars. `studentEmail` must not exceed 200 chars.
- `status` must be 'submitted' upon creation.
- Only an administrator can read (list/get), update, or delete the submissions.
- Administrator is determined by the `isAdmin()` helper. A user is admin if their uid exists in the `/databases/$(database)/documents/admins/$(request.auth.uid)` collection. To bootstrap, we will write a rule allowing `pissan282@gmail.com` as an admin, or we can just require the `admins` document. Actually, the rule can be: `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`. But how does `pissan282@gmail.com` get added to `admins`? Since the user is `pissan282@gmail.com`, we can simply add `request.auth.token.email == "pissan282@gmail.com"` to `isAdmin()`.

## The Dirty Dozen Payloads
1. Create with missing fields (e.g. missing cvData). -> Rejected by exact keys.
2. Create with extra field 'isAdmin: true'. -> Rejected by exact keys.
3. Create with invalid status 'reviewed'. -> Rejected, must be 'submitted' on create.
4. Create with non-string studentName. -> Rejected by type check.
5. Create with oversized cvData (> 50k chars). -> Rejected by .size() limit.
6. Create with invalid id payload (if we check id, but here it's auto-id so we don't strictly enforce ID besides string size if manually provided. For collections, creation relies on auto-id).
7. Read CVs as unauthenticated user. -> Rejected (requires Admin).
8. Read CVs as authenticated non-admin user. -> Rejected (requires Admin).
9. Update CV to change studentName. -> Rejected (requires Admin).
10. Update CV status as non-admin. -> Rejected (requires Admin).
11. Update CV as Admin with missing/wrong status. -> Rejected by validation.
12. Delete CV as non-admin. -> Rejected (requires Admin).

## The Test Runner
(Will be implemented in `firestore.rules.test.ts`)
