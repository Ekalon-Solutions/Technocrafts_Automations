import { config } from "../../config";
import axios from "axios";
import { User } from "../data-models/users";

const ENDPOINT = "/users/update/";

export const updateUser = async (
  authToken: string,
  request: Partial<User> & { id: string }
): Promise<User> => {
  const apiURL = `${config.APIBaseURL}${ENDPOINT}${request.id}`;

  try {
    const response = await axios.put<{ user: User }>(apiURL, request, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status !== 200) {
      throw new Error(response.statusText);
    }

    return response.data.user;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
        "Failed to update user"
      );
    }
    throw error;
  }
};