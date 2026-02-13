import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import RoomPage from '@/pages/RoomPage';
import AdminPage from '@/pages/AdminPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFoundPage from '@/pages/NotFoundPage';

// Components
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              
              {/* Room Route - Can be accessed by guests too */}
              <Route path="/room/:roomCode" element={<RoomPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin/*" element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              } />
              
              {/* 404 */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Router>
          <Toaster 
            position="top-right" 
            richColors 
            closeButton
            toastOptions={{
              style: {
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                color: '#fff',
              },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
