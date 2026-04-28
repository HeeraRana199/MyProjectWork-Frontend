import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminTalentCard from './pages/AdminTalentCard';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/talent-card/:candidateId" element={<AdminTalentCard />} />
      {/* Placeholder routes for future implementation */}
      <Route path="/trainee/dashboard" element={<div className="p-8"><h1>Trainee Dashboard - Coming Soon</h1></div>} />
      <Route path="/leader/dashboard" element={<div className="p-8"><h1>Leader Dashboard - Coming Soon</h1></div>} />
    </Routes>
  );
};

export default App;