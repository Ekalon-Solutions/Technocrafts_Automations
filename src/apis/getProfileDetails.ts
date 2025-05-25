import { config } from "../../config";
import axios from "axios";

const ENDPOINT = "/users/";

export interface UserProject {
  name: string;
  location: string;
  start_date: string;
  close_date: string;
}

export interface UserPassport {
  passportIssueDate: string;
  passportExpiryDate: string;
  passportNumber: string;
}

export interface UserVisa {
  visaExpiryDate: string;
  visaNumber: string;
  visaType: string;
  visaCountry: string[];
  multipleEntry: boolean;
  applicable: boolean;
}

export interface UserExperience {
  product_name: string;
  product_id: string;
  years: number;
}

export interface UserCompleteDetails {
  id: string;
  code: string;
  name: string;
  grade: string;
  branch: string;
  birthDate: string;
  department: string;
  designation: string;
  access: string;
  joinDate: string;
  gender: string;
  email: string;
  alternateEmail: string;
  phoneNumber: string;
  alternativePhoneNumber: string;
  experience: UserExperience[];
  profilePictureURL: string;
  visa: UserVisa[];
  passport: UserPassport;
  status: string;
  curr_project: string;
  curr_location: string;
  totalIdleDays: number;
  projects: UserProject[];
  travelDays: number;
}

export interface GetUserCompleteDetailsRequest {
  id: string;
  token: string;
}

export interface GetUserCompleteDetailsResponse {
  user: UserCompleteDetails;
  message: string;
}

export const getUserCompleteDetails = async (
  req: GetUserCompleteDetailsRequest
): Promise<GetUserCompleteDetailsResponse> => {
  const apiURL = `${config.APIBaseURL}${ENDPOINT}${req.id}/profile`;

  const response = await axios.get(apiURL, {
    headers: {
      Authorization: `Bearer ${req.token}`
    }
  });

  if (response.status !== 200) {
    throw new Error(response.statusText);
  }
  return response.data.profile;
};