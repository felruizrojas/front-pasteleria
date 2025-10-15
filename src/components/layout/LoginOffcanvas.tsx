import { Link } from 'react-router-dom'

import { Button, Input } from '../common'
const LoginOffcanvas = () => (
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
			<form>
				<Input
					label="Correo electronico"
					type="email"
					id="loginEmail"
					name="email"
					placeholder="tucorreo@dominio.com"
					containerClassName="mb-3"
				/>

				<Input
					label="Contrasena"
					type="password"
					id="loginPassword"
					name="password"
					placeholder="••••"
					containerClassName="mb-3"
				/>

				<div className="d-flex justify-content-between align-items-center mb-3">
					<div className="form-check">
						<input className="form-check-input" type="checkbox" id="rememberMe" />
						<label className="form-check-label" htmlFor="rememberMe">
							Recordarme
						</label>
					</div>
					<Link to="/reset-password" className="link-secondary">
						Olvidaste tu contrasena?
					</Link>
				</div>

				<Button type="submit" block className="mb-2">
					Ingresar
				</Button>

				<hr className="my-4" />

				<p className="mb-0 text-center">
					No tienes cuenta?
					<Link to="/register" className="ms-1 link-secondary">
						Crear cuenta
					</Link>
				</p>
			</form>
		</div>
	</div>
)

export default LoginOffcanvas
