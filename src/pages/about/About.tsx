import aboutHeroImage from '../../assets/img/about/vista_pasteleria_mil_sabores.jpg'
import missionImage from '../../assets/img/about/diversos_productos.jpg'
import visionImage from '../../assets/img/about/persona_trabajando_en_una_cocina.jpg'
import communityImage from '../../assets/img/about/estudiante_de_reposteria_aprendiendo_en_la_cocina.jpg'

interface StoryBlock {
	id: string
	title: string
	description: string[]
	image: string
	imageAlt: string
	invert?: boolean
}

const storyBlocks: StoryBlock[] = [
	{
		id: 'about',
		title: 'Quienes somos',
		description: [
			'En Pasteleria 1000 Sabores celebramos 50 anos de historia endulzando momentos unicos y siendo un referente de la reposteria chilena.',
			'Desde nuestro record Guinness en 1995, cuando colaboramos en la creacion de la torta mas grande del mundo, mantenemos viva la tradicion de innovar y sorprender con cada creacion.',
			'Hoy renovamos nuestro sistema de ventas online para que nuestros clientes disfruten de una experiencia moderna y accesible, llevando la dulzura directamente a sus hogares.',
		],
		image: aboutHeroImage,
		imageAlt: 'Tienda Pasteleria Mil Sabores',
	},
	{
		id: 'mission',
		title: 'Mision',
		description: [
			'Ofrecer una experiencia dulce y memorable, proporcionando tortas y productos de reposteria de alta calidad para todas las ocasiones.',
			'Celebramos nuestras raices historicas y fomentamos la creatividad en la reposteria chilena.',
		],
		image: missionImage,
		imageAlt: 'Diversos productos de reposteria',
		invert: true,
	},
	{
		id: 'vision',
		title: 'Vision',
		description: [
			'Convertirnos en la tienda online lider de reposteria en Chile, reconocida por la calidad, la innovacion y el impacto positivo en la comunidad.',
			'Queremos ser una plataforma de impulso para las nuevas generaciones de talentos gastronomicos.',
		],
		image: visionImage,
		imageAlt: 'Persona trabajando en una cocina',
	},
	{
		id: 'community',
		title: 'Impacto comunitario',
		description: [
			'Cada compra apoya a estudiantes de gastronomia y a la comunidad local, contribuyendo a que nuevas generaciones de reposteros sigan creando y compartiendo su arte.',
		],
		image: communityImage,
		imageAlt: 'Estudiante de reposteria aprendiendo en la cocina',
		invert: true,
	},
]

const About = () => (
	<main className="mt-0">
		<section>
			{storyBlocks.map((block) => (
				<div className="container py-5" key={block.id}>
					<div className={`row align-items-center ${block.invert ? 'flex-md-row-reverse' : ''}`}>
						<div className="col-md-6 mb-4 mb-md-0">
							<img src={block.image} alt={block.imageAlt} className="img-fluid rounded shadow-soft" />
						</div>
						<div className="col-md-6">
							<h1 className="section-title mb-3">{block.title}</h1>
							{block.description.map((paragraph) => (
								<p className="text-muted-soft" key={paragraph}>
									{paragraph}
								</p>
							))}
						</div>
					</div>
				</div>
			))}

			<div className="container">
				<div className="mt-4 p-5 card-soft text-center">
					<h3 className="mb-3">Celebra la dulzura de la vida con Pasteleria 1000 Sabores</h3>
					<h5 className="mb-1 text-muted-soft">Estamos emocionados de compartir nuestras delicias contigo.</h5>
					<h5 className="text-muted-soft">Descubre, saborea y crea momentos inolvidables con nosotros.</h5>
				</div>
			</div>
		</section>
	</main>
)

export default About
