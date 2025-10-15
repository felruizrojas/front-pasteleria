import { Alert, Button, Input, Modal } from '../../components/common'

const membershipModalId = 'membershipBenefitsModal'

const Profile = () => (
	<main className="py-5 bg-light-subtle">
		<div className="container">
			<div className="row g-4 g-lg-5">
				<div className="col-12 col-lg-4">
					<div className="card border-0 shadow-sm">
						<div className="card-body p-4">
							<div className="text-center mb-4">
								<div className="d-flex align-items-center justify-content-center bg-primary-subtle text-primary fw-semibold rounded-circle mx-auto mb-3"
									style={{ width: 96, height: 96 }}
								>
									PM
								</div>
								<h2 className="h5 fw-semibold mb-1">Pamela Medina</h2>
								<p className="text-muted mb-0">Miembro desde 2021</p>
							</div>

							<Alert variant="warning" title="Beneficios activos">
								<ul className="mb-0 ps-3">
									<li>5% de descuento permanente en tortas clásicas</li>
									<li>Despacho sin costo en compras superiores a $40.000</li>
								</ul>
							</Alert>

							<div className="d-grid gap-2">
								<Button
									type="button"
									data-bs-toggle="modal"
									data-bs-target={`#${membershipModalId}`}
								>
									Ver detalles de membresía
								</Button>
								<Button as="a" href="/menu">
									Pedir mi torta favorita
								</Button>
							</div>
						</div>
					</div>
				</div>

				<div className="col-12 col-lg-8">
					<div className="card border-0 shadow-sm mb-4">
						<div className="card-body p-4 p-lg-5">
							<h2 className="h5 fw-bold mb-4">Datos personales</h2>
							<form className="row g-3">
								<div className="col-12 col-md-6">
									<Input label="Nombre" name="firstName" defaultValue="Pamela" readOnly />
								</div>
								<div className="col-12 col-md-6">
									<Input label="Apellido" name="lastName" defaultValue="Medina" readOnly />
								</div>
								<div className="col-12 col-md-6">
									<Input label="Correo" type="email" name="email" defaultValue="pamela.medina@email.cl" readOnly />
								</div>
								<div className="col-12 col-md-6">
									<Input label="Telefono" name="phone" defaultValue="+56 9 8765 4321" readOnly />
								</div>
								<div className="col-12">
									<Input
										label="Direccion principal"
										name="address"
										defaultValue="Av. Dulce 1234, Depto 501, Santiago"
										readOnly
									/>
								</div>
							</form>
						</div>
					</div>

					<div className="card border-0 shadow-sm">
						<div className="card-body p-4 p-lg-5">
							<h2 className="h5 fw-bold mb-4">Preferencias de pedido</h2>
							<p className="text-muted">Puedes actualizar estas preferencias cuando habilitemos la edición desde tu cuenta.</p>
							<div className="row g-3">
								<div className="col-12 col-md-6">
									<Alert variant="light" title="Sabores favoritos">
										<ul className="mb-0 ps-3">
											<li>Chocolate amargo</li>
											<li>Maracuyá</li>
										</ul>
									</Alert>
								</div>
								<div className="col-12 col-md-6">
									<Alert variant="light" title="Decoraciones preferidas">
										<ul className="mb-0 ps-3">
											<li>Flores naturales</li>
											<li>Mensajes personalizados en chocolate</li>
										</ul>
									</Alert>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<Modal id={membershipModalId} title="Beneficios de mi membresía" size="lg" centered>
			<p className="mb-3">
				Tu membresía <strong>Dulce Premium</strong> está activa y acumula puntos por cada compra. Estos beneficios se
				actualizan mensualmente.
			</p>
			<ul className="mb-0 ps-3">
				<li>Un pastel mediano de cortesía en tu cumpleaños.</li>
				<li>Acceso anticipado a colecciones temáticas y clases online.</li>
				<li>Prioridad en agenda de eventos para celebraciones familiares.</li>
			</ul>
		</Modal>
	</main>
)

export default Profile
