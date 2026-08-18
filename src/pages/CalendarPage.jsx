import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Calendar from '../components/Calendar'

function CalendarPage({ onSelectDate }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [markedDates, setMarkedDates] = useState([])

  useEffect(() => {
    loadMarkedDates()

    function handlePassengerChange() {
      loadMarkedDates()
    }

    window.addEventListener(
      'passenger-data-changed',
      handlePassengerChange,
    )

    return () => {
      window.removeEventListener(
        'passenger-data-changed',
        handlePassengerChange,
      )
    }
  }, [currentDate])

  async function loadMarkedDates() {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const startDate = `${year}-${String(
      month + 1,
    ).padStart(2, '0')}-01`

    const lastDay = new Date(
      year,
      month + 1,
      0,
    ).getDate()

    const endDate = `${year}-${String(
      month + 1,
    ).padStart(2, '0')}-${lastDay}`

    const { data, error } = await supabase
      .from('schedules')
      .select(`
        date,
        passengers!inner (
          id
        )
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .eq('active', true)

    if (error) {
      console.error('Erro ao carregar datas:', error)
      setMarkedDates([])
      return
    }

    const dates = [
      ...new Set(
        (data || []).map((item) => item.date),
      ),
    ]

    setMarkedDates(dates)
  }

  function handleSelectDate(date) {
    setSelectedDate(date)
    onSelectDate(date)
  }

  return (
    <main className="min-h-screen bg-[#111111] p-4">
      <div className="mx-auto max-w-md">
        <Calendar
          currentDate={currentDate}
          selectedDate={selectedDate}
          markedDates={markedDates}
          onDateChange={setCurrentDate}
          onSelectDate={handleSelectDate}
        />
      </div>
    </main>
  )
}

export default CalendarPage