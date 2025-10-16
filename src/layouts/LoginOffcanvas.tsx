import { useCallback, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { Button, Input } from '@/components/common'
import { hideOffcanvas } from '@/utils/offcanvas'
import useAuth from '@/hooks/useAuth'
import { validateLoginForm } from '@/utils/validations/authValidations'
import type { LoginFormValues } from '@/utils/validations/authValidations'
import type { ValidationErrors } from '@/utils/validations/types'

const LoginOffcanvas = () => {
	const { login, loading } = useAuth()
	const [values, setValues] = useState<LoginFormValues>({ email: '', password: '' })
	const [errors, setErrors] = useState<ValidationErrors<LoginFormValues>>({})
	const [formError, setFormError] = useState<string | null>(null)

	const handleNavigate = useCallback(() => {
		hideOffcanvas('offcanvasLogin')
	}, [])

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.currentTarget
		setValues((previous) => ({ ...previous, [name]: value }))
		setErrors((previous) => ({ ...previous, [name]: undefined }))
		setFormError(null)
	}

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const validation = validateLoginForm(values)
		if (!validation.isValid) {
			setErrors(validation.errors)
			return
		}

		try {
			await login(values)
			hideOffcanvas('offcanvasLogin')
			setValues({ email: '', password: '' })
			setErrors({})
			setFormError(null)
		} catch (error) {
			if (error instanceof Error) {
				setFormError(error.message)
			} else {
				setFormError('No fue posible iniciar sesión. Inténtalo nuevamente.')
			}
		}
	}

	return (
		<div
			className="offcanvas offcanvas-end login-panel"
			tabIndex={-1}
			id="offcanvasLogin"
			aria-labelledby="offcanvasLoginLabel"
			data-bs-backdrop="true"
			data-bs-scroll="false"
		>
			<div className="offcanvas-header">
				<h5 className="offcanvas-title" id="offcanvasLoginLabel">
					<i className="bi bi-person me-2" aria-hidden /> Iniciar sesion
				</h5>
				<button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Cerrar" />
			</div>

			<div className="offcanvas-body">
				<form onSubmit={handleSubmit} noValidate>
					{formError ? (
						<div className="alert alert-danger" role="alert">
							{formError}
						</div>
					) : null}
					<Input
						label="Correo electronico"
						type="email"
						id="loginEmail"
						name="email"
						placeholder="tucorreo@dominio.com"
							value={values.email}
							onChange={handleChange}
							errorText={errors.email}
						containerClassName="mb-3"
					/>

					<Input
						label="Contrasena"
						type="password"
						id="loginPassword"
						name="password"
						placeholder="••••"
							value={values.password}
							onChange={handleChange}
							autoComplete="current-password"
							errorText={errors.password}
						containerClassName="mb-3"
					/>

					<div className="d-flex justify-content-between align-items-center mb-3">
						<div className="form-check">
							<input className="form-check-input" type="checkbox" id="rememberMe" />
							<label className="form-check-label" htmlFor="rememberMe">
								Recordarme
							</label>
						</div>
						<Link to="/reset-password" className="link-body-emphasis" onClick={handleNavigate}>
							Olvidaste tu contrasena?
						</Link>
					</div>

					<Button type="submit" block className="mb-2" variant="strawberry" disabled={loading}>
						{loading ? 'Ingresando...' : 'Ingresar'}
					</Button>

					<hr className="my-4" />

					<p className="mb-0 text-center">
						No tienes cuenta?
						<Link to="/register" className="ms-1 link-body-emphasis" onClick={handleNavigate}>
							Crear cuenta
						</Link>
					</p>
				</form>
			</div>
		</div>
	)
}

export default LoginOffcanvas
