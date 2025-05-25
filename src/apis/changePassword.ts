import axios from "axios";
import { config } from "../../config";

const ENDPOINT = "/users";

export interface ChangePasswordRequest {
  userId: string;
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export const changePassword = async (
  req: ChangePasswordRequest,
  authToken: string
): Promise<ChangePasswordResponse> => {
  const apiURL = `${config.APIBaseURL}${ENDPOINT}/${req.userId}/update-password`;

  try {
    const response = await axios.put(
      apiURL,
      {
        oldPassword: req.oldPassword,
        newPassword: req.newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(response.statusText);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to change password");
    }
    throw error;
  }
};