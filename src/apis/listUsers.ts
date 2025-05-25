import { config } from "../../config";
import axios from "axios";
import { User } from '../data-models/users';

const ENDPOINT = "/users/";

export interface GetListUsersResponse {
  users: User[];
}

export const listUsers = async (
  authToken: string,
): Promise<GetListUsersResponse> => {
  const apiURL = `${config.APIBaseURL}${ENDPOINT}`;
  const response = await axios.get<GetListUsersResponse>(apiURL, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (response.status !== 200) {
    throw new Error(response.statusText);
  }
  return response.data;
};