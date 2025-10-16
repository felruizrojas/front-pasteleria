import { Button } from '@/shared/components/common'

const Cart = () => (
  <section className="container py-5">
    <div className="card-soft">
      <h1 className="section-title">Carrito de compras</h1>
      <p className="mb-3">
        Aun no tienes productos seleccionados. Explora nuestra carta para agregar tus postres favoritos.
      </p>
      <Button as="link" to="/menu" variant="mint">
        Ir a la carta
      </Button>
    </div>
  </section>
)

export default Cart
