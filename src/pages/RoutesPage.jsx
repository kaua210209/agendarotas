import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function RoutesPage({ date, onBack, onSelectRoute }) {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRoutes()
  }, [date])

  async function loadRoutes() {
    setLoading(true)

    const { data, error } = await supabase
      .from('routes')
      .select(`
        id,
        origin,
        destination,
        distance,
        active
      `)
      .eq('active', true)
      .order('id')

    if (error) {
      console.error(error)
      setRoutes([])
    } else {
      setRoutes(data || [])
    }

    setLoading(false)
  }

  const formattedDate = new Date(
    `${date}T12:00:00`,
  ).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="min-h-screen bg-[#F8F9FA] px-5 pb-10 pt-8">
      <div className="mx-auto w-full max-w-md">

        {/* Voltar */}

        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600"
        >
          <span className="text-xl">‹</span>
          Calendário
        </button>

        {/* Título */}

        <p className="text-sm font-medium text-blue-600">
          ROTAS DO DIA
        </p>

        <h1 className="mt-1 text-2xl font-bold capitalize text-slate-900">
          {formattedDate}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Escolha uma rota para visualizar os horários.
        </p>

        {/* Rotas */}

        {loading ? (
          <div className="mt-8 text-center text-sm text-slate-500">
            Carregando rotas...
          </div>
        ) : routes.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-6 text-center shadow-sm">
            <p className="font-medium text-slate-800">
              Nenhuma rota cadastrada
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Cadastre as rotas no Supabase.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">

            {routes.map((route) => (
              <button
                key={route.id}
                onClick={() =>
                  onSelectRoute({
                    ...route,
                    date,
                  })
                }
                className="w-full rounded-3xl bg-white p-5 text-left shadow-sm transition hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex items-center justify-between gap-4">

                  {/* Informações */}

                  <div className="min-w-0">

                    <h2 className="font-semibold text-slate-900">
                      De {route.origin} a {route.destination}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {route.distance
                        ? `Via BR-116 • ${route.distance}`
                        : 'Rota cadastrada'}
                    </p>

                  </div>

                  {/* Seta */}

                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xl text-blue-600">
                    ›
                  </span>

                </div>
              </button>
            ))}

          </div>
        )}

      </div>
    </main>
  )
}

export default RoutesPage