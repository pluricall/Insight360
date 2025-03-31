import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
      <div className="text-center bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-6xl font-bold text-gray-800 mb-4 animate__animated animate__fadeIn">
          404
        </h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 animate__animated animate__fadeIn">
          Página não encontrada.
        </h2>
        <p className="text-lg text-gray-600 mb-8 animate__animated animate__fadeIn">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg shadow-lg transition duration-300 hover:bg-sky-600 transform hover:scale-105"
        >
          Voltar para a Página Inicial
        </Link>
      </div>
    </div>
  )
}
