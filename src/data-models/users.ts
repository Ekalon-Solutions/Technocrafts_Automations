export interface Experience {
  product_name: string;
  years: number;
}

export interface Visa {
  visaExpiryDate: Date;
  visaNumber: string;
  visaType: string;
  visaCountry: string[];
  multipleEntry: boolean;
  applicable: boolean;
}

export interface Passport {
  passportIssueDate: Date;
  passportExpiryDate: Date;
  passportNumber: string;
}

export interface User {
  travelDetails: never[];
  id: string;
  code: string;
  name: string;
  grade?: string;
  branch: string;
  birthDate?: Date;
  department: string;
  designation: string;
  access: string;
  joinDate?: Date;
  gender: 'Male' | 'Female';
  email: string;
  alternateEmail?: string;
  phoneNumber?: string;
  alternativePhoneNumber?: string;
  experience: Experience[];
  password: string;
  profilePictureURL?: string;
  visa?: Visa[];
  passport?: Passport;
  curr_location: string;
}