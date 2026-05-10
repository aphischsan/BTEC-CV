import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { CVData } from '../lib/types';
import { Loader2, Sparkles, Copy, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  data: CVData;
}

export function CoverLetterGenerator({ data }: Props) {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!data.personalDetails.fullName) {
      setError("Please fill out your full name in the CV first.");
      return;
    }
    
    setIsGenerating(true);
    setError('');
    
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `You are an expert career advisor helping a BTEC vocational student write a simple, professional, and confident cover letter based on their CV.
      
CV Details:
- Name: ${data.personalDetails.fullName}
- Email: ${data.personalDetails.email}
- Phone: ${data.personalDetails.phone}
- Address: ${data.personalDetails.address}
- Profile: ${data.personalProfile}
- Education: ${data.education.map(e => `${e.summary} at ${e.school}`).join(' | ')}
- Work Experience: ${[...data.workExperience, ...data.partTimeJobs, ...data.volunteering].map(w => `${w.role} at ${w.employer || 'Various'}. ${w.summary}`).join(' | ')}
- Skills: ${[...data.skills.work, ...data.skills.interpersonal, ...data.skills.custom].join(', ')}

Target Job:
- Job Title: ${jobTitle || 'Relevant Position'}
- Company: ${companyName || 'Your Company'}

Task:
Write a short, engaging, and professional cover letter (about 3-4 paragraphs) suitable for a young person or BTEC student applying for this role. Do not use overly complex vocabulary; keep it natural, enthusiastic, and focused on their transferable skills, reliability, and willingness to learn.

Use standard cover letter formatting with the sender's details and recipient's details at the top (use placeholders for recipient address if unknown).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });
      
      setCoverLetter(response.text || '');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while generating the cover letter.');
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
          Enter the details of the job you're applying for, and we'll write a professional cover letter using the information from your CV.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Job Title / Role</label>
            <input 
              type="text" 
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Junior Hospitality Assistant"
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
