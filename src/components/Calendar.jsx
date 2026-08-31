import { useMemo } from 'react'

function Calendar({
  currentDate,
  selectedDate,
  markedDates,
  onDateChange,
  onSelectDate,
}) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Nome do mês
  const monthLabel = currentDate.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  /*
    Calculamos tudo usando o ano e mês locais.

    0 = Domingo
    1 = Segunda
    2 = Terça
    3 = Quarta
    4 = Quinta
    5 = Sexta
    6 = Sábado
  */

  const firstDayOfMonth = new Date(
    year,
    month,
    1,
  )

  const firstDay = firstDayOfMonth.getDay()

  // Dia 0 do mês seguinte = último dia do mês atual
  const daysInMonth = new Date(
    year,
    month + 1,
    0,
  ).getDate()

  /*
    Cria todos os espaços e dias do calendário.
  */

  const days = useMemo(() => {
    const list = []

    // Espaços antes do dia 1
    for (let i = 0; i < firstDay; i++) {
      list.push(null)
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      list.push(day)
    }

    return list
  }, [year, month, firstDay, daysInMonth])

  /*
    Converte um número de dia para:
    YYYY-MM-DD

    Sem usar toISOString(), evitando problemas
    de fuso horário.
  */

  function formatDate(day) {
    const formattedMonth = String(month + 1).padStart(
      2,
      '0',
    )

    const formattedDay = String(day).padStart(
      2,
      '0',
    )

    return `${year}-${formattedMonth}-${formattedDay}`
  }

  /*
    Vai para o mês anterior.
  */

  function previousMonth() {
    const newDate = new Date(
      year,
      month - 1,
      1,
    )

    onDateChange(newDate)
  }

  /*
    Vai para o próximo mês.
  */

  function nextMonth() {
    const newDate = new Date(
      year,
      month + 1,
      1,
    )

    onDateChange(newDate)
  }

  /*
    Volta para o mês atual.
  */

  function goToToday() {
    const today = new Date()

    onDateChange(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      ),
    )
  }

  return (
    <div className="rounded-[28px] bg-white p-6 shadow-sm">

      {/* Cabeçalho */}

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-3xl font-bold capitalize">
            {monthLabel}
          </h2>

          <p className="text-sm text-slate-500">
            Calendário Mensal
          </p>
        </div>

        {/* Navegação */}

        <div className="flex gap-2">

          {/* Mês anterior */}

          <button
            type="button"
            onClick={previousMonth}
            className="h-10 w-10 rounded-full border border-slate-200 hover:bg-slate-100"
            aria-label="Mês anterior"
          >
            ‹
          </button>

          {/* Hoje */}

          <button
            type="button"
            onClick={goToToday}
            className="rounded-full border border-slate-200 px-4 text-sm hover:bg-slate-100"
          >
            Hoje
          </button>

          {/* Próximo mês */}

          <button
            type="button"
            onClick={nextMonth}
            className="h-10 w-10 rounded-full border border-slate-200 hover:bg-slate-100"
            aria-label="Próximo mês"
          >
            ›
          </button>

        </div>
      </div>

      {/* Separador */}

      <div className="my-5 h-px bg-slate-200" />

      {/* Dias da semana */}

      <div className="grid grid-cols-7 text-center text-sm font-semibold">

        {[
          'Dom',
          'Seg',
          'Ter',
          'Qua',
          'Qui',
          'Sex',
          'Sáb',
        ].map((day, index) => (
          <div
            key={day}
            className={
              index === 0 || index === 6
                ? 'text-red-500'
                : 'text-slate-700'
            }
          >
            {day}
          </div>
        ))}

      </div>

      {/* Dias */}

      <div className="mt-4 grid grid-cols-7 gap-y-3">

        {days.map((day, index) => {

          // Espaço vazio antes do primeiro dia
          if (day === null) {
            return (
              <div
                key={`empty-${index}`}
                className="h-14"
              />
            )
          }

          const dateString = formatDate(day)

          const isSelected =
            selectedDate === dateString

          const isMarked =
            markedDates.includes(dateString)

          return (
            <button
              type="button"
              key={dateString}
              onClick={() =>
                onSelectDate(dateString)
              }
              className="relative flex h-14 items-center justify-center"
            >

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                {day}
              </div>

              {/* Indicador de rota cadastrada */}

              {isMarked && !isSelected && (
                <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-blue-600" />
              )}

            </button>
          )
        })}

      </div>

    </div>
  )
}

export default Calendar