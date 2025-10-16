import { Button, Input } from '@/shared/components/common'

const Contact = () => (
	<section className="contact-page py-4">
		<div className="d-flex align-items-center justify-content-center pb-5 px-4">
			<div className="card shadow-sm border-0 p-4 contact-card">
				<h2 className="text-center mb-3 text-uppercase">Contáctanos</h2>
				<form>
					<Input label="Nombre completo" name="nombre" placeholder="Juan Perez Soto" />
					<Input
						label="Correo electronico"
						type="email"
						name="correo"
						placeholder="tucorreo@dominio.com"
					/>
					<div className="mb-3">
						<label className="form-label" htmlFor="contactComment">
							Comentario
						</label>
						<textarea
							className="form-control"
							id="contactComment"
							name="comentario"
							rows={4}
							placeholder="Maximo 500 caracteres"
						/>
					</div>
					<Button type="submit" block>
						Enviar
					</Button>
				</form>
			</div>
		</div>
	</section>
)

export default Contact
