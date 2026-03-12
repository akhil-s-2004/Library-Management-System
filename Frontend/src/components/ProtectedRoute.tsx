import { Navigate, Outlet } from 'react-router'
import { getCookie } from '../services/cookieUtils'

type ProtectedRouteProps = {
    allowedRole?: 'admin' | 'member'
}

const ProtectedRoute = ({ allowedRole }: ProtectedRouteProps) => {
    const role = getCookie('user_role')

    // Not logged in → go to sign in
    if (!role) {
        return <Navigate to='/signin' replace />
    }

    // Logged in but wrong role → redirect appropriately
    if (allowedRole && role !== allowedRole) {
        return <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} replace />
    }

    // All good → render the child routes
    return <Outlet />
}

export default ProtectedRoute
