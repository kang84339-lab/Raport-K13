import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
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
import TeacherManagement from '@/pages/TeacherManagement';
import StudentManagement from '@/pages/StudentManagement';
import ClassManagement from '@/pages/ClassManagement';
import SubjectManagement from '@/pages/SubjectManagement';
import AssignmentManagement from '@/pages/AssignmentManagement';
import SchoolInfoPage from '@/pages/SchoolInfoPage';
import GradeInput from '@/pages/GradeInput';
import AttitudeInput from '@/pages/AttitudeInput';
import AttendanceInput from '@/pages/AttendanceInput';
import ExtracurricularInput from '@/pages/ExtracurricularInput';
import HomeroomNotes from '@/pages/HomeroomNotes';
import ReportRecap from '@/pages/ReportRecap';
import PrintReport from '@/pages/PrintReport';
import MyReport from '@/pages/MyReport';
import BiodataSiswa from '@/pages/BiodataSiswa';
import PrintBiodata from '@/pages/PrintBiodata';
import KompetensiDasarPage from '@/pages/KompetensiDasarPage';
import NilaiTematikPage from '@/pages/NilaiTematikPage';
import MutasiSiswaPage from '@/pages/MutasiSiswaPage';
import PrestasiSiswaPage from '@/pages/PrestasiSiswaPage';
import KalenderAkademikPage from '@/pages/KalenderAkademikPage';
import DashboardStatistik from '@/pages/DashboardStatistik';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/teachers" element={<TeacherManagement />} />
          <Route path="/students" element={<StudentManagement />} />
          <Route path="/classes" element={<ClassManagement />} />
          <Route path="/subjects" element={<SubjectManagement />} />
          <Route path="/assignments" element={<AssignmentManagement />} />
          <Route path="/school-info" element={<SchoolInfoPage />} />
          <Route path="/grade-input" element={<GradeInput />} />
          <Route path="/attitude-input" element={<AttitudeInput />} />
          <Route path="/attendance-input" element={<AttendanceInput />} />
          <Route path="/extracurricular-input" element={<ExtracurricularInput />} />
          <Route path="/homeroom-notes" element={<HomeroomNotes />} />
          <Route path="/report-recap" element={<ReportRecap />} />
          <Route path="/my-report" element={<MyReport />} />
          <Route path="/biodata-siswa" element={<BiodataSiswa />} />
          <Route path="/kompetensi-dasar" element={<KompetensiDasarPage />} />
          <Route path="/nilai-tematik" element={<NilaiTematikPage />} />
          <Route path="/mutasi-siswa" element={<MutasiSiswaPage />} />
          <Route path="/prestasi-siswa" element={<PrestasiSiswaPage />} />
          <Route path="/kalender-akademik" element={<KalenderAkademikPage />} />
          <Route path="/statistik" element={<DashboardStatistik />} />
        </Route>
        <Route path="/print-report" element={<PrintReport />} />
        <Route path="/print-biodata" element={<PrintBiodata />} />
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