import { GoogleGenAI } from '@google/genai';
import { defineSecret } from 'firebase-functions/params';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

const geminiApiKey = defineSecret('GEMINI_API_KEY');

type EducationInput = {
  school?: unknown;
  summary?: unknown;
};

type ExperienceInput = {
  role?: unknown;
  employer?: unknown;
  summary?: unknown;
};

type CoverLetterRequest = {
  fullName?: unknown;
  personalProfile?: unknown;
  education?: unknown;
  experience?: unknown;
  skills?: unknown;
  jobTitle?: unknown;
  companyName?: unknown;
};

function cleanString(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function cleanStringArray(value: unknown, maxItems: number, maxLength: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, maxItems)
    .map((item) => cleanString(item, maxLength))
    .filter(Boolean);
}

function cleanEducation(value: unknown): EducationInput[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 10).map((item) => {
    const entry = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    return {
      school: cleanString(entry.school, 120),
      summary: cleanString(entry.summary, 500),
    };
  });
}

function cleanExperience(value: unknown): ExperienceInput[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 15).map((item) => {
    const entry = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    return {
      role: cleanString(entry.role, 120),
      employer: cleanString(entry.employer, 120),
      summary: cleanString(entry.summary, 500),
    };
  });
}

export const generateCoverLetter = onCall(
  {
    region: 'us-central1',
    secrets: [geminiApiKey],
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async (request) => {
    const input = (request.data ?? {}) as CoverLetterRequest;

    const fullName = cleanString(input.fullName, 200);
    if (!fullName) {
      throw new HttpsError('invalid-argument', 'A student name is required.');
    }

    const personalProfile = cleanString(input.personalProfile, 1500);
    const education = cleanEducation(input.education);
    const experience = cleanExperience(input.experience);
    const skills = cleanStringArray(input.skills, 30, 100);
    const jobTitle = cleanString(input.jobTitle, 120) || 'Relevant Position';
    const companyName = cleanString(input.companyName, 120) || 'Your Company';

    const educationText = education
      .map((item) => `${item.summary || 'Student'} at ${item.school || 'School'}`)
      .join(' | ');

    const experienceText = experience
      .map((item) => `${item.role || 'Role'} at ${item.employer || 'Various'}. ${item.summary || ''}`)
      .join(' | ');

    const prompt = `You are helping a BTEC vocational student write a short, professional cover letter.

Student:
- Name: ${fullName}
- Profile: ${personalProfile || 'Not provided'}
- Education: ${educationText || 'Not provided'}
- Experience: ${experienceText || 'Not provided'}
- Skills: ${skills.join(', ') || 'Not provided'}

Target job:
- Role: ${jobTitle}
- Company: ${companyName}

Write 3 to 4 short paragraphs in clear, natural English suitable for a young BTEC student.
Focus on transferable skills, reliability, willingness to learn, teamwork, and hospitality/customer-service strengths when relevant.
Do not invent qualifications or work experience.
Do not include phone number, email address, home address, or other contact details.
Return only the cover-letter text.`;

    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey.value() });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 1200,
        },
      });

      const text = response.text?.trim();
      if (!text) {
        throw new Error('Gemini returned an empty response.');
      }

      return { text };
    } catch (error) {
      console.error('Cover letter generation failed', error);
      throw new HttpsError('internal', 'Unable to generate the cover letter right now.');
    }
  },
);
