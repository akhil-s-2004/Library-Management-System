import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import BookPage from './pages/BookPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Layout from './layout/Layout';
import ReadingHistory from './pages/ReadingHistory';
import BorrowedBooks from './pages/BorrowedBooks';
import PaymentHistory from './pages/PaymentHistory';
import ReservedBooks from './pages/ReservedBooks';
import PopularBooks from './pages/PopularBooks';
import BrowseBooks from './pages/BrowseBooks';
import LatestAddition from './pages/LatestAddition';
import Genres from './pages/Genres';
import Help from './pages/Help';
import Profile from './pages/Profile';
import MyLibrary from './pages/MyLibrary';
import FinePolicies from './pages/FinePolicies';
import Kiosk from './pages/Kiosk';
// Admin
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminBooks from './admin/AdminBooks';
import AdminUsers from './admin/AdminUsers';
import AdminFines from './admin/AdminFines';
import AdminProfile from './admin/AdminProfile';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path='/' element={<Navigate to='/signin' />} />
        <Route path='/signin' element={<SignIn />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/kiosk' element={<Kiosk />} />

        {/* User routes — MEMBER only */}
        <Route element={<ProtectedRoute allowedRole='member' />}>
          <Route element={<Layout />}>
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/book/:id' element={<BookPage />} />
            <Route path='/my-library' element={<MyLibrary />} />
            <Route path='/history' element={<ReadingHistory />} />
            <Route path='/borrowed-books' element={<BorrowedBooks />} />
            <Route path='/reserved' element={<ReservedBooks />} />
            <Route path='/fines' element={<PaymentHistory />} />
            <Route path='/fine-policies' element={<FinePolicies />} />
            <Route path='/popular-books' element={<PopularBooks />} />
            <Route path='/browse' element={<BrowseBooks />} />
            <Route path='/latest' element={<LatestAddition />} />
            <Route path='/genres' element={<Genres />} />
            <Route path='/help' element={<Help />} />
            <Route path='/profile' element={<Profile />} />
          </Route>
        </Route>

        {/* Admin routes — ADMIN only */}
        <Route element={<ProtectedRoute allowedRole='admin' />}>
          <Route path='/admin' element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path='books' element={<AdminBooks />} />
            <Route path='users' element={<AdminUsers />} />
            <Route path='fines' element={<AdminFines />} />
            <Route path='profile' element={<AdminProfile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App