import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import CustomerSignup from './pages/CustomerSignup';
import VendorLogin from './pages/VendorLogin';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import CustomerDashboard from './pages/CustomerDashboard';
import VendorDashboard from './pages/VendorDashboard';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<CustomerSignup />} />
          <Route path="/vendor-login" element={<VendorLogin />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute role="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor"
            element={
              <ProtectedRoute role="vendor">
                <VendorDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={
            <div className="max-w-3xl mx-auto px-4 py-20 text-center">
              <h1 className="text-3xl font-extrabold text-brand-800">Page not found</h1>
              <p className="text-slate-500 mt-2">The page you're looking for doesn't exist.</p>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
