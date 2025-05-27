import React, { Suspense, lazy } from 'react';
import {
  Routes,
  Route,
} from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from './ProtectedRoute';

const Login = lazy(() => import("./pages/Login"));
const Profile = lazy(() => import("./pages/Profile"));
const Home = lazy(() => import("./pages/Home"));
const Employees = lazy(() => import("./pages/Employees"));
const NoMatch = lazy(() => import("./pages/NoMatch"));

const BOMCreator = lazy(() => import("./pages/BOMCreator"));
const PDFIndexer = lazy(() => import("./pages/PDFIndexer"));

const GlobalLoadingIndicator: React.FC = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-gray-200 z-50">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Suspense fallback={<GlobalLoadingIndicator />}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/pdf-tools" element={<ProtectedRoute><PDFIndexer /></ProtectedRoute>} />
          <Route path="/bom-creator" element={<ProtectedRoute><BOMCreator /></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute requiredAccess={['Admin', 'Marketing']}><Employees /></ProtectedRoute>} />
          <Route path="*" element={<NoMatch />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
};

export default App;