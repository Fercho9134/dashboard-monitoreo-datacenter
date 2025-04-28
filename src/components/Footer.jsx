// src/components/Footer.jsx

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        {/* Contenido del footer */}
        <div className="text-center">
          {/* Logo o nombre de la aplicación */}
          <div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold mb-4"
          >
            DataCenter Monitor
          </div>

          {/* Texto descriptivo */}
          <div
            className="text-gray-400 max-w-md mx-auto"
          >
            Monitorea y analiza los datos de tus sensores en tiempo real.
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} DataCenter Monitor. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}