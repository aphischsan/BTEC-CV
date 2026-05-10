import React from 'react';
import { CVData } from '../lib/types';
import { Mail, Phone, MapPin } from 'lucide-react';

interface CVPreviewProps {
  data: CVData;
}

export const CVPreview: React.FC<CVPreviewProps> = ({ data }) => {
  const {
    personalDetails,
    personalProfile,
    education,
    workExperience,
    partTimeJobs,
    volunteering,
    skills,
    achievements,
    certificates,
    hobbies,
    references,
  } = data;

  const hasSkills = skills.work.length > 0 || skills.interpersonal.length > 0 || skills.custom.length > 0;
  
  const cleanAchievements = achievements.filter(a => a.trim().length > 0);
  const cleanCertificates = certificates.filter(c => c.trim().length > 0);
  const cleanHobbies = hobbies.filter(h => h.trim().length > 0);

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <section className="mb-5 cv-section">
      <h2 className="text-[13px] font-bold text-slate-900 border-b border-slate-200 mb-3 uppercase tracking-wide">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );

  const renderExperienceItem = (item: any) => (
    <div key={item.id} className="mb-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-baseline mb-1">
        <div>
          <div className="font-bold text-slate-900">{item.role}</div>
          <div className="text-slate-600 italic text-[13px]">{item.employer || item.organization}</div>
        </div>
        <div className="text-slate-500 text-[13px] mt-1 sm:mt-0 font-medium whitespace-nowrap sm:ml-4">
          {item.startDate} {item.endDate ? `- ${item.endDate}` : ''}
        </div>
      </div>
      {item.summary && <p className="text-[13px] text-slate-700 mt-1 whitespace-pre-wrap leading-relaxed">{item.summary}</p>}
    </div>
  );

  return (
    <div id="cv-preview" className="bg-white shadow-2xl p-8 sm:p-10 flex flex-col text-[13px] leading-relaxed max-w-[210mm] w-full min-h-[297mm] mx-auto print:shadow-none print:p-0">
      {/* Header */}
      <header className="border-b-2 border-slate-800 pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight uppercase tracking-tighter">
            {personalDetails.fullName || 'YOUR NAME'}
          </h1>
          <p className="text-slate-600 font-medium mt-1">Aspiring Professional</p>
        </div>
        <div className="text-left sm:text-right text-slate-500 text-[13px] space-y-0.5">
          {personalDetails.email && <div>{personalDetails.email}</div>}
          {personalDetails.phone && <div>{personalDetails.phone}</div>}
          {personalDetails.address && <div>{personalDetails.address}</div>}
        </div>
      </header>

      {/* Profile */}
      {personalProfile && (
        <Section title="Personal Profile">
          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{personalProfile}</p>
        </Section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <Section title="Education">
          {education.map((item) => (
            <div key={item.id} className="mb-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-baseline mb-1">
                <div>
                  <div className="font-bold text-slate-900">{item.school}</div>
                </div>
                <div className="text-slate-500 text-[13px] mt-1 sm:mt-0 font-medium whitespace-nowrap sm:ml-4">
                  {item.startDate}
                </div>
              </div>
              {item.summary && <p className="text-[13px] text-slate-700 mt-1 whitespace-pre-wrap leading-relaxed">{item.summary}</p>}
            </div>
          ))}
        </Section>
      )}

      {/* Main Experience Types */}
      {workExperience.length > 0 && (
        <Section title="Work Experience">
          {workExperience.map(renderExperienceItem)}
        </Section>
      )}

      {partTimeJobs.length > 0 && (
        <Section title="Part-Time Jobs">
          {partTimeJobs.map(renderExperienceItem)}
        </Section>
      )}

      {volunteering.length > 0 && (
        <Section title="Volunteering & Activities">
          {volunteering.map(renderExperienceItem)}
        </Section>
      )}

      {/* Skills Grouped */}
      {hasSkills && (
        <Section title="Key Skills">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {skills.work.length > 0 && (
              <div>
                <span className="font-bold text-slate-900">Professional: </span>
                <span className="text-slate-700">{skills.work.join(', ')}</span>
              </div>
            )}
            {skills.interpersonal.length > 0 && (
              <div>
                <span className="font-bold text-slate-900">Interpersonal: </span>
                <span className="text-slate-700">{skills.interpersonal.join(', ')}</span>
              </div>
            )}
            {skills.custom.length > 0 && (
              <div className="sm:col-span-2">
                <span className="font-bold text-slate-900">Other Skills: </span>
                <span className="text-slate-700">{skills.custom.join(', ')}</span>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Achievements and Certificates side by side if both exist */}
      {(cleanAchievements.length > 0 || cleanCertificates.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 cv-section mb-5">
          {cleanAchievements.length > 0 && (
            <div>
              <h2 className="text-[13px] font-bold text-slate-900 border-b border-slate-200 mb-3 uppercase tracking-wide">
                Achievements
              </h2>
              <ul className="list-disc list-inside text-[13px] text-slate-700 space-y-1">
                 {cleanAchievements.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}
          {cleanCertificates.length > 0 && (
            <div>
              <h2 className="text-[13px] font-bold text-slate-900 border-b border-slate-200 mb-3 uppercase tracking-wide">
                Certificates
              </h2>
              <ul className="list-disc list-inside text-[13px] text-slate-700 space-y-1">
                 {cleanCertificates.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Hobbies */}
      {cleanHobbies.length > 0 && (
        <Section title="Hobbies & Interests">
           <ul className="list-disc list-inside text-[13px] text-slate-700 space-y-1">
              {cleanHobbies.map((item, i) => <li key={i}>{item}</li>)}
           </ul>
        </Section>
      )}

      {/* References */}
      {references && (
        <section className="mt-auto pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-end text-[11px] text-slate-400 gap-2">
          <p>{references}</p>
          <p className="print:hidden">Generated by BTEC Simple CV Builder</p>
        </section>
      )}
    </div>
  );
};
