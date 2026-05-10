export interface PersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  employer: string;
  startDate: string;
  endDate: string;
  summary: string;
}

export interface EducationItem {
  id: string;
  school: string;
  startDate: string;
  endDate: string;
  summary: string;
}

export interface CVData {
  personalDetails: PersonalDetails;
  personalProfile: string;
  education: EducationItem[];
  workExperience: ExperienceItem[];
  partTimeJobs: ExperienceItem[];
  volunteering: ExperienceItem[];
  skills: {
    work: string[];
    interpersonal: string[];
    custom: string[];
  };
  achievements: string[];
  certificates: string[];
  hobbies: string[];
  references: string;
}
