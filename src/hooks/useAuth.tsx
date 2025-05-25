import React, { createContext, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "./useLocalStorage";
import { User } from "../data-models/users";
import {
  VerifyUserRequest,
  VerifyUserResponse,
  verifyUser,
} from "../apis/verifyUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Snackbar, Alert } from "@mui/material";

export interface AuthProviderProps {
  children: React.ReactNode;
}

export interface AuthContextType {
  user: User | null;
  loginUser: ReturnType<typeof useMutation<VerifyUserResponse, Error, VerifyUserRequest, unknown>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { storedValue: user, setValue: setUser } = useLocalStorage<User | null>("user", null);
  const { setValue: setAuthToken, clearLocalStorage } = useLocalStorage<string>("token", "");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">("success");

  const loginUser = useMutation<VerifyUserResponse, Error, VerifyUserRequest>({
    mutationFn: verifyUser,
    onSuccess: (data) => {
      setToastSeverity("success");
      setToastMessage(data.message);
      setToastOpen(true);
      const { token, ...user } = data.user;
      setAuthToken(token);
      setUser(user);
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      navigate("/home");
    },
    onError: (error) => {
      setToastSeverity("error");
      setToastMessage(error.message);
      setToastOpen(true);
    },
  });

  const logout = () => {
    setUser(null);
    clearLocalStorage();
    setToastSeverity("success");
    setToastMessage("You have been logged out successfully.");
    setToastOpen(true);
    navigate("/", { replace: true });
  };

  const handleToastClose = () => setToastOpen(false);

  const value = useMemo(() => ({ user, loginUser, logout }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      <Snackbar open={toastOpen} autoHideDuration={6000} onClose={handleToastClose}>
        <Alert onClose={handleToastClose} severity={toastSeverity}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};