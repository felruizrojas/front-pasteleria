import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { Button, Input } from '@/components/common'

const ResetPasswordPage = () => {
	const [showNewPassword, setShowNewPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const location = useLocation()
	const currentPath = `${location.pathname}${location.search}`
	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
	}

	return (
		<main className="container py-5">
			<div className="row justify-content-center">
				<div className="col-12 col-md-10 col-lg-6">
					<div className="card shadow-soft p-4">
						<header className="text-center mb-4">
							<h1 className="h4 mb-2">Restablecer contrasena</h1>
							<p className="text-muted-soft mb-0">Ingresa tu correo y define tu nueva contrasena.</p>
						</header>

						<form onSubmit={handleSubmit}>
							<Input
								type="email"
								name="email"
								id="resetEmail"
								label="Correo electronico"
								placeholder="tucorreo@dominio.com"
							/>

							<div className="mb-3">
								<label className="form-label fw-semibold" htmlFor="newPassword">
									Nueva contrasena
								</label>
								<div className="input-group">
									<input
										type={showNewPassword ? 'text' : 'password'}
										className="form-control"
										id="newPassword"
										name="newPassword"
									/>
									<button
										type="button"
										className="btn btn-outline-dark"
										onClick={() => setShowNewPassword((value) => !value)}
										aria-label={showNewPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
									>
										<i className={showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'} aria-hidden="true" />
									</button>
								</div>
							</div>

							<div className="mb-4">
								<label className="form-label fw-semibold" htmlFor="confirmPassword">
									Confirmar contrasena
								</label>
								<div className="input-group">
									<input
										type={showConfirmPassword ? 'text' : 'password'}
										className="form-control"
										id="confirmPassword"
										name="confirmPassword"
									/>
									<button
										type="button"
										className="btn btn-outline-dark"
										onClick={() => setShowConfirmPassword((value) => !value)}
										aria-label={showConfirmPassword ? 'Ocultar confirmacion' : 'Mostrar confirmacion'}
									>
										<i className={showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'} aria-hidden="true" />
									</button>
								</div>
							</div>

							<Button type="submit" block variant="dark">
								Restablecer contrasena
							</Button>

							<p className="text-center mt-4 mb-0">
								<small className="text-muted-soft">
									Recuerdas tu contrasena?{' '}
									<Link to="/login" className="link-choco" state={{ from: currentPath }}>
										Volver al inicio de sesion
									</Link>
								</small>
							</p>
						</form>
					</div>
				</div>
			</div>
		</main>
	)
}

export default ResetPasswordPage
