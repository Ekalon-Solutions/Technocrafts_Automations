import { config } from "../../config";
import axios from "axios";
import { User } from "../data-models/users";

const ENDPOINT = "/users";

export interface UpdateProfilePictureRequest {
  userId: string;
  profilePictureURL: string;
}

export interface UpdateProfilePictureResponse {
  user: User;
  message: string;
}

export const updateProfilePicture = async (
  req: UpdateProfilePictureRequest,
  authToken: string
): Promise<UpdateProfilePictureResponse> => {
  const apiURL = `${config.APIBaseURL}${ENDPOINT}/${req.userId}/profile-picture`;

  try {
    const response = await axios.put(
      apiURL,
      { profilePictureURL: req.profilePictureURL },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 200) {
      return response.data;
    } else if (response.status === 404) {
      throw new Error("User Not Found!");
    } else {
      throw new Error(response.statusText);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error("User Not Found!");
      }
      throw new Error(error.response?.data?.message || "Failed to update profile picture");
    }
    throw error;
  }
};