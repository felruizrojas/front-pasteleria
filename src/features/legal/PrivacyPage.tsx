const PrivacyPage = () => (
    <main className="container py-5">
        <header className="mb-4">
            <h1 className="fw-bold">Politica de Privacidad</h1>
            <p className="mb-0">Vigente desde: 01 de septiembre de 2025</p>
        </header>

        <section className="mb-4">
            <h2 className="h4">1. Responsable del tratamiento</h2>
            <p>
                <strong>Pastelería Mil Sabores</strong>, con domicilio en Concepcion, Chile, es responsable del tratamiento de los datos personales recopilados a traves de este sitio web.
            </p>
        </section>

        <section className="mb-4">
            <h2 className="h4">2. Datos que recopilamos</h2>
            <ul>
                <li>Datos de registro: nombre, correo, contrasena, fecha de nacimiento.</li>
                <li>Datos de compra: direccion, telefono, productos adquiridos y medios de pago.</li>
                <li>Datos promocionales: edad, codigos de descuento y verificacion de correo institucional.</li>
                <li>Datos tecnicos: IP, cookies y metricas de navegacion.</li>
            </ul>
        </section>

        <section className="mb-4">
            <h2 className="h4">3. Finalidades</h2>
            <ul>
                <li>Procesar pedidos, pagos y despachos.</li>
                <li>Aplicar beneficios y descuentos promocionales.</li>
                <li>Enviar notificaciones y comunicaciones comerciales (con consentimiento).</li>
                <li>Mejorar la experiencia y prevenir fraudes.</li>
            </ul>
        </section>

        <section className="mb-4">
            <h2 className="h4">4. Conservacion</h2>
            <p>Conservamos los datos mientras exista relacion comercial o sea requerido por ley.</p>
        </section>

        <section className="mb-4">
            <h2 className="h4">5. Derechos</h2>
            <p>
                Puedes solicitar acceso, rectificacion, cancelacion u oposicion a tus datos escribiendo a
                <span className="ms-1">
                    <a className="link-body-emphasis" href="mailto:pasteleria.1000sabores@gmail.com">
                        pasteleria.1000sabores@gmail.com
                    </a>
                </span>
            </p>
        </section>

        <section>
            <h2 className="h4">6. Cambios</h2>
            <p>Actualizaremos esta politica cuando existan modificaciones relevantes y notificaremos en el sitio.</p>
        </section>
    </main>
)

export default PrivacyPage
