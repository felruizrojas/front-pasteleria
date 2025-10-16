import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { Button, Input } from '@/shared/components/common'
import { logoImage } from '@/assets'
import { REGIONES_COMUNAS } from '@/shared/data/region_comuna'

const RegisterUser = () => {
	const location = useLocation()
	const currentPath = location.pathname
	const [regionId, setRegionId] = useState('')
	const [comuna, setComuna] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)

	useEffect(() => {
		document.querySelectorAll('.offcanvas.show').forEach((element) => {
			if (!(element instanceof HTMLElement)) {
				return
			}

			element.classList.remove('show')
			element.style.removeProperty('visibility')
			element.setAttribute('aria-hidden', 'true')
		})

		document.querySelectorAll('.offcanvas-backdrop').forEach((backdrop) => backdrop.remove())

		document.body.style.removeProperty('overflow')
		document.body.removeAttribute('data-bs-overflow')
		document.body.removeAttribute('data-bs-padding-right')
	}, [])

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
	}

	const handleRegionChange = (event: ChangeEvent<HTMLSelectElement>) => {
		setRegionId(event.currentTarget.value)
		setComuna('')
	}

	const handleComunaChange = (event: ChangeEvent<HTMLSelectElement>) => {
		setComuna(event.currentTarget.value)
	}

	const comunaOptions = REGIONES_COMUNAS.find((region) => region.id === regionId)?.comunas ?? []

	return (
		<main className="mt-0">
			<section className="position-relative overflow-hidden">
				<div className="container py-5">
					<div className="row justify-content-center">
						<div className="col-12 col-lg-10">
							<div className="d-flex flex-column flex-lg-row align-items-center gap-4 text-center text-lg-start">
								<img src={logoImage} alt="Pastelería Mil Sabores" width={140} className="rounded-pill shadow" />
								<div>
									<span className="badge text-uppercase fw-semibold mb-2">Tu pastelería favorita</span>
									<h1 className="mb-2 brand-name">Pastelería Mil Sabores</h1>
									<h2 className="h4 mb-2">Crea tu cuenta</h2>
									<p className="lead mb-0">
										Accede a beneficios dulces, seguimiento de pedidos y novedades exclusivas.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="py-5">
				<div className="container">
					<div className="row justify-content-center">
						<div className="col-12 col-lg-8 col-xl-6">
							<div className="bg-body border rounded-3 shadow-sm p-4 p-lg-5">
								<header className="d-flex align-items-start justify-content-between mb-4">
									<div>
										<span className="badge text-uppercase fw-semibold mb-2">Nuevo registro</span>
										<h2 className="h4 mb-0">
											<i className="bi bi-person-plus me-2" aria-hidden="true" />Crear cuenta
										</h2>
									</div>
									<Button as="link" to="/" size="sm" variant="mint" aria-label="Volver al inicio">
										<i className="bi bi-x-lg" aria-hidden="true" />
									</Button>
								</header>
								<p className="mb-4">
									Completa tus datos para disfrutar de promociones personalizadas y un proceso de compra más ágil.
								</p>

								<form onSubmit={handleSubmit} noValidate>
									<Input name="firstName" label="Primer nombre" placeholder="Ej: María" />
									<Input name="secondName" label="Segundo nombre (opcional)" placeholder="Ej: Luisa" />
									<Input name="paternalLastName" label="Apellido paterno" placeholder="Ej: Pérez" />
									<Input name="maternalLastName" label="Apellido materno (opcional)" placeholder="Ej: González" />
									<Input name="run" label="RUN" placeholder="19011022K" inputMode="text" />
									<Input
										name="birthdate"
										label="Fecha de nacimiento (opcional)"
										placeholder="dd/mm/aaaa"
										inputMode="numeric"
										helperText="Formato: dd/mm/aaaa"
									/>
									<Input name="phone" label="Teléfono (opcional)" placeholder="+56 9 1234 5678" inputMode="tel" />
									<Input name="email" label="Correo electrónico" placeholder="usuario@dominio.com" type="email" />
									<Input name="address" label="Dirección" placeholder="Calle 123" />

									<div className="row g-3">
										<div className="col-12 col-lg-6">
											<label className="form-label fw-semibold" htmlFor="region">
												Región
											</label>
											<select
												id="region"
												name="region"
												className="form-select"
												value={regionId}
												onChange={handleRegionChange}
											>
												<option value="">Sin selección</option>
												{REGIONES_COMUNAS.map((region) => (
													<option key={region.id} value={region.id}>
														{region.nombre}
													</option>
												))}
											</select>
										</div>
										<div className="col-12 col-lg-6">
											<label className="form-label fw-semibold" htmlFor="comuna">
												Comuna
											</label>
											<select
												id="comuna"
												name="comuna"
												className="form-select"
												disabled={!regionId}
												value={comuna}
												onChange={handleComunaChange}
											>
												<option value="">Sin selección</option>
												{comunaOptions.map((option) => (
													<option key={option} value={option}>
														{option}
													</option>
												))}
											</select>
										</div>
									</div>

									<div className="mb-3">
										<label className="form-label fw-semibold" htmlFor="password">
											Contraseña
										</label>
										<div className="input-group">
											<input
												type={showPassword ? 'text' : 'password'}
												className="form-control"
												id="password"
												name="password"
												aria-describedby="passwordHelp"
											/>
											<button
												type="button"
												className="btn btn-pastel btn-mint"
												onClick={() => setShowPassword((value) => !value)}
												aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
											>
												<i className={showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'} aria-hidden="true" />
											</button>
										</div>
										<div id="passwordHelp" className="form-text">
											Puedes crear una contraseña segura con letras y números.
										</div>
									</div>

									<div className="mb-3">
										<label className="form-label fw-semibold" htmlFor="confirmPassword">
											Confirmar contraseña
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
												className="btn btn-pastel btn-mint"
												onClick={() => setShowConfirmPassword((value) => !value)}
												aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
											>
												<i className={showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'} aria-hidden="true" />
											</button>
										</div>
									</div>

									<Input
										name="welcomeCode"
										label="Código de bienvenida (opcional)"
										placeholder="Ej: MILSABORES2025"
										helperText="Si tienes un código, ingrésalo aquí. Puedes dejarlo en blanco."
									/>

									<div className="form-check mb-4">
										<input type="checkbox" className="form-check-input" id="terms" name="terms" />
										<label className="form-check-label" htmlFor="terms">
											<a className="link-body-emphasis" href="/terminos">
												Acepto los términos y condiciones
											</a>
										</label>
									</div>

									<div className="d-grid">
										<Button type="submit" variant="strawberry" size="lg">
											Crear cuenta
										</Button>
									</div>

									<hr className="my-4" />

									<p className="mb-0 text-center">
										¿Ya tienes cuenta?{' '}
										<Link to="/login" className="link-body-emphasis" state={{ from: currentPath }}>
											Inicia sesión
										</Link>
									</p>
								</form>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}

export default RegisterUser
