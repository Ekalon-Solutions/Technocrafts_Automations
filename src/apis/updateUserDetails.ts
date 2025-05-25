import axios from 'axios';
import { config } from '../../config';

const ENDPOINT = '/users/';

export interface UserUpdateDetails {
  name?: string;
  branch?: string;
  birthDate?: string;
  department?: string;
  designation?: string;
  joinDate?: string;
  gender?: string;
  email?: string;
  phoneNumber?: string;
  alternateEmail?: string;
  alternativePhoneNumber?: string;
  experience?: Array<{
    product_id: string;
    years: number;
  }>;
  passport?: {
    passportIssueDate?: string;
    passportExpiryDate?: string;
    passportNumber?: string;
  };
  visa?: Array<{
    visaExpiryDate?: string | null;
    visaNumber?: string;
    visaType?: string;
    visaCountry?: string[];
    multipleEntry?: boolean;
    applicable?: boolean;
  }>;
}

interface UpdateUserDetailsRequest {
  id: string;
  userData: UserUpdateDetails;
  token: string;
}

interface UpdateUserDetailsResponse {
  user: UserUpdateDetails;
  message: string;
}

export const updateUserDetails = async (
  req: UpdateUserDetailsRequest
): Promise<UpdateUserDetailsResponse> => {
  const apiURL = `${config.APIBaseURL}${ENDPOINT}${req.id}/profile`;

  try {
    const response = await axios.put(apiURL, req.userData, {
      headers: {
        Authorization: `Bearer ${req.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status !== 200) {
      throw new Error(response.statusText);
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};