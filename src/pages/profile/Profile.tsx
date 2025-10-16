import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useLocation } from 'react-router-dom'

import { Button, Input } from '../../components/common'
import { logoImage as defaultAvatar } from '../../assets'
import { REGIONES_COMUNAS } from '../../data/region_comuna'

const Profile = () => {
	const [selectedRegionId, setSelectedRegionId] = useState('')
	const [selectedComuna, setSelectedComuna] = useState('')
	const [avatarUrl, setAvatarUrl] = useState<string>(defaultAvatar)
	const location = useLocation()
	const currentPath = `${location.pathname}${location.search}`

	const placeholderProfile = {
		run: '12.345.678-9',
		email: 'usuario@correo.com',
	}

	const regionOptions = REGIONES_COMUNAS.map(({ id, nombre }) => (
		<option key={id} value={id}>
			{nombre}
		</option>
	))

	const comunaOptions = REGIONES_COMUNAS.find((region) => region.id === selectedRegionId)?.comunas ?? []

	const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.currentTarget.files?.[0]
		if (!file) {
			return
		}

		const reader = new FileReader()
		reader.addEventListener('load', () => {
			if (typeof reader.result === 'string') {
				setAvatarUrl(reader.result)
			}
		})
		reader.readAsDataURL(file)
	}

	const handleAvatarReset = () => {
		setAvatarUrl(defaultAvatar)
	}

	const handleRegionChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const nextRegion = event.currentTarget.value
		setSelectedRegionId(nextRegion)
		setSelectedComuna('')
	}

	const handleComunaChange = (event: ChangeEvent<HTMLSelectElement>) => {
		setSelectedComuna(event.currentTarget.value)
	}

	const handleSave = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
	}

	return (
		<main className="py-5 bg-light-subtle">
			<div className="container">
				<div className="row g-4 g-lg-5">
					<div className="col-12 col-lg-4">
						<div className="card border-0 shadow-sm">
							<div className="card-body p-4">
								<div className="text-center mb-4">
									<img
										src={avatarUrl}
										alt="Avatar del usuario"
										className="rounded-circle mb-3"
										width={140}
										height={140}
										style={{ objectFit: 'cover' }}
									/>

									<div className="d-grid gap-2">
										<label className="btn btn-outline-secondary mb-0">
											<i className="bi bi-image me-1" aria-hidden="true" /> Cambiar foto
											<input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
										</label>
										<Button type="button" className="btn-outline-danger" onClick={handleAvatarReset}>
											<i className="bi bi-trash me-1" aria-hidden="true" /> Quitar foto
										</Button>
									</div>

									<hr />

									<div className="text-start small">
										<div className="d-flex justify-content-between">
											<span className="text-muted">Correo</span>
											<span className="fw-semibold">{placeholderProfile.email}</span>
										</div>
									</div>

									<div className="d-grid gap-2 mt-3">
										<Button as="link" to="/cart" className="btn-outline-primary">
											<i className="bi bi-receipt me-1" aria-hidden="true" /> Mis pedidos
										</Button>
										<Button as="link" to="/login" className="btn-outline-dark" state={{ from: currentPath }}>
											<i className="bi bi-box-arrow-right me-1" aria-hidden="true" /> Cerrar sesión
										</Button>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="col-12 col-lg-8">
						<div className="card border-0 shadow-sm mb-4">
							<div className="card-body p-4 p-lg-5">
								<h1 className="h4 fw-bold mb-4">Datos personales</h1>
								<form className="row g-3" onSubmit={handleSave}>
									<div className="col-12 col-md-6">
										<Input
											label="RUN"
											name="run"
											placeholder={placeholderProfile.run}
										/>
									</div>
									<div className="col-12 col-md-6">
										<label className="form-label" htmlFor="birthdate">
											Fecha de nacimiento
										</label>
										<input
											type="date"
											id="birthdate"
											className="form-control"
										/>
									</div>
									<div className="col-12 col-md-6">
										<Input
											label="Nombres"
											name="firstNames"
											placeholder="María Luisa"
										/>
									</div>
									<div className="col-12 col-md-6">
										<Input
											label="Apellidos"
											name="lastNames"
											placeholder="Pérez González"
										/>
									</div>
									<div className="col-12">
										<Input label="Correo" type="email" name="email" placeholder={placeholderProfile.email} />
									</div>
									<div className="col-12 col-md-6">
										<label className="form-label" htmlFor="region">
											Region
										</label>
										<select
											id="region"
											className="form-select"
											value={selectedRegionId}
											onChange={handleRegionChange}
										>
											<option value="">Selecciona...</option>
											{regionOptions}
										</select>
									</div>
									<div className="col-12 col-md-6">
										<label className="form-label" htmlFor="comuna">
											Comuna
										</label>
										<select
											id="comuna"
											className="form-select"
											value={selectedComuna}
											onChange={handleComunaChange}
											disabled={!selectedRegionId}
										>
											<option value="">Selecciona...</option>
											{comunaOptions.map((comuna) => (
												<option key={comuna} value={comuna}>
													{comuna}
												</option>
											))}
										</select>
									</div>
									<div className="col-12">
										<label className="form-label" htmlFor="address">
											Direccion
										</label>
										<input
											type="text"
											id="address"
											className="form-control"
											placeholder="Calle 123"
										/>
									</div>
									<div className="d-flex flex-wrap gap-2 mt-4">
										<Button type="submit" className="btn-app--brand">
											<i className="bi bi-save2 me-1" aria-hidden="true" /> Guardar cambios
										</Button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}

export default Profile
