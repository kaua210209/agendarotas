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

  const monthLabel = currentDate.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days = useMemo(() => {
    const list = []

    for (let i = 0; i < firstDay; i++) list.push(null)
    for (let d = 1; d <= daysInMonth; d++) list.push(d)

    return list
  }, [firstDay, daysInMonth])

  const formatDate = (day) => {
    const m = String(month + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${year}-${m}-${d}`
  }

  return (
    <div className="rounded-[28px] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold capitalize">
            {monthLabel}
          </h2>
          <p className="text-sm text-slate-500">
            Calendário Mensal
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() =>
              onDateChange(new Date(year, month - 1, 1))
            }
            className="h-10 w-10 rounded-full border border-slate-200 hover:bg-slate-100"
          >
            ‹
          </button>

          <button
            onClick={() => onDateChange(new Date())}
            className="rounded-full border border-slate-200 px-4 text-sm hover:bg-slate-100"
          >
            Hoje
          </button>

          <button
            onClick={() =>
              onDateChange(new Date(year, month + 1, 1))
            }
            className="h-10 w-10 rounded-full border border-slate-200 hover:bg-slate-100"
          >
            ›
          </button>
        </div>
      </div>

      <div className="my-5 h-px bg-slate-200" />

      <div className="grid grid-cols-7 text-center text-sm font-semibold">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(
          (day, i) => (
            <div
              key={day}
              className={i === 0 || i === 6 ? 'text-red-500' : ''}
            >
              {day}
            </div>
          ),
        )}
      </div>

      <div className="mt-4 grid grid-cols-7 gap-y-3">
        {days.map((day, index) =>
          day === null ? (
            <div key={index} className="h-14" />
          ) : (
            <button
              key={day}
              onClick={() => onSelectDate(formatDate(day))}
              className="relative flex h-14 items-center justify-center"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition ${
                  selectedDate === formatDate(day)
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                {day}
              </div>

              {markedDates.includes(formatDate(day)) &&
                selectedDate !== formatDate(day) && (
                  <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-blue-600" />
                )}
            </button>
          ),
        )}
      </div>
    </div>
  )
}

export default Calendar