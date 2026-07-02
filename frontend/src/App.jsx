import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';

// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Layout
import AppLayout from '@/components/layout/AppLayout';

// Pages
import Dashboard from '@/pages/Dashboard';
import TeamMembers from '@/pages/TeamMembers';
import Buckets from '@/pages/Buckets';
import BucketDetail from '@/pages/BucketDetail';
import Tasks from '@/pages/Tasks';
import TaskDetail from '@/pages/TaskDetail';
import Timesheets from '@/pages/Timesheets';
import CalendarPage from '@/pages/CalendarPage';
import AttendancePage from '@/pages/AttendancePage';
import ExternalAlerts from '@/pages/ExternalAlerts';
import Reports from '@/pages/Reports';
import ItemList from '@/pages/ItemList';
import NoticeBoard from '@/pages/NoticeBoard';
import Meetings from '@/pages/Meetings';
import SettingsPage from '@/pages/SettingsPage';
import Notifications from '@/pages/Notifications';
import Profile from '@/pages/Profile';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, authChecked, isAuthenticated } = useAuth();

  // Show spinner while auth is loading or not yet checked
  if (!authChecked || isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Use React Router Navigate instead of hard redirect to avoid flicker
      return <Navigate to="/login" replace />;
    }
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/team" element={<TeamMembers />} />
          <Route path="/buckets" element={<Buckets />} />
          <Route path="/buckets/:id" element={<BucketDetail />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/timesheets" element={<Timesheets />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/alerts" element={<ExternalAlerts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/items" element={<ItemList />} />
          <Route path="/notices" element={<NoticeBoard />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App