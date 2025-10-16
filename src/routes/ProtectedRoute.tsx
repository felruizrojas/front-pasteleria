import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { ReactElement, ReactNode } from 'react'

import type { UserRole } from '@/context'
import useAuth from '@/hooks/useAuth'

interface ProtectedRouteProps {
	children?: ReactNode
	redirectTo?: string
	allowedRoles?: UserRole[]
	fallback?: ReactElement | null
}

const defaultFallback = <div>Verificando acceso...</div>

const ProtectedRoute = ({
	children,
	redirectTo = '/login',
	allowedRoles,
	fallback = defaultFallback,
}: ProtectedRouteProps) => {
	const location = useLocation()
	const { isAuthenticated, loading, user } = useAuth()

	if (loading) {
		return fallback
	}

	if (!isAuthenticated) {
		return <Navigate to={redirectTo} replace state={{ from: location }} />
	}

	if (allowedRoles && user && !allowedRoles.includes(user.role)) {
		return <Navigate to="/" replace />
	}

	if (children) {
		return <>{children}</>
	}

	return <Outlet />
}

export default ProtectedRoute

