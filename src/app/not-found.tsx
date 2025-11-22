export const runtime = 'edge';

import Link from 'next/link'

export default function NotFoundCatchAll() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h2 className="text-3xl font-bold mb-4">404 - Página no encontrada</h2>
      <p className="mb-8">La página que buscas no existe.</p>
      <Link 
        href="/"
        className="bg-[#0371a4] text-white px-6 py-3 rounded hover:bg-[#025a83] transition-colors"
      >
        Volver al Inicio
      </Link>
    </div>
  )
}