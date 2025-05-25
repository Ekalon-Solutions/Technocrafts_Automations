import { config } from "../../config";
import axios from "axios";
import { User } from '../data-models/users';

const ENDPOINT = "/users/";

export interface GetUserRequest {
  id: string;
}

export interface GetUserResponse {
  user: User
}

export const getUser = async (req: GetUserRequest): Promise<GetUserResponse> => {
  const apiURL = `${config.APIBaseURL}${ENDPOINT}${req.id}`;
  const response = await axios.get<GetUserResponse>(apiURL);
  if (response.status !== 200) {
    throw new Error(response.statusText);
  }
  return response.data;
};