import { config } from "../../config";
import axios from "axios";

const ENDPOINT = "/users/";

export interface UserExperience {
    product_name: string;
    years: number;
}

export interface GetUserExperienceRequest {
    id: string;
    token: string;
}

export interface GetUserExperienceResponse {
    experience: UserExperience[];
    message: string;
}

export const getUserExperience = async (req: GetUserExperienceRequest): Promise<GetUserExperienceResponse> => {
    const apiURL = `${config.APIBaseURL}${ENDPOINT}${req.id}/experience`;
    const response = await axios.get<GetUserExperienceResponse>(apiURL, {
        headers: {
            Authorization: `Bearer ${req.token}`
        }
    });
    if (response.status !== 200) {
        throw new Error(response.statusText);
    }
    return response.data;
};