import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const LoginRoute = () => {
	const navigate = useNavigate()
	const location = useLocation()

	useEffect(() => {
		const from = (location.state as { from?: string } | null)?.from ?? '/'
		const target = from === '/login' ? '/' : from
		navigate(target, { replace: true, state: { openLogin: true } })
	}, [navigate, location])

	return null
}

export default LoginRoute
