import React from 'react';
import { CVData, ExperienceItem, EducationItem } from '../lib/types';
import { SUGGESTED_WORK_SKILLS, SUGGESTED_INTERPERSONAL_SKILLS } from '../lib/constants';
import { Input, Textarea, SectionAccordion, AddItemButton, RemoveItemButton, CheckboxGroup } from './FormKit';

interface CVFormProps {
  data: CVData;
  onChange: (data: CVData | ((prev: CVData) => CVData)) => void;
}

export const CVForm: React.FC<CVFormProps> = ({ data, onChange }) => {
  const handleChange = (section: keyof CVData, field: string, value: any) => {
    onChange((prev: CVData) => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && !Array.isArray(prev[section])
        ? { ...prev[section], [field]: value }
        : value,
    }));
  };

  const handleArrayChange = (section: keyof CVData, index: number, field: string, value: any) => {
    onChange((prev: CVData) => {
      const arr = [...(prev[section] as any[])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [section]: arr };
    });
  };

  const addArrayItem = (section: keyof CVData, defaultItem: any) => {
    onChange((prev: CVData) => ({
      ...prev,
      [section]: [...(prev[section] as any[]), { ...defaultItem, id: crypto.randomUUID() }]
    }));
  };

  const removeArrayItem = (section: keyof CVData, index: number) => {
    onChange((prev: CVData) => {
      const arr = [...(prev[section] as any[])];
      arr.splice(index, 1);
      return { ...prev, [section]: arr };
    });
  };

  // Generic render for experience arrays (work, part-time, volunteering)
  const renderExperienceSection = (
    sectionKey: 'workExperience' | 'partTimeJobs' | 'volunteering',
    title: string,
    roleLabel: string,
    employerLabel: string,
    defaultRole: string = ''
  ) => (
    <SectionAccordion title={title}>
      {data[sectionKey].map((item, index) => (
        <div key={item.id} className="p-4 border border-slate-200 rounded-md mb-4 bg-white relative">
          <div className="absolute top-2 right-2">
            <RemoveItemButton onClick={() => removeArrayItem(sectionKey, index)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <Input
              label={roleLabel}
              value={item.role}
              onChange={(e: any) => handleArrayChange(sectionKey, index, 'role', e.target.value)}
              placeholder={defaultRole}
            />
            <Input
              label={employerLabel}
              value={item.employer}
              onChange={(e: any) => handleArrayChange(sectionKey, index, 'employer', e.target.value)}
            />
            <Input
              label="Start Date"
              type="text"
              placeholder="e.g. Sep 2022"
              value={item.startDate}
              onChange={(e: any) => handleArrayChange(sectionKey, index, 'startDate', e.target.value)}
            />
            <Input
              label="End Date"
              type="text"
              placeholder="e.g. Present"
              value={item.endDate}
              onChange={(e: any) => handleArrayChange(sectionKey, index, 'endDate', e.target.value)}
            />
          </div>
          <Textarea
            label="Summary of responsibilities"
            rows={3}
            value={item.summary}
            onChange={(e: any) => handleArrayChange(sectionKey, index, 'summary', e.target.value)}
            helperText="Keep it simple. E.g. Served customers, cleaned tables, managed cash register."
          />
        </div>
      ))}
      <AddItemButton
        label={"Add " + title}
        onClick={() => addArrayItem(sectionKey, { role: '', employer: '', startDate: '', endDate: '', summary: '' })}
      />
    </SectionAccordion>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-2 pb-12">
      <SectionAccordion title="Personal Details" defaultOpen>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Input
            label="Full Name"
            value={data.personalDetails.fullName}
            onChange={(e: any) => handleChange('personalDetails', 'fullName', e.target.value)}
            placeholder="John Doe"
          />
          <Input
            label="Email"
            type="email"
            value={data.personalDetails.email}
            onChange={(e: any) => handleChange('personalDetails', 'email', e.target.value)}
            placeholder="john@example.com"
          />
          <Input
            label="Phone"
            type="tel"
            value={data.personalDetails.phone}
            onChange={(e: any) => handleChange('personalDetails', 'phone', e.target.value)}
            placeholder="07700 900000"
          />
          <Input
            label="Address / Location"
            value={data.personalDetails.address}
            onChange={(e: any) => handleChange('personalDetails', 'address', e.target.value)}
            placeholder="London, UK"
          />
        </div>
      </SectionAccordion>

      <SectionAccordion title="Personal Profile">
        <Textarea
          label="Profile Statement"
          rows={4}
          value={data.personalProfile}
          onChange={(e: any) => handleChange('personalProfile', '', e.target.value)}
          helperText="A short paragraph about who you are and what you want to achieve. E.g. 'I am a hardworking BTEC Hospitality student looking for a part-time role as a Waiter. I am friendly, reliable, and eager to learn.'"
        />
      </SectionAccordion>

      <SectionAccordion title="Education">
        {data.education.map((item, index) => (
          <div key={item.id} className="p-4 border border-slate-200 rounded-md mb-4 relative bg-white">
            <div className="absolute top-2 right-2">
              <RemoveItemButton onClick={() => removeArrayItem('education', index)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <Input
                label="School / College"
                value={item.school}
                onChange={(e: any) => handleArrayChange('education', index, 'school', e.target.value)}
              />
              <Input
                label="Dates"
                placeholder="e.g. 2021 - Present"
                value={item.startDate}
                onChange={(e: any) => handleArrayChange('education', index, 'startDate', e.target.value)}
              />
            </div>
            <Textarea
              label="Qualifications / Subjects"
              rows={2}
              value={item.summary}
              onChange={(e: any) => handleArrayChange('education', index, 'summary', e.target.value)}
              helperText="E.g. BTEC Level 2 Hospitality (Predicted Merit), 5 GCSEs including Maths & English."
            />
          </div>
        ))}
        <AddItemButton
          label="Add Education"
          onClick={() => addArrayItem('education', { school: '', startDate: '', endDate: '', summary: '' })}
        />
      </SectionAccordion>

      {renderExperienceSection('workExperience', 'Work Experience', 'Job Title', 'Employer', 'e.g. Kitchen Assistant')}
      {renderExperienceSection('partTimeJobs', 'Part-time Jobs', 'Job Title', 'Employer')}
      {renderExperienceSection('volunteering', 'Volunteering & School Activities', 'Role', 'Organization', 'e.g. Event Helper')}

      <SectionAccordion title="Skills Checklist">
        <CheckboxGroup
          title="Work Skills (Select your strengths)"
          options={SUGGESTED_WORK_SKILLS}
          selected={data.skills.work}
          onChange={(vals: string[]) => onChange((prev: CVData) => ({ ...prev, skills: { ...prev.skills, work: vals } }))}
        />
        <div className="mt-6 border-t border-slate-100 pt-6">
          <CheckboxGroup
            title="Interpersonal Skills (How you work with others)"
            options={SUGGESTED_INTERPERSONAL_SKILLS}
            selected={data.skills.interpersonal}
            onChange={(vals: string[]) => onChange((prev: CVData) => ({ ...prev, skills: { ...prev.skills, interpersonal: vals } }))}
          />
        </div>
        <div className="mt-6 border-t border-slate-100 pt-6">
          <Input
            label="Other Skills (Comma separated)"
            placeholder="e.g. First Aid, Food Hygiene Level 2"
            value={data.skills.custom.join(', ')}
            onChange={(e: any) => onChange((prev: CVData) => ({
              ...prev,
              skills: { ...prev.skills, custom: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) }
            }))}
          />
        </div>
      </SectionAccordion>

      <SectionAccordion title="Achievements & Certificates">
        <Textarea
          label="Achievements"
          rows={3}
          value={data.achievements.join('\n')}
          onChange={(e: any) => handleChange('achievements', '', e.target.value.split('\n'))}
          helperText="Put each achievement on a new line. E.g. 100% Attendance Award."
        />
        <Textarea
          label="Certificates"
          rows={3}
          value={data.certificates.join('\n')}
          onChange={(e: any) => handleChange('certificates', '', e.target.value.split('\n'))}
          helperText="Put each certificate on a new line. E.g. Basic Food Hygiene Certificate."
        />
      </SectionAccordion>

      <SectionAccordion title="Hobbies & Interests">
         <Textarea
          label="What do you enjoy doing?"
          rows={3}
          value={data.hobbies.join('\n')}
          onChange={(e: any) => handleChange('hobbies', '', e.target.value.split('\n'))}
          helperText="List hobbies that show good traits. Put each on a new line. E.g. Playing football (shows teamwork)."
        />
      </SectionAccordion>

      <SectionAccordion title="References">
        <Input
          label="References text"
          value={data.references}
          onChange={(e: any) => handleChange('references', '', e.target.value)}
          helperText="Usually 'Available upon request' is best for simple CVs."
        />
      </SectionAccordion>

    </div>
  );
};
