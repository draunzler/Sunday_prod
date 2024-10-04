import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import ChatDashboard from './components/ChatDashboard';
import ChatRoom from './components/ChatRoom';
import SignupForm from './components/SignupForm';
import ProtectedLayout from './ProtectedLayout';

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<ChatDashboard />} />
          <Route path="/chat/:id" element={<ChatRoom />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;