import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const LoginRoute = () => {
	const navigate = useNavigate()
	const location = useLocation()

	useEffect(() => {
		const state = location.state as { from?: string } | null
		const from = state?.from ?? '/'
		const target = from === '/login' ? '/' : from

		navigate(target, { replace: true, state: { ...state, openLogin: true } })
	}, [navigate, location])

	return null
}

export default LoginRoute
