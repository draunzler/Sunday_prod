import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedLayout: React.FC = () => {
  const userId = sessionStorage.getItem('user_id');

  if (!userId) {
    // Redirect to login if the user is not authenticated
    return <Navigate to="/login" />;
  }

  // If authenticated, render child routes (protected routes)
  return (
    <div>
      {/* Common layout (like header, sidebar, etc.) can be added here */}
      <Outlet /> {/* This will render the nested routes */}
    </div>
  );
};

export default ProtectedLayout;
