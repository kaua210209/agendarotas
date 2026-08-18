import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { supabase } from '../lib/supabase'

function SchedulesPage({
  route,
  date,
  onBack,
  onSelectSchedule,
}) {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [time, setTime] = useState('')

  useEffect(() => {
    loadSchedules()
  }, [route.id, date])

  async function loadSchedules() {
    setLoading(true)

    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('route_id', route.id)
      .eq('date', date)
      .eq('active', true)
      .order('time')

    if (error) {
      console.error(error)
      setSchedules([])
    } else {
      setSchedules(data || [])
    }

    setLoading(false)
  }

  function openAddModal() {
    setEditingSchedule(null)
    setTime('')
    setShowModal(true)
  }

  function openEditModal(schedule) {
    setEditingSchedule(schedule)
    setTime(schedule.time.slice(0, 5))
    setShowModal(true)
  }

  async function saveSchedule() {
  if (!time) {
    await Swal.fire({
      icon: 'warning',
      title: 'Horário obrigatório',
      text: 'Escolha um horário para continuar.',
      confirmButtonText: 'Entendi',
      confirmButtonColor: '#2563eb',
    })

    return
  }

  Swal.fire({
    title: editingSchedule
      ? 'Salvando alterações...'
      : 'Adicionando horário...',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })

  if (editingSchedule) {
    const { error } = await supabase
      .from('schedules')
      .update({
        time: time,
      })
      .eq('id', editingSchedule.id)

    if (error) {
      console.error(error)

      await Swal.fire({
        icon: 'error',
        title: 'Erro ao atualizar',
        text: 'Não foi possível atualizar o horário.',
        confirmButtonText: 'Fechar',
        confirmButtonColor: '#2563eb',
      })

      return
    }

    setShowModal(false)
    setTime('')
    setEditingSchedule(null)

    await loadSchedules()

    await Swal.fire({
      icon: 'success',
      title: 'Horário atualizado!',
      text: `O horário ${time} foi atualizado.`,
      confirmButtonText: 'OK',
      confirmButtonColor: '#2563eb',
      timer: 1800,
      timerProgressBar: true,
    })

    return
  }

  const { error } = await supabase
    .from('schedules')
    .insert({
      route_id: route.id,
      date: date,
      time: time,
      active: true,
    })

  if (error) {
    console.error(error)

    await Swal.fire({
      icon: 'error',
      title: 'Erro ao adicionar',
      text: 'Não foi possível adicionar o horário.',
      confirmButtonText: 'Fechar',
      confirmButtonColor: '#2563eb',
    })

    return
  }

  setShowModal(false)
  setTime('')
  setEditingSchedule(null)

  await loadSchedules()

  await Swal.fire({
    icon: 'success',
    title: 'Horário adicionado!',
    text: `O horário ${time} foi cadastrado com sucesso.`,
    confirmButtonText: 'OK',
    confirmButtonColor: '#2563eb',
    timer: 1800,
    timerProgressBar: true,
  })
}

  async function deleteSchedule(schedule) {
  // Verifica se existem passageiros neste horário
  const { data: passengers, error: passengersError } =
    await supabase
      .from('passengers')
      .select('id, name')
      .eq('schedule_id', schedule.id)

  if (passengersError) {
    console.error(passengersError)

    await Swal.fire({
      icon: 'error',
      title: 'Erro ao verificar passageiros',
      text: 'Não foi possível verificar os passageiros deste horário.',
      confirmButtonText: 'Fechar',
      confirmButtonColor: '#2563eb',
    })

    return
  }

  const passengerCount = passengers?.length || 0

  // Se houver passageiros, avisa antes de excluir
  if (passengerCount > 0) {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Horário possui passageiros',
      html: `
        <p>
          O horário <strong>${schedule.time.slice(0, 5)}</strong>
          possui <strong>${passengerCount}</strong>
          ${passengerCount === 1 ? 'passageiro' : 'passageiros'}.
        </p>

        <p style="margin-top: 10px;">
          Ao excluir o horário, todos os passageiros
          vinculados a ele também serão excluídos.
        </p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Excluir tudo',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
    })

    if (!result.isConfirmed) {
      return
    }
  } else {
    // Se não houver passageiros, confirmação normal
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Excluir horário?',
      text: `Você realmente deseja excluir o horário ${schedule.time.slice(0, 5)}?`,
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
  }

  // Mostra carregamento
  Swal.fire({
    title: 'Excluindo...',
    text:
      passengerCount > 0
        ? 'Removendo horário e passageiros.'
        : 'Removendo horário.',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })

  // Se houver passageiros, exclui primeiro os passageiros
  if (passengerCount > 0) {
    const { error: passengersDeleteError } = await supabase
      .from('passengers')
      .delete()
      .eq('schedule_id', schedule.id)

    if (passengersDeleteError) {
      console.error(passengersDeleteError)

      await Swal.fire({
        icon: 'error',
        title: 'Erro ao excluir passageiros',
        text: 'O horário não foi excluído.',
        confirmButtonText: 'Fechar',
        confirmButtonColor: '#2563eb',
      })

      return
    }
  }

  // Depois exclui o horário
  const { error: scheduleDeleteError } = await supabase
    .from('schedules')
    .delete()
    .eq('id', schedule.id)

  if (scheduleDeleteError) {
    console.error(scheduleDeleteError)

    await Swal.fire({
      icon: 'error',
      title: 'Erro ao excluir horário',
      text:
        passengerCount > 0
          ? 'Os passageiros foram removidos, mas o horário não pôde ser excluído. Verifique o banco de dados.'
          : 'Não foi possível excluir o horário.',
      confirmButtonText: 'Fechar',
      confirmButtonColor: '#2563eb',
    })

    await loadSchedules()

    return
  }

  await loadSchedules()

  // Atualiza o calendário caso o horário excluído
  // tenha sido o último horário com passageiros
  window.dispatchEvent(
    new Event('passenger-data-changed'),
  )

  await Swal.fire({
    icon: 'success',
    title: 'Horário excluído!',
    text:
      passengerCount > 0
        ? `O horário ${schedule.time.slice(0, 5)} e seus ${passengerCount} ${
            passengerCount === 1
              ? 'passageiro'
              : 'passageiros'
          } foram excluídos.`
        : `O horário ${schedule.time.slice(0, 5)} foi removido.`,
    confirmButtonText: 'OK',
    confirmButtonColor: '#2563eb',
    timer: 2000,
    timerProgressBar: true,
  })
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

        {/* Cabeçalho */}

        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-slate-600"
          >
            <span className="text-xl">‹</span>
            Rotas
          </button>

          <button
            onClick={openAddModal}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-2xl text-white shadow-sm transition hover:bg-blue-700"
          >
            +
          </button>
        </div>

        {/* Título */}

        <p className="mt-7 text-sm font-medium text-blue-600">
          HORÁRIOS
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          De {route.origin} a {route.destination}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {formattedDate}
        </p>

        {/* Lista de horários */}

        {loading ? (
          <div className="mt-8 text-center text-sm text-slate-500">
            Carregando horários...
          </div>
        ) : schedules.length === 0 ? (
  <div className="mt-8 rounded-3xl bg-white p-7 text-center shadow-sm">

    {/* Ícone */}

    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
      <span className="text-3xl">🕐</span>
    </div>

    {/* Título */}

    <h2 className="mt-5 text-lg font-semibold text-slate-900">
      Nenhum horário cadastrado
    </h2>

    {/* Descrição */}

    <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
      Ainda não existem horários para esta rota neste dia.
    </p>

    {/* Botão */}

    <button
      onClick={openAddModal}
      className="mt-6 w-full rounded-2xl bg-blue-600 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
    >
      + Adicionar horário
    </button>

  </div>
) : (
          <div className="mt-6 space-y-3">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between rounded-3xl bg-white p-5 shadow-sm"
              >
                {/* Abrir passageiros */}

                <button
                  onClick={() => onSelectSchedule(schedule)}
                  className="flex flex-1 items-center text-left"
                >
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {schedule.time.slice(0, 5)}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Ver passageiros
                    </p>
                  </div>
                </button>

                {/* Ações */}

                <div className="flex items-center gap-2">

                  <button
                    onClick={() => openEditModal(schedule)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg transition hover:bg-slate-200"
                    title="Editar"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() => deleteSchedule(schedule)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-lg transition hover:bg-red-100"
                    title="Excluir"
                  >
                    🗑️
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal adicionar / editar */}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">

            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">

              {/* Cabeçalho do modal */}

              <div className="flex items-center justify-between">

                <h2 className="text-xl font-bold text-slate-900">
                  {editingSchedule
                    ? 'Editar horário'
                    : 'Novo horário'}
                </h2>

                <button
                  onClick={() => setShowModal(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                >
                  ×
                </button>

              </div>

              {/* Campo */}

              <label className="mt-6 block text-sm font-medium text-slate-700">
                Horário
              </label>

              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              {/* Botões */}

              <div className="mt-6 flex gap-3">

                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-2xl bg-slate-100 py-3 font-medium text-slate-700"
                >
                  Cancelar
                </button>

                <button
                  onClick={saveSchedule}
                  disabled={!time}
                  className="flex-1 rounded-2xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Salvar
                </button>

              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  )
}

export default SchedulesPage