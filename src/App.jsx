import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminTalentCard from './pages/AdminTalentCard';
import TraineeDashboard from './pages/TraineeDashboard';
import LeaderDashboard from './pages/LeaderDashboard';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/talent-card/:candidateId" element={<AdminTalentCard />} />
      <Route path="/trainee/dashboard" element={<TraineeDashboard />} />
      <Route path="/leader/dashboard" element={<LeaderDashboard />} />
    </Routes>
  );
};

export default App;