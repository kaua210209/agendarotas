import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { supabase } from '../lib/supabase'

const DEFAULT_SCHEDULES = {
  'Bom Jesus-Muriaé': [
    '07:00',
    '09:00',
    '11:20',
    '13:00',
    '17:00',
  ],

  'Muriaé-Bom Jesus': [
    '08:00',
    '10:30',
    '12:00',
    '15:30',
    '17:30',
  ],
}

function RoutesPage({ date, onBack, onSelectRoute }) {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRoutes()
  }, [date])

  async function loadRoutes() {
    setLoading(true)

    try {
      // Busca as rotas cadastradas
      const { data: routesData, error: routesError } =
        await supabase
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

      if (routesError) {
        throw routesError
      }

      const availableRoutes = routesData || []

      // Prepara os horários padrão de cada rota
      for (const route of availableRoutes) {
        const routeKey = `${route.origin}-${route.destination}`

        const defaultTimes =
          DEFAULT_SCHEDULES[routeKey]

        // Se não houver horários padrão para a rota,
        // passa para a próxima.
        if (!defaultTimes) {
          continue
        }

        // Verifica se já existem horários para esta rota
        // neste dia.
        const {
          data: existingSchedules,
          error: schedulesError,
        } = await supabase
          .from('schedules')
          .select('id')
          .eq('route_id', route.id)
          .eq('date', date)

        if (schedulesError) {
          throw schedulesError
        }

        /*
          Se já existe qualquer horário para essa rota
          nesse dia, não cria os horários novamente.

          Isso também permite que você edite ou exclua
          horários sem que eles sejam recriados.
        */
        if (
          existingSchedules &&
          existingSchedules.length > 0
        ) {
          continue
        }

        // Cria os horários padrão
        const schedulesToCreate =
          defaultTimes.map((time) => ({
            route_id: route.id,
            date: date,
            time: time,
            active: true,
          }))

        const { error: insertError } =
          await supabase
            .from('schedules')
            .upsert(
              schedulesToCreate,
              {
                onConflict:
                  'route_id,date,time',
                ignoreDuplicates: true,
              },
            )

        if (insertError) {
          throw insertError
        }
      }

      setRoutes(availableRoutes)
    } catch (error) {
      console.error(error)

      setRoutes([])

      await Swal.fire({
        icon: 'error',
        title: 'Erro ao carregar o dia',
        text:
          'Não foi possível preparar os horários deste dia.',
        confirmButtonText: 'Fechar',
        confirmButtonColor: '#2563eb',
      })
    } finally {
      setLoading(false)
    }
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
            Preparando horários...
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