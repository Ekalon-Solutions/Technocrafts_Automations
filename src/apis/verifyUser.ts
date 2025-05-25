import { config } from "../../config";
import axios from "axios";
import { User } from '../data-models/users';

const ENDPOINT = "/users/authenticate";

export interface VerifyUserRequest {
    email: string;
    password: string;
}

export interface VerifyUserResponse {
    user: User & { token: string };
    message: string;
}

export const verifyUser = async (req: VerifyUserRequest): Promise<VerifyUserResponse> => {
    const apiURL = `${config.APIBaseURL}${ENDPOINT}`;
    try {
        const response = await axios.post<VerifyUserResponse>(apiURL, req);
        if (response.status !== 200) {
            throw new Error(response.statusText);
        }
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || error.message);
        } else {
            throw new Error("An unexpected error occurred");
        }
    }
};