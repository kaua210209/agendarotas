import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { supabase } from '../lib/supabase'

function PassengersPage({
  schedule,
  route,
  date,
  onBack,
}) {
  const [passengers, setPassengers] = useState([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editingPassenger, setEditingPassenger] = useState(null)
  const [name, setName] = useState('')

  useEffect(() => {
    loadPassengers()
  }, [schedule.id])

  async function loadPassengers() {
    setLoading(true)

    const { data, error } = await supabase
      .from('passengers')
      .select('*')
      .eq('schedule_id', schedule.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error(error)
      setPassengers([])
    } else {
      setPassengers(data || [])
    }

    setLoading(false)
  }

  function openAddModal() {
    setEditingPassenger(null)
    setName('')
    setShowModal(true)
  }

  function openEditModal(passenger) {
    setEditingPassenger(passenger)
    setName(passenger.name)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingPassenger(null)
    setName('')
  }

  async function savePassenger() {
  const passengerName = name.trim()

  if (!passengerName) {
    await Swal.fire({
      icon: 'warning',
      title: 'Nome obrigatório',
      text: 'Digite o nome do passageiro.',
      confirmButtonText: 'Entendi',
      confirmButtonColor: '#2563eb',
    })

    return
  }

  Swal.fire({
    title: editingPassenger
      ? 'Salvando alterações...'
      : 'Adicionando passageiro...',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })

  if (editingPassenger) {
    const { error } = await supabase
      .from('passengers')
      .update({
        name: passengerName,
      })
      .eq('id', editingPassenger.id)

    if (error) {
      console.error(error)

      await Swal.fire({
        icon: 'error',
        title: 'Não foi possível atualizar',
        text: 'O passageiro não foi atualizado.',
        confirmButtonText: 'Fechar',
        confirmButtonColor: '#2563eb',
      })

      return
    }

    closeModal()

    await loadPassengers()

    window.dispatchEvent(
  new Event('passenger-data-changed'),
)

    await Swal.fire({
      icon: 'success',
      title: 'Passageiro atualizado!',
      text: `${passengerName} foi atualizado com sucesso.`,
      confirmButtonText: 'OK',
      confirmButtonColor: '#2563eb',
      timer: 1800,
      timerProgressBar: true,
    })

    return
  }

  const { error } = await supabase
    .from('passengers')
    .insert({
      schedule_id: schedule.id,
      name: passengerName,
      paid: false,
    })

  if (error) {
    console.error(error)

    await Swal.fire({
      icon: 'error',
      title: 'Não foi possível adicionar',
      text: 'O passageiro não foi adicionado.',
      confirmButtonText: 'Fechar',
      confirmButtonColor: '#2563eb',
    })

    return
  }

  closeModal()

  await loadPassengers()

  await Swal.fire({
    icon: 'success',
    title: 'Passageiro adicionado!',
    text: `${passengerName} foi adicionado à viagem.`,
    confirmButtonText: 'OK',
    confirmButtonColor: '#2563eb',
    timer: 1800,
    timerProgressBar: true,
  })
}

  async function togglePayment(passenger) {
  const newStatus = !passenger.paid

  const { error } = await supabase
    .from('passengers')
    .update({
      paid: newStatus,
    })
    .eq('id', passenger.id)

  if (error) {
    console.error(error)

    await Swal.fire({
      toast: true,
      position: 'top',
      icon: 'error',
      title: 'Não foi possível atualizar o pagamento',
      showConfirmButton: false,
      timer: 2000,
    })

    return
  }

  await loadPassengers()

  Swal.fire({
    toast: true,
    position: 'top',
    icon: newStatus ? 'success' : 'info',
    title: newStatus
      ? `${passenger.name} está pago`
      : `${passenger.name} está pendente`,
    showConfirmButton: false,
    timer: 1600,
  })
}

  async function deletePassenger(passenger) {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Excluir passageiro?',
    text: `Você realmente deseja excluir "${passenger.name}"?`,
    showCancelButton: true,
    confirmButtonText: 'Sim, excluir',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#64748b',
    reverseButtons: true,
  })

  if (!result.isConfirmed) {
    return
  }

  Swal.fire({
    title: 'Excluindo...',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })

  const { error } = await supabase
    .from('passengers')
    .delete()
    .eq('id', passenger.id)

  if (error) {
    console.error(error)

    await Swal.fire({
      icon: 'error',
      title: 'Erro ao excluir',
      text: 'Não foi possível excluir o passageiro.',
      confirmButtonText: 'Fechar',
      confirmButtonColor: '#2563eb',
    })

    return
  }

  await loadPassengers()

  window.dispatchEvent(
  new Event('passenger-data-changed'),
)

  await Swal.fire({
    icon: 'success',
    title: 'Passageiro excluído!',
    text: `${passenger.name} foi removido da viagem.`,
    confirmButtonText: 'OK',
    confirmButtonColor: '#2563eb',
    timer: 1800,
    timerProgressBar: true,
  })
}

  const total = passengers.length

  const paid = passengers.filter(
    (passenger) => passenger.paid,
  ).length

  const pending = total - paid

  const formattedDate = new Date(
    `${date}T12:00:00`,
  ).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="min-h-screen bg-white">

      {/* Cabeçalho */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 w-full max-w-md items-center justify-between px-5">

          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-700 transition hover:bg-slate-200"
            aria-label="Voltar"
          >
            ←
          </button>

          <div className="min-w-0 flex-1 px-4">
            <h1 className="truncate text-xl font-bold text-slate-900">
              {schedule.time.slice(0, 5)}
            </h1>

            <p className="truncate text-sm text-slate-500">
              De {route.origin} a {route.destination}
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl text-slate-900 shadow-sm transition hover:bg-slate-50"
            aria-label="Adicionar passageiro"
          >
            +
          </button>

        </div>
      </header>

      {/* Conteúdo */}

      <div className="mx-auto w-full max-w-md px-5 pb-10">

        {/* Data */}

        <div className="pt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {formattedDate}
          </p>

          <h2 className="mt-2 text-xl font-bold text-slate-900">
            Lista de Passageiros
          </h2>
        </div>

        {/* Resumo */}

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">

          <div className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm">
            <span className="font-semibold text-slate-900">
              {total}
            </span>

            <span className="ml-1 text-slate-500">
              Total
            </span>
          </div>

          <div className="shrink-0 rounded-full bg-green-100 px-4 py-2 text-sm">
            <span className="font-semibold text-green-700">
              {paid}
            </span>

            <span className="ml-1 text-green-700">
              Pagos
            </span>
          </div>

          <div className="shrink-0 rounded-full bg-red-100 px-4 py-2 text-sm">
            <span className="font-semibold text-red-600">
              {pending}
            </span>

            <span className="ml-1 text-red-600">
              Pendentes
            </span>
          </div>

        </div>

        {/* Lista */}

        <div className="mt-5">

          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Carregando passageiros...
            </div>
          ) : passengers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                👤
              </div>

              <p className="mt-4 font-semibold text-slate-900">
                Nenhum passageiro
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Adicione o primeiro passageiro desta viagem.
              </p>

              <button
                onClick={openAddModal}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                + Adicionar passageiro
              </button>
            </div>
          ) : (
            <div className="space-y-2">

              {passengers.map((passenger, index) => (
                <div
                  key={passenger.id}
                  className="flex min-h-[72px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3"
                >

                  {/* Número */}

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  {/* Nome */}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">
                      {passenger.name}
                    </p>
                  </div>

                  {/* Pagamento */}

                  <button
                    onClick={() => togglePayment(passenger)}
                    className={`
                      shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition
                      ${
                        passenger.paid
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }
                    `}
                  >
                    {passenger.paid ? '✓ Pago' : '— Pago'}
                  </button>

                  {/* Editar */}

                  <button
                    onClick={() => openEditModal(passenger)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    title="Editar passageiro"
                  >
                    ✏️
                  </button>

                  {/* Excluir */}

                  <button
                    onClick={() => deletePassenger(passenger)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    title="Excluir passageiro"
                  >
                    🗑️
                  </button>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>

      {/* Modal */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">

          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

            {/* Cabeçalho */}

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                  Passageiro
                </p>

                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  {editingPassenger
                    ? 'Editar passageiro'
                    : 'Novo passageiro'}
                </h3>
              </div>

              <button
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500"
              >
                ×
              </button>

            </div>

            {/* Nome */}

            <div className="mt-6">

              <label className="text-sm font-medium text-slate-700">
                Nome do passageiro
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    savePassenger()
                  }
                }}
                autoFocus
                placeholder="Ex.: Maria Silva"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* Botões */}

            <div className="mt-6 flex gap-3">

              <button
                onClick={closeModal}
                className="flex-1 rounded-2xl bg-slate-100 py-3 font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Cancelar
              </button>

              <button
                onClick={savePassenger}
                disabled={!name.trim()}
                className="flex-1 rounded-2xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {editingPassenger
                  ? 'Salvar alterações'
                  : 'Adicionar'}
              </button>

            </div>

          </div>
        </div>
      )}

    </main>
  )
}

export default PassengersPage