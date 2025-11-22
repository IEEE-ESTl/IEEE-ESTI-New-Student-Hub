export const runtime = 'edge'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
      <h2 className={`text-3xl font-bold mb-4 text-gray-800`}>
        404 - Página no encontrada
      </h2>
      <p className="mb-8 text-gray-600">
        Lo sentimos, no pudimos encontrar el recurso que buscas.
      </p>
      <Link 
        href="/"
        className="bg-[#0371a4] text-white px-6 py-3 rounded-md hover:bg-[#025a83] transition-colors"
      >
        Volver al Inicio
      </Link>
    </div>
  )
}