import { Button } from '../../components/common'
import { catalogoDatos } from '../../data/carta_datos'

const formatImagePath = (relativePath: string) => {
	const normalized = relativePath.replace('catalogo', 'catalog')
	return new URL(`../../assets/${normalized}`, import.meta.url).href
}

const formatPrice = (value: number) =>
	value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

const Menu = () => (
	<section className="py-4 py-lg-5">
		<div className="container">
			<header className="text-center mb-5">
				<h1 className="section-title mb-2">Nuestra carta</h1>
				<p className="text-muted-soft mb-0">
					Descubre nuestras categorías de productos y elige tus favoritos para tu próxima celebración.
				</p>
			</header>

			{catalogoDatos.categorias.map((categoria) => (
				<article className="mb-5" key={categoria.id_categoria}>
					<div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
						<h2 className="h4 mb-0 text-uppercase text-muted-soft">{categoria.nombre_categoria}</h2>
						<small className="text-secondary">
							{categoria.productos.length} {categoria.productos.length === 1 ? 'producto' : 'productos'}
						</small>
					</div>
					<div className="row g-4">
						{categoria.productos.map((producto) => (
							<div className="col-12 col-md-6 col-lg-4" key={producto.codigo_producto}>
								<div className="card card-soft h-100 shadow-soft">
									<img
										src={formatImagePath(producto.imagen_producto)}
										alt={producto.nombre_producto}
										className="card-img-top"
										loading="lazy"
									/>
									<div className="card-body d-flex flex-column gap-3">
										<div>
											<h3 className="h5 mb-1">{producto.nombre_producto}</h3>
											<p className="text-muted mb-2">{producto.descripción_producto}</p>
											<p className="fw-semibold brand-accent mb-0">{formatPrice(producto.precio_producto)}</p>
										</div>
										<div className="d-flex align-items-center justify-content-between">
											<small className="text-muted">
												Stock: {producto.stock} · Critico: {producto.stock_critico}
											</small>
											<Button size="sm">Agregar al carrito</Button>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</article>
			))}
		</div>
	</section>
)

export default Menu
