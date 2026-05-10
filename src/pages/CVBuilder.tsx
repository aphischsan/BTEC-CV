import React, { useState, useEffect } from 'react';
import { Download, FileText, Layout, Send, Sparkles } from 'lucide-react';
import { CVData } from '../lib/types';
import { DEFAULT_CV_DATA } from '../lib/constants';
import { CVForm } from '../components/CVForm';
import { CVPreview } from '../components/CVPreview';
import { CoverLetterGenerator } from '../components/CoverLetterGenerator';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function CVBuilder() {
  const [data, setData] = useState<CVData>(() => {
    const saved = localStorage.getItem('btec-cv-data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_CV_DATA;
      }
    }
    return DEFAULT_CV_DATA;
  });

  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'coverLetter'>('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    localStorage.setItem('btec-cv-data', JSON.stringify(data));
  }, [data]);

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = async () => {
    if (!data.personalDetails.fullName) {
      alert("Please enter your full name before submitting.");
      return;
    }
    setIsSubmitting(true);
    setSubmitSuccess(false);
    
    try {
      const payload = {
        status: 'submitted',
        studentName: data.personalDetails.fullName,
        studentEmail: data.personalDetails.email || 'No email provided',
        cvData: JSON.stringify(data),
        createdAt: serverTimestamp(),
      };
      
      const path = 'cv_submissions';
      try {
        await addDoc(collection(db, path), payload);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
      
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (e) {
      alert("Failed to submit. Please try again later.");
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden print:h-auto print:overflow-visible print:bg-white print:block">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-sm shrink-0 print:hidden z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">
            B
          </div>
          <h1 className="text-xl font-semibold tracking-tight">BTEC <span className="text-blue-600">Simple CV</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/teacher" className="text-xs text-slate-400 hover:text-blue-600 hidden sm:block mr-2" title="Teacher Dashboard">
            Teacher Login
          </Link>
          <span className="text-sm text-slate-500 hidden sm:block">
            {submitSuccess ? <span className="text-green-600 font-medium">✓ CV Submitted!</span> : "Auto-saved to local storage"}
          </span>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 ${isSubmitting || submitSuccess ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'} rounded-md font-medium flex items-center gap-2 text-sm transition-colors shadow-sm`}
          >
            <Send size={16} />
            <span className="hidden sm:inline">{isSubmitting ? 'Submitting...' : submitSuccess ? 'Submitted' : 'Submit to Teacher'}</span>
            <span className="sm:hidden">{isSubmitting ? '...' : 'Submit'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium flex items-center gap-2 text-sm hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex flex-1 overflow-hidden flex-col lg:flex-row print:overflow-visible print:block print:h-auto">
        
        {/* Mobile Tabs */}
        <div className="flex lg:hidden bg-white px-2 py-2 border-b border-slate-200 shrink-0 print:hidden gap-1">
          <button
            className={`flex-1 py-1.5 text-xs sm:text-sm font-medium rounded-md flex items-center justify-center transition-colors ${activeTab === 'edit' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
            onClick={() => setActiveTab('edit')}
          >
            <Layout size={14} className="mr-1 sm:mr-2" />
            Edit CV
          </button>
          <button
            className={`flex-1 py-1.5 text-xs sm:text-sm font-medium rounded-md flex items-center justify-center transition-colors ${activeTab === 'preview' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
            onClick={() => setActiveTab('preview')}
          >
            <FileText size={14} className="mr-1 sm:mr-2" />
            CV Preview
          </button>
          <button
            className={`flex-1 py-1.5 text-xs sm:text-sm font-medium rounded-md flex items-center justify-center transition-colors ${activeTab === 'coverLetter' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
            onClick={() => setActiveTab('coverLetter')}
          >
            <Sparkles size={14} className="mr-1 sm:mr-2" />
            Cover Letter
          </button>
        </div>

        {/* Editor Panel */}
        <section className={`flex-1 lg:flex-none w-full lg:w-[450px] xl:w-[500px] bg-white border-r border-slate-200 overflow-y-auto p-4 sm:p-6 print:hidden ${activeTab === 'edit' ? 'block' : 'hidden lg:block'}`}>
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 mb-1">Student Tip</h3>
            <p className="text-xs text-slate-600 leading-relaxed italic">"For hospitality roles, highlight your 'Soft Skills' like teamwork and punctuality first! You don't need a lot of experience to have a great CV."</p>
          </div>
          <CVForm data={data} onChange={setData} />
        </section>

        {/* Preview / Cover Letter Panel */}
        <section className={`flex-1 bg-slate-200 flex-col overflow-hidden print:bg-white print:overflow-visible print:!flex ${activeTab === 'edit' ? 'hidden lg:flex' : 'flex'}`}>
          {/* Desktop Right Panel Tabs */}
          <div className="hidden lg:flex bg-white px-6 border-b border-slate-200 shrink-0 print:hidden items-end gap-6 h-12">
            <button
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab !== 'coverLetter' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              onClick={() => setActiveTab('preview')}
            >
              <div className="flex items-center gap-2"><FileText size={16} /> CV Preview</div>
            </button>
            <button
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'coverLetter' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              onClick={() => setActiveTab('coverLetter')}
            >
              <div className="flex items-center gap-2"><Sparkles size={16} /> Cover Letter Generator</div>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center print:p-0 print:block print:overflow-visible print:h-auto">
            <div className="w-full h-max flex justify-center print:block print:h-auto print:overflow-visible">
              {activeTab === 'coverLetter' ? (
                <CoverLetterGenerator data={data} />
              ) : (
                <CVPreview data={data} />
              )}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
