import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { Loader2, Sparkles, Copy, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { functions } from '../lib/firebase';
import { CVData } from '../lib/types';

interface Props {
  data: CVData;
}

interface GenerateCoverLetterRequest {
  fullName: string;
  personalProfile: string;
  education: Array<{ school: string; summary: string }>;
  experience: Array<{ role: string; employer: string; summary: string }>;
  skills: string[];
  jobTitle: string;
  companyName: string;
}

interface GenerateCoverLetterResponse {
  text: string;
}

const generateCoverLetter = httpsCallable<
  GenerateCoverLetterRequest,
  GenerateCoverLetterResponse
>(functions, 'generateCoverLetter');

export function CoverLetterGenerator({ data }: Props) {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!data.personalDetails.fullName) {
      setError('Please fill out your full name in the CV first.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const experience = [
        ...data.workExperience,
        ...data.partTimeJobs,
        ...data.volunteering,
      ].map((item) => ({
        role: item.role,
        employer: item.employer,
        summary: item.summary,
      }));

      const response = await generateCoverLetter({
        fullName: data.personalDetails.fullName,
        personalProfile: data.personalProfile,
        education: data.education.map((item) => ({
          school: item.school,
          summary: item.summary,
        })),
        experience,
        skills: [
          ...data.skills.work,
          ...data.skills.interpersonal,
          ...data.skills.custom,
        ],
        jobTitle,
        companyName,
      });

      setCoverLetter(response.data.text || '');
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error
        ? err.message
        : 'An error occurred while generating the cover letter.';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="cover-letter-preview" className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-sm border border-slate-200 rounded-sm p-8 sm:p-12 print:shadow-none print:border-none print:p-0 print:m-0">

      <div className="print:hidden mb-12">
        <div className="flex items-center gap-2 mb-6 text-indigo-700">
          <Sparkles size={24} />
          <h2 className="text-2xl font-bold tracking-tight">AI Cover Letter Maker</h2>
        </div>

        <p className="text-slate-600 mb-6 text-sm">
          Enter the job details and we will create a cover letter using the relevant information from your CV.
          Your phone number, email and home address are not sent to the AI service.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Job Title / Role</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Junior Hospitality Assistant"
              maxLength={120}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Marriott Hotels"
              maxLength={120}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium text-sm transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate Cover Letter
            </>
          )}
        </button>
      </div>

      {coverLetter ? (
        <div className="relative group">
          <div className="absolute -top-4 -right-4 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-md shadow-md text-xs font-medium hover:bg-slate-800 transition-colors"
              title="Copy to clipboard"
            >
              {copied ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="prose prose-slate prose-sm sm:prose-base max-w-none
                          prose-p:leading-relaxed prose-p:mb-4
                          prose-headings:font-bold prose-a:text-blue-600">
            <ReactMarkdown>{coverLetter}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="hidden print:block text-slate-400 italic text-center py-20 border-2 border-dashed border-slate-200 rounded-lg">
          No cover letter generated yet. Please generate one before printing.
        </div>
      )}

    </div>
  );
}
