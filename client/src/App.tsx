import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import HowItWorks from './pages/HowItWorks';
import About from './pages/About';
import BookSession from './pages/BookSession';
import Contact from './pages/Contact';

import DashLogin from './pages/dashboard/Login';
import DashLayout from './pages/dashboard/Layout';
import DashboardHome from './pages/dashboard/DashboardHome';
import ManageProperties from './pages/dashboard/ManageProperties';
import PropertyForm from './pages/dashboard/PropertyForm';
import LeadsInbox from './pages/dashboard/LeadsInbox';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/employee/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/properties" element={<Properties />} />
      <Route path="/properties/:id" element={<PropertyDetail />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/about" element={<About />} />
      <Route path="/book-session" element={<BookSession />} />
      <Route path="/contact" element={<Contact />} />

      {/* Employee */}
      <Route path="/employee/login" element={<DashLogin />} />
      <Route path="/employee" element={<RequireAuth><DashLayout /></RequireAuth>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="properties" element={<ManageProperties />} />
        <Route path="properties/new" element={<PropertyForm />} />
        <Route path="properties/:id/edit" element={<PropertyForm />} />
        <Route path="leads" element={<LeadsInbox />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
