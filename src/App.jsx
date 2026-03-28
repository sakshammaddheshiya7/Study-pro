import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Loading from './components/common/Loading';
import StudentLayout from './components/Layout/StudentLayout';
import AdminLayout from './components/Layout/AdminLayout';
import Login from './pages/Login';
import StudentDashboard from './pages/student/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

const TestFilters = lazy(() => import('./pages/student/TestFilters'));
const CustomTestBuilder = lazy(() => import('./pages/student/CustomTestBuilder'));
const TestEngine = lazy(() => import('./pages/student/TestEngine'));
const TestResult = lazy(() => import('./pages/student/TestResult'));
const ProfileAnalysis = lazy(() => import('./pages/student/ProfileAnalysis'));
const StudentNotifications = lazy(() => import('./pages/student/Notifications'));
const AIDoubtSolver = lazy(() => import('./pages/student/AIDoubtSolver'));
const AIStudyPlanner = lazy(() => import('./pages/student/AIStudyPlanner'));
const SmartRevision = lazy(() => import('./pages/student/SmartRevision'));
const Leaderboard = lazy(() => import('./pages/student/Leaderboard'));
const BookmarksNotes = lazy(() => import('./pages/student/BookmarksNotes'));
const PomodoroTimer = lazy(() => import('./pages/student/PomodoroTimer'));
const DailyChallenge = lazy(() => import('./pages/student/DailyChallenge'));
const FormulaSheets = lazy(() => import('./pages/student/FormulaSheets'));
const PerformancePredictor = lazy(() => import('./pages/student/PerformancePredictor'));
const AIChatAssistant = lazy(() => import('./pages/student/AIChatAssistant'));
const Community = lazy(() => import('./pages/student/Community'));
const AdminInfo = lazy(() => import('./pages/student/AdminInfo'));
const ExamCalendar = lazy(() => import('./pages/student/ExamCalendar'));
const ErrorLogBook = lazy(() => import('./pages/student/ErrorLogBook'));
const PreviousYearPapers = lazy(() => import('./pages/student/PreviousYearPapers'));
const StudyStreak = lazy(() => import('./pages/student/StudyStreak'));

const QuestionManager = lazy(() => import('./pages/admin/QuestionManager'));
const BulkUpload = lazy(() => import('./pages/admin/BulkUpload'));
const JsonPaste = lazy(() => import('./pages/admin/JsonPaste'));
const DatabaseControl = lazy(() => import('./pages/admin/DatabaseControl'));
const ApiIntegration = lazy(() => import('./pages/admin/ApiIntegration'));
const AiSystem = lazy(() => import('./pages/admin/AiSystem'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const NotificationManager = lazy(() => import('./pages/admin/NotificationManager'));
const Logs = lazy(() => import('./pages/admin/Logs'));
const AccessControl = lazy(() => import('./pages/admin/AccessControl'));
const UiCustomization = lazy(() => import('./pages/admin/UiCustomization'));
const AdvancedAIPanel = lazy(() => import('./pages/admin/AdvancedAIPanel'));
const AdminBranding = lazy(() => import('./pages/admin/AdminBranding'));

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/student" replace />;
  if (!requireAdmin && isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

function LP({ children }) {
  return <Suspense fallback={<Loading fullScreen={false} text="Loading..." />}>{children}</Suspense>;
}

export default function App() {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <Loading />;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={isAdmin ? '/admin' : '/student'} replace /> : <Login />} />

      <Route path="/student" element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="tests" element={<LP><TestFilters /></LP>} />
        <Route path="custom-test" element={<LP><CustomTestBuilder /></LP>} />
        <Route path="test/:testId" element={<LP><TestEngine /></LP>} />
        <Route path="result/:attemptId" element={<LP><TestResult /></LP>} />
        <Route path="profile" element={<LP><ProfileAnalysis /></LP>} />
        <Route path="notifications" element={<LP><StudentNotifications /></LP>} />
        <Route path="doubt-solver" element={<LP><AIDoubtSolver /></LP>} />
        <Route path="study-planner" element={<LP><AIStudyPlanner /></LP>} />
        <Route path="revision" element={<LP><SmartRevision /></LP>} />
        <Route path="leaderboard" element={<LP><Leaderboard /></LP>} />
        <Route path="bookmarks" element={<LP><BookmarksNotes /></LP>} />
        <Route path="pomodoro" element={<LP><PomodoroTimer /></LP>} />
        <Route path="daily-challenge" element={<LP><DailyChallenge /></LP>} />
        <Route path="formulas" element={<LP><FormulaSheets /></LP>} />
        <Route path="predictor" element={<LP><PerformancePredictor /></LP>} />
        <Route path="ai-chat" element={<LP><AIChatAssistant /></LP>} />
        <Route path="community" element={<LP><Community /></LP>} />
        <Route path="admin-info" element={<LP><AdminInfo /></LP>} />
        <Route path="exam-calendar" element={<LP><ExamCalendar /></LP>} />
        <Route path="error-book" element={<LP><ErrorLogBook /></LP>} />
        <Route path="pyq" element={<LP><PreviousYearPapers /></LP>} />
        <Route path="streak" element={<LP><StudyStreak /></LP>} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="questions" element={<LP><QuestionManager /></LP>} />
        <Route path="bulk-upload" element={<LP><BulkUpload /></LP>} />
        <Route path="json-paste" element={<LP><JsonPaste /></LP>} />
        <Route path="database" element={<LP><DatabaseControl /></LP>} />
        <Route path="api-keys" element={<LP><ApiIntegration /></LP>} />
        <Route path="ai-system" element={<LP><AiSystem /></LP>} />
        <Route path="analytics" element={<LP><Analytics /></LP>} />
        <Route path="notifications" element={<LP><NotificationManager /></LP>} />
        <Route path="logs" element={<LP><Logs /></LP>} />
        <Route path="access" element={<LP><AccessControl /></LP>} />
        <Route path="ui-settings" element={<LP><UiCustomization /></LP>} />
        <Route path="advanced-ai" element={<LP><AdvancedAIPanel /></LP>} />
        <Route path="branding" element={<LP><AdminBranding /></LP>} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}