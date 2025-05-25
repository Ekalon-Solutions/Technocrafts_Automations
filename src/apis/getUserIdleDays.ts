import { config } from "../../config";
import axios from "axios";

const ENDPOINT = "/users/";

export interface GetUserIdleDaysRequest {
  id: string;
  token: string;
}
interface IdleDaysResponse {
  totalIdleDays: number;
}

export const getUserIdleDays = async (req: GetUserIdleDaysRequest): Promise<IdleDaysResponse> => {
  const apiURL = `${config.APIBaseURL}${ENDPOINT}${req.id}/idle-days`;
  const response = await axios.get<IdleDaysResponse>(apiURL, {
    headers: {
      Authorization: `Bearer ${req.token}`
    }
  });
  if (response.status !== 200) {
    throw new Error(response.statusText);
  }
  return response.data;
};