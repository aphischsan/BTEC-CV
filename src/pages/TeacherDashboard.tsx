import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { format } from 'date-fns';
import { CVPreview } from '../components/CVPreview';
import { FileText, Download, CheckCircle, Trash2, LogIn, Monitor, ArrowLeft, Printer, X } from 'lucide-react';

import { Link } from 'react-router-dom';

interface CVSubmission {
  id: string;
  studentName: string;
  studentEmail: string;
  status: 'submitted' | 'reviewed';
  cvData: string;
  createdAt: string;
}

export default function TeacherDashboard() {
  const [submissions, setSubmissions] = useState<CVSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);
  const [selectedCV, setSelectedCV] = useState<any>(null);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setSubmissions([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'cv_submissions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const subs: CVSubmission[] = [];
        snapshot.forEach((doc) => {
          let dateStr = 'Unknown';
          const data = doc.data();
          if (data.createdAt?.toDate) {
             dateStr = format(data.createdAt.toDate(), 'PPP p');
          }
          subs.push({
            id: doc.id,
            studentName: data.studentName,
            studentEmail: data.studentEmail,
            status: data.status,
            cvData: data.cvData,
            createdAt: dateStr
          });
        });
        setSubmissions(subs);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        handleFirestoreError(error, OperationType.GET, 'cv_submissions');
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed", error);
    }
  };

  const markAsReviewed = async (id: string) => {
    try {
      await updateDoc(doc(db, 'cv_submissions', id), { status: 'reviewed' });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `cv_submissions/${id}`);
    }
  };

  const deleteSubmission = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this CV submission?")) {
      try {
        await deleteDoc(doc(db, 'cv_submissions', id));
        if (selectedCV?.id === id) {
          setSelectedCV(null);
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `cv_submissions/${id}`);
      }
    }
  };

  const viewCV = (cvObj: any) => {
    setSelectedCV(cvObj);
  };


  if (!user) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
          <Monitor size={48} className="mx-auto text-blue-600 mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Teacher Dashboard</h1>
          <p className="text-slate-600 mb-6">Log in to view and review student CV submissions.</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white rounded-md py-3 font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
          >
            <LogIn size={20} />
            Sign in with Google
          </button>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
             <Link to="/" className="text-slate-500 hover:text-blue-600 font-medium flex items-center justify-center gap-2">
               <ArrowLeft size={16} /> Back to Builder
             </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden print:h-auto print:overflow-visible print:bg-white print:block">
      <header className={`h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm shrink-0 ${selectedCV ? 'print:hidden' : ''}`}>
         <div className="flex items-center gap-3">
          <Link to="/" className="text-slate-400 hover:text-blue-600 mr-2" title="Back to Builder">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">
            T
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Teacher <span className="text-blue-600">Dashboard</span></h1>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-sm font-medium text-slate-600">{user.email}</span>
           <button onClick={() => auth.signOut()} className="text-sm text-slate-500 hover:text-slate-800">Sign Out</button>
        </div>
      </header>
      
      <main className={`flex-1 overflow-auto p-6 flex justify-center ${selectedCV ? 'print:hidden' : ''}`}>
        <div className="max-w-5xl w-full">
          <div className="flex justify-between items-end mb-6">
            <div>
               <h2 className="text-2xl font-bold text-slate-800">Student CVs</h2>
               <p className="text-slate-500 text-sm mt-1">Review and manage submitted CVs</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-md shadow-sm border border-slate-200 text-sm font-medium text-slate-600">
               Total: {submissions.length}
            </div>
          </div>
          
          {loading ? (
             <div className="text-center py-12 text-slate-500">Loading submissions...</div>
          ) : submissions.length === 0 ? (
             <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
               <FileText size={48} className="mx-auto text-slate-300 mb-4" />
               <h3 className="text-lg font-medium text-slate-700">No submissions yet</h3>
               <p className="text-slate-500 mt-1">When students complete their CVs, they will appear here.</p>
             </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Submission Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200 text-sm">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{sub.studentName}</div>
                        <div className="text-slate-500 text-xs">{sub.studentEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                        {sub.createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          sub.status === 'reviewed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sub.status === 'reviewed' ? 'Reviewed' : 'Needs Review'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => {
                               try { 
                                 const parsed = JSON.parse(sub.cvData); 
                                 viewCV(parsed);
                               } catch (e) {} 
                            }}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            title="View CV"
                          >
                             <FileText size={16} /> View
                          </button>
                          
                          {sub.status === 'submitted' && (
                            <button 
                              onClick={() => markAsReviewed(sub.id)}
                              className="text-emerald-600 hover:text-emerald-900 flex items-center gap-1"
                            >
                               <CheckCircle size={16} /> Mark Reviewed
                            </button>
                          )}
                          
                          <button 
                            onClick={() => deleteSubmission(sub.id)}
                            className="text-red-500 hover:text-red-700 flex items-center gap-1 ml-2"
                          >
                             <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* CV Modal Overlay */}
      {selectedCV && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/80 print:bg-white print:relative print:w-full print:h-full">
          <div className="flex bg-slate-900 text-white h-14 shrink-0 px-4 items-center justify-between print:hidden shadow-md">
            <h2 className="font-semibold">{selectedCV.personalDetails?.fullName || 'Student'} - CV</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center px-4 py-2 hover:bg-slate-800 rounded-md transition-colors gap-2"
              >
                <Printer size={16} />
                <span>Print</span>
              </button>
              <div className="w-px h-6 bg-slate-700 mx-2 hidden sm:block" />
              <button
                onClick={() => setSelectedCV(null)}
                className="flex items-center p-2 hover:bg-slate-800 rounded-md transition-colors text-slate-300 hover:text-white"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center print:p-0 print:overflow-visible">
            <div className="w-full max-w-[210mm] print:max-w-none">
              <CVPreview data={selectedCV} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
