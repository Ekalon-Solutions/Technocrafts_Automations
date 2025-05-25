import { config } from "../../config";
import axios from "axios";

const ENDPOINT = "/users/";

export interface PassportVisaRequest {
  id: string;
  token: string;
}
export interface PassportVisaResponse {
  passportVisa: PassportVisaResponse | PromiseLike<PassportVisaResponse>;
  visa: {
    visaExpiryDate: string;
    visaNumber: string;
    visaType: string;
    visaCountry: string[];
    multipleEntry: boolean;
    applicable: boolean;
  }[];
  passport: {
    passportIssueDate: string;
    passportExpiryDate: string;
    passportNumber: string;
  };
}

export const getUserPassportVisa = async (req: PassportVisaRequest): Promise<PassportVisaResponse> => {
  const apiURL = `${config.APIBaseURL}${ENDPOINT}${req.id}/passport-visa`;
  const response = await axios.get<PassportVisaResponse>(apiURL, {
    headers: {
      Authorization: `Bearer ${req.token}`
    }
  });
  if (response.status !== 200) {
    throw new Error(response.statusText);
  }

  return response.data.passportVisa;
};