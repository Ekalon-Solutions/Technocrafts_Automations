import { config } from "../../config";
import axios from "axios";

const REQUEST_RESET_ENDPOINT = "/users/request-password-reset";
const VERIFY_TOKEN_ENDPOINT = "/users/verify-reset-token";
const RESET_PASSWORD_ENDPOINT = "/users/reset-password";

export interface RequestPasswordResetRequest {
    email: string;
}

export interface RequestPasswordResetResponse {
    message: string;
}

export interface VerifyResetTokenRequest {
    token: string;
    email: string;
}

export interface VerifyResetTokenResponse {
    valid: boolean;
}

export interface ResetPasswordRequest {
    token: string;
    email: string;
    newPassword: string;
}

export interface ResetPasswordResponse {
    message: string;
}

export const requestPasswordReset = async (
    req: RequestPasswordResetRequest
): Promise<RequestPasswordResetResponse> => {
    const apiURL = `${config.APIBaseURL}${REQUEST_RESET_ENDPOINT}`;
    try {
        const response = await axios.post<RequestPasswordResetResponse>(apiURL, req);
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

export const verifyResetToken = async (
    req: VerifyResetTokenRequest
): Promise<VerifyResetTokenResponse> => {
    const apiURL = `${config.APIBaseURL}${VERIFY_TOKEN_ENDPOINT}`;
    try {
        const response = await axios.post<VerifyResetTokenResponse>(apiURL, req);
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

export const resetPassword = async (
    req: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
    const apiURL = `${config.APIBaseURL}${RESET_PASSWORD_ENDPOINT}`;
    try {
        const response = await axios.post<ResetPasswordResponse>(apiURL, req);
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