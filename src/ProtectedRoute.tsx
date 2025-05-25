import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

export const ProtectedRoute = ({ children, requiredAccess }: { children: React.ReactNode, requiredAccess?: string | string[] }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" />;
  }
  if (requiredAccess) {
    const userHasAccess = Array.isArray(requiredAccess)
      ? requiredAccess.some((access) => user?.access?.includes(access))
      : user?.access?.includes(requiredAccess);

    if (!userHasAccess) {
      return <Navigate to="/" />;
    }
  }
  return children;
};