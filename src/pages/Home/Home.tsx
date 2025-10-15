import { Button } from '../../components/common'

interface CarouselItem {
	id: string
	image: string
	alt: string
	caption?: {
		ctaLabel: string
		to: string
		external?: boolean
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
		image: new URL('../../assets/img/carrusel/carrusel_carta.jpg', import.meta.url).href,
		alt: 'Torta con frutas',
		caption: { ctaLabel: 'Ver carta', to: '/menu' },
	},
	{
		id: 'about',
		image: new URL('../../assets/img/carrusel/carrusel_nosotros.jpg', import.meta.url).href,
		alt: 'Vitrina de pasteleria',
		caption: { ctaLabel: 'Conocenos', to: '/about' },
	},
	{
		id: 'blog',
		image: new URL('../../assets/img/carrusel/carrusel_blog.jpg', import.meta.url).href,
		alt: 'Persona usando laptop',
		caption: { ctaLabel: 'Visita nuestro blog', to: '/blog' },
	},
	{
		id: 'social',
		image: new URL('../../assets/img/carrusel/diversidad_pasteles.jpg', import.meta.url).href,
		alt: 'Vitrina con variedad de pasteles',
		overlay: {
			title: 'TRIVIA 1000 SABORES',
			subtitle: 'Siguenos en Instagram y participa en nuestra trivia',
			highlight: 'Gana un descuento de por vida en tus compras!',
		},
		caption: {
			ctaLabel: 'Ir a Instagram',
			to: 'https://www.instagram.com/pasteleria1000sabores',
			external: true,
		},
	},
]

const carouselId = 'homeCarousel'

const Home = () => (
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
									{item.caption.external ? (
										<Button as="a" href={item.caption.to} size="lg" target="_blank" rel="noreferrer">
											{item.caption.ctaLabel}
										</Button>
									) : (
										<Button as="link" to={item.caption.to} size="lg">
											{item.caption.ctaLabel}
										</Button>
									)}
								</div>
							) : null}
						</div>
					))}
				</div>

				<button
					className="carousel-control-prev"
					type="button"
					data-bs-target={`#${carouselId}`}
					data-bs-slide="prev"
				>
					<span className="carousel-control-prev-icon" aria-hidden="true" />
					<span className="visually-hidden">Anterior</span>
				</button>
				<button
					className="carousel-control-next"
					type="button"
					data-bs-target={`#${carouselId}`}
					data-bs-slide="next"
				>
					<span className="carousel-control-next-icon" aria-hidden="true" />
					<span className="visually-hidden">Siguiente</span>
				</button>
			</div>
		</section>

		<section className="py-5">
			<div className="container">
				<h2 className="mb-4 text-center section-title">Nuestra carta</h2>
			</div>
		</section>
	</>
)

export default Home
