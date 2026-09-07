import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { afterAll, beforeAll, describe, it } from 'vitest';

let testEnv: RulesTestEnvironment;

const validSubmission = () => ({
  status: 'submitted',
  studentName: 'Test Student',
  studentEmail: 'student@example.com',
  cvData: '{}',
  createdAt: serverTimestamp(),
});

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-btec-cv',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('cv_submissions security rules', () => {
  it('allows an unauthenticated student to create a valid submission', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const ref = doc(collection(db, 'cv_submissions'));

    await assertSucceeds(setDoc(ref, validSubmission()));
  });

  it('rejects extra fields and reviewed status on create', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    const extraFieldRef = doc(collection(db, 'cv_submissions'));
    await assertFails(setDoc(extraFieldRef, {
      ...validSubmission(),
      isAdmin: true,
    }));

    const reviewedRef = doc(collection(db, 'cv_submissions'));
    await assertFails(setDoc(reviewedRef, {
      ...validSubmission(),
      status: 'reviewed',
    }));
  });

  it('rejects an oversized CV payload', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const ref = doc(collection(db, 'cv_submissions'));

    await assertFails(setDoc(ref, {
      ...validSubmission(),
      cvData: 'x'.repeat(50001),
    }));
  });

  it('blocks CV reads for students and non-admin signed-in users', async () => {
    const id = 'read_test';

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'cv_submissions', id), {
        status: 'submitted',
        studentName: 'Read Test',
        studentEmail: 'read@example.com',
        cvData: '{}',
        createdAt: Timestamp.now(),
      });
    });

    await assertFails(
      getDoc(doc(testEnv.unauthenticatedContext().firestore(), 'cv_submissions', id)),
    );

    await assertFails(
      getDoc(
        doc(
          testEnv.authenticatedContext('student-user', { email: 'student@example.com' }).firestore(),
          'cv_submissions',
          id,
        ),
      ),
    );
  });

  it('allows the verified bootstrap teacher to read and update only status', async () => {
    const id = 'admin_test';

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'cv_submissions', id), {
        status: 'submitted',
        studentName: 'Admin Test',
        studentEmail: 'admin-test@example.com',
        cvData: '{}',
        createdAt: Timestamp.now(),
      });
    });

    const adminDb = testEnv.authenticatedContext('teacher-user', {
      email: 'pissan282@gmail.com',
      email_verified: true,
    }).firestore();

    const ref = doc(adminDb, 'cv_submissions', id);
    await assertSucceeds(getDoc(ref));
    await assertSucceeds(updateDoc(ref, { status: 'reviewed' }));
    await assertFails(updateDoc(ref, { studentName: 'Changed Name' }));
  });
});
