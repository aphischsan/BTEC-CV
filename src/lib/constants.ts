import { CVData } from './types';

export const SUGGESTED_WORK_SKILLS = [
  'Customer Service',
  'Food Preparation',
  'Cash Handling',
  'Point of Sale (POS) Systems',
  'Table Service',
  'Health and Safety Compliance',
  'Cleaning and Hygiene',
  'Stock Control',
  'Event Setup',
  'Barista Skills',
  'Front Desk Operations',
];

export const SUGGESTED_INTERPERSONAL_SKILLS = [
  'Teamwork',
  'Communication',
  'Problem Solving',
  'Time Management',
  'Adaptability',
  'Positive Attitude',
  'Active Listening',
  'Patience',
  'Conflict Resolution',
  'Work Ethic',
];

export const SUGGESTED_JOB_ROLES = [
  'Waiter / Waitress',
  'Kitchen Assistant',
  'Cashier',
  'Housekeeper',
  'Barista',
  'Receptionist',
  'Café Crew',
  'Hotel Trainee',
  'Event Helper',
];

export const DEFAULT_CV_DATA: CVData = {
  personalDetails: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
  },
  personalProfile: '',
  education: [],
  workExperience: [],
  partTimeJobs: [],
  volunteering: [],
  skills: {
    work: [],
    interpersonal: [],
    custom: [],
  },
  achievements: [],
  certificates: [],
  hobbies: [],
  references: 'Available upon request',
};
