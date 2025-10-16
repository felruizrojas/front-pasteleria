import { Link } from 'react-router-dom'

import { Button, Input } from '@/shared/components/common'
import { logoImage } from '@/assets'

const Login = () => (
	<main className="mt-0">
		<section className="login-page bg-light py-5 py-lg-0">
			<div className="container-fluid">
				<div className="row g-0 min-vh-75">
					<div className="col-12 col-lg-7 d-none d-lg-flex align-items-center justify-content-center">
						<div className="text-center px-4">
							<img src={logoImage} alt="Pastelería Mil Sabores" width={140} className="rounded-pill mb-3" />
							<h1 className="mb-1 brand-name">Pastelería Mil Sabores</h1>
							<p className="mb-0">Celebra la dulzura de la vida</p>
						</div>
					</div>

					<div className="col-12 col-lg-5">
						<div className="login-panel h-100 border-top border-lg-start border-light-subtle">
							<div className="p-4 p-lg-5">
								<div className="d-flex align-items-center justify-content-between mb-4">
									<h5 className="mb-0">
										<i className="bi bi-person me-2" aria-hidden /> Iniciar sesion
									</h5>
									<Button as="link" to="/" size="sm" variant="mint">
										<i className="bi bi-x-lg" aria-hidden />
										<span className="visually-hidden">Cerrar</span>
									</Button>
								</div>

								<form className="auth-form mx-auto">
									<Input
										label="Correo electronico"
										type="email"
										id="pageLoginEmail"
										name="email"
										placeholder="tucorreo@dominio.com"
										containerClassName="mb-3"
									/>

									<Input
										label="Contrasena"
										type="password"
										id="pageLoginPassword"
										name="password"
										placeholder="••••"
										containerClassName="mb-3"
									/>

									<div className="d-flex justify-content-between align-items-center mb-3">
										<div className="form-check">
											<input className="form-check-input" type="checkbox" id="pageRememberMe" />
											<label className="form-check-label" htmlFor="pageRememberMe">
												Recordarme
											</label>
										</div>
										<Link to="/reset-password" className="link-body-emphasis">
											Olvidaste tu contrasena?
										</Link>
									</div>

									<Button type="submit" block className="mb-2" variant="strawberry">
										Ingresar
									</Button>

									<hr className="my-4" />

									<p className="mb-0 text-center">
										No tienes cuenta?
										<Link to="/register" className="ms-1 link-body-emphasis">
											Crear cuenta
										</Link>
									</p>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	</main>
)

export default Login
