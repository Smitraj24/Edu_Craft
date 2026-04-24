import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthContext } from './context/AuthContext';
import MainLayout from './components/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import Courses from './pages/Courses';
import Certificate from './pages/Certificate';
import Profile from './pages/Profile';
import MyCourses from './pages/MyCourses';
import Quiz from './pages/Quiz';
import ForgotPassword from './pages/ForgotPassword';
import Wishlist from './pages/Wishlist';
import Leaderboard from './pages/Leaderboard';

import InstructorDashboard from './pages/InstructorDashboard';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import AddLesson from './pages/AddLesson';
import QuizBuilder from './pages/QuizBuilder';
import MyStudents from './pages/MyStudents';
import AddAssignment from './pages/AddAssignment';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';

import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import CourseApproval from './pages/CourseApproval';
import CategoryManagement from './pages/CategoryManagement';
import Reports from './pages/Reports';

// Protected Route Wrapper
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useContext(AuthContext);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={`/${user.role === 'admin' ? 'admin/' : user.role === 'instructor' ? 'instructor/' : ''}dashboard`} replace />;
  }

  return children;
};

// Root Layout Component
const RootLayout = () => {
    return (
        <MainLayout>
            <Outlet />
        </MainLayout>
    );
};

// Router Configuration
const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        errorElement: <ErrorBoundary />,
        children: [
            // Public Routes
            { index: true, element: <Home /> },
            { path: 'courses', element: <Courses /> },
            { path: 'login', element: <Login /> },
            { path: 'forgot-password', element: <ForgotPassword /> },
            { path: 'auth/google/success', element: <GoogleAuthSuccess /> },
            { path: 'course/:id', element: <CourseDetail /> },

            // Student / Shared (Protected)
            { path: 'dashboard', element: <ProtectedRoute roles={['student', 'admin', 'instructor']}><Dashboard /></ProtectedRoute> },
            { path: 'profile', element: <ProtectedRoute roles={['student', 'admin', 'instructor']}><Profile /></ProtectedRoute> },
            { path: 'my-courses', element: <ProtectedRoute roles={['student']}><MyCourses /></ProtectedRoute> },
            { path: 'wishlist', element: <ProtectedRoute roles={['student', 'admin', 'instructor']}><Wishlist /></ProtectedRoute> },
            { path: 'leaderboard', element: <ProtectedRoute roles={['student', 'admin', 'instructor']}><Leaderboard /></ProtectedRoute> },
            { path: 'quiz/:courseId', element: <ProtectedRoute roles={['student']}><Quiz /></ProtectedRoute> },
            { path: 'certificate/:id', element: <ProtectedRoute roles={['student']}><Certificate /></ProtectedRoute> },

            // Instructor Routes
            { path: 'instructor/dashboard', element: <ProtectedRoute roles={['instructor']}><InstructorDashboard /></ProtectedRoute> },
            { path: 'instructor/course/create', element: <ProtectedRoute roles={['instructor']}><CreateCourse /></ProtectedRoute> },
            { path: 'instructor/course/edit/:id', element: <ProtectedRoute roles={['instructor']}><EditCourse /></ProtectedRoute> },
            { path: 'instructor/courses/:id/lessons', element: <ProtectedRoute roles={['instructor']}><AddLesson /></ProtectedRoute> },
            { path: 'instructor/courses/:id/quizzes', element: <ProtectedRoute roles={['instructor']}><QuizBuilder /></ProtectedRoute> },
            { path: 'instructor/courses/:id/assignments', element: <ProtectedRoute roles={['instructor']}><AddAssignment /></ProtectedRoute> },
            { path: 'instructor/students', element: <ProtectedRoute roles={['instructor']}><MyStudents /></ProtectedRoute> },

            { path: 'admin/dashboard', element: <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute> },
            { path: 'admin/users', element: <ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute> },
            { path: 'admin/courses', element: <ProtectedRoute roles={['admin']}><CourseApproval /></ProtectedRoute> },
            { path: 'admin/categories', element: <ProtectedRoute roles={['admin']}><CategoryManagement /></ProtectedRoute> },
            { path: 'admin/reports', element: <ProtectedRoute roles={['admin']}><Reports /></ProtectedRoute> },
        ]
    }
]);

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </>
  );
}

export default App;

