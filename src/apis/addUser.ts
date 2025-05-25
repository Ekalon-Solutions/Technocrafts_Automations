import { config } from "../../config";
import axios from "axios";
import { User } from "../data-models/users";

export interface CreateUserResponse {
  user: User;
  message: string;
}

const ENDPOINT = "/users/create";

export const createUser = async (
  authToken: string,
  request: User
): Promise<User> => {
  const apiURL = `${config.APIBaseURL}${ENDPOINT}`;

  const requiredFields: Array<keyof User> = [
    'email',
    'code',
    'name',
    'branch',
    'curr_location',
    'department',
    'designation',
    'password',
    'access'
  ];

  const missingFields = requiredFields.filter(field => !request[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  try {
    const response = await axios.post<CreateUserResponse>(
      apiURL,
      request,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.user;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || "Failed to create user";
      throw new Error(errorMessage);
    }
    throw error;
  }
};