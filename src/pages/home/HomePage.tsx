import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/common'
import { catalogoDatos } from '@/data/menu_datos'

interface CarouselItem {
	id: string
	image: string
	alt: string
	caption?: {
		type?: 'internal' | 'external'
		ctaLabel: string
		to: string
	}
	overlay?: {
		title: string
		subtitle: string
		highlight: string
	}
}

const carouselData: CarouselItem[] = [
	{
		id: 'menu',
		image: new URL('@/assets/images/carrusel/carrusel_carta.jpg', import.meta.url).href,
		alt: 'Torta con frutas',
		caption: { type: 'internal', ctaLabel: 'Ver carta', to: '/menu' },
	},
	{
		id: 'about',
		image: new URL('@/assets/images/carrusel/carrusel_nosotros.jpg', import.meta.url).href,
		alt: 'Vitrina de pastelería',
		caption: { type: 'internal', ctaLabel: 'Conócenos', to: '/about' },
	},
	{
		id: 'blog',
		image: new URL('@/assets/images/carrusel/carrusel_blog.jpg', import.meta.url).href,
		alt: 'Persona usando laptop',
		caption: { type: 'internal', ctaLabel: 'Visita nuestro blog', to: '/blog' },
	},
	{
		id: 'social',
		image: new URL('@/assets/images/carrusel/diversidad_pasteles.jpg', import.meta.url).href,
		alt: 'Vitrina con variedad de pasteles',
		overlay: {
			title: 'TRIVIA MIL SABORES',
			subtitle: 'Síguenos en Instagram y participa en nuestra trivia semanal',
			highlight: 'Gana un descuento permanente en tus compras',
		},
		caption: {
			type: 'external',
			ctaLabel: 'Ir a Instagram',
			to: 'https://www.instagram.com/pasteleria1000sabores',
		},
	},
]

const carouselId = 'homeCarousel'

const catalogImages = import.meta.glob('@/assets/images/catalog/**/*', {
	import: 'default',
	eager: true,
}) as Record<string, string>

const catalogImageMap = Object.entries(catalogImages).reduce<Record<string, string>>((accumulator, [path, src]) => {
	const key = path.split('/').pop()
	if (key) {
		accumulator[key] = src
	}
	return accumulator
}, {})

const formatImagePath = (relativePath: string) => {
	const fileName = relativePath.split('/').pop()
	if (fileName && catalogImageMap[fileName]) {
		return catalogImageMap[fileName]
	}

	const normalized = relativePath.replace(/^img\//, 'images/').replace('catalogo', 'catalog')
	return new URL(`@/assets/${normalized}`, import.meta.url).href
}

const fallbackCategoryImage = new URL('@/assets/images/generica.png', import.meta.url).href

const HomePage = () => {
	const featuredCategories = useMemo(
		() =>
			catalogoDatos.categorias.map((categoria) => {
				const imagePath = categoria.productos[0]?.imagen_producto
				return {
					id: categoria.id_categoria,
					name: categoria.nombre_categoria,
					productCount: categoria.productos.length,
					image: imagePath ? formatImagePath(imagePath) : fallbackCategoryImage,
				}
			}),
		[],
	)

	return (
		<>
			<section aria-label="Carrusel principal" className="hero-carousel">
				<div
					id={carouselId}
					className="carousel slide"
					data-bs-ride="carousel"
					data-bs-pause="hover"
					aria-live="polite"
				>
					<div className="carousel-indicators">
						{carouselData.map((item, index) => (
							<button
								key={item.id}
								type="button"
								data-bs-target={`#${carouselId}`}
								data-bs-slide-to={index}
								className={index === 0 ? 'active' : ''}
								aria-current={index === 0 ? 'true' : undefined}
								aria-label={`Slide ${index + 1}`}
							/>
						))}
					</div>

					<div className="carousel-inner">
						{carouselData.map((item, index) => (
							<div
								key={item.id}
								className={`carousel-item ${index === 0 ? 'active' : ''}`}
								role="group"
								aria-roledescription="slide"
								aria-label={`${index + 1} de ${carouselData.length}`}
							>
								<img src={item.image} alt={item.alt} className="d-block w-100" />

								{item.overlay ? (
									<div className="position-absolute top-50 start-50 translate-middle text-center w-100 px-3">
										<div className="promo-overlay mx-auto">
											<p className="promo-title mb-2">{item.overlay.title}</p>
											<p className="promo-subtitle mb-2">{item.overlay.subtitle}</p>
											<p className="promo-highlight mb-0">{item.overlay.highlight}</p>
										</div>
									</div>
								) : null}

								{item.caption ? (
									<div className="carousel-caption">
										{item.caption.type === 'external' ? (
											<Button
												as="a"
												href={item.caption.to}
												size="lg"
												variant="strawberry"
												target="_blank"
												rel="noreferrer"
											>
												{item.caption.ctaLabel}
											</Button>
										) : (
											<Button as="link" to={item.caption.to} size="lg" variant="strawberry">
												{item.caption.ctaLabel}
											</Button>
										)}
									</div>
								) : null}
							</div>
						))}
					</div>

					<button className="carousel-control-prev" type="button" data-bs-target={`#${carouselId}`} data-bs-slide="prev">
						<span className="carousel-control-prev-icon" aria-hidden="true" />
						<span className="visually-hidden">Anterior</span>
					</button>
					<button className="carousel-control-next" type="button" data-bs-target={`#${carouselId}`} data-bs-slide="next">
						<span className="carousel-control-next-icon" aria-hidden="true" />
						<span className="visually-hidden">Siguiente</span>
					</button>
				</div>
			</section>

			<section className="py-5">
				<div className="container">
					<h2 className="mb-4 text-center section-title">Nuestra carta</h2>
					{featuredCategories.length === 0 ? (
						<p className="text-center mb-0">Pronto compartiremos nuestra selección de productos.</p>
					) : (
						<>
							<div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
								{featuredCategories.map((categoria) => (
									<div className="col" key={categoria.id}>
										<div className="card card-soft shadow-soft h-100 product-card">
											<Link to="/menu" className="ratio ratio-4x3">
												<img
													src={categoria.image}
													alt={`Categoría ${categoria.name}`}
													className="w-100 h-100 object-fit-cover"
													loading="lazy"
												/>
											</Link>
											<div className="card-body text-center d-flex flex-column gap-2">
												<h3 className="h5 mb-1">{categoria.name}</h3>
												<p className="mb-0 text-muted small">
													{categoria.productCount}{' '}
													{categoria.productCount === 1 ? 'producto disponible' : 'productos disponibles'}
												</p>
												<Button as="link" to="/menu" variant="strawberry" size="sm" className="mt-2">
													Explorar
												</Button>
											</div>
										</div>
									</div>
								))}
							</div>
							<div className="text-center mt-4">
								<Button as="link" to="/menu" size="lg" variant="strawberry">
									Ver carta completa
								</Button>
							</div>
						</>
					)}
				</div>
			</section>
		</>
	)
}

export default HomePage
