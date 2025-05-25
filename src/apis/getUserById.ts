import { config } from "../../config";
import axios from "axios";
import { User } from '../data-models/users';

const ENDPOINT = "/users/";

export interface GetUserByIdRequest {
  id: string;
}

export interface GetUserByIdResponse {
  user: User;
}

export const getUserById = async (
  req: GetUserByIdRequest,
  authToken: string
): Promise<GetUserByIdResponse> => {
  const apiURL = `${config.APIBaseURL}${ENDPOINT}${req.id}`;
  const response = await axios.get<GetUserByIdResponse>(apiURL, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (response.status !== 200) {
    throw new Error(response.statusText);
  }
  return response.data;
};