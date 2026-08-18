import { useState } from 'react'
import CalendarPage from './pages/CalendarPage'
import RoutesPage from './pages/RoutesPage'
import SchedulesPage from './pages/SchedulesPage'
import PassengersPage from './pages/PassengersPage'

function App() {
  const [page, setPage] = useState('calendar')

  const [selectedDate, setSelectedDate] = useState(null)

  const [selectedRoute, setSelectedRoute] = useState(null)

  const [selectedSchedule, setSelectedSchedule] =
    useState(null)

  function handleSelectDate(date) {
    setSelectedDate(date)
    setPage('routes')
  }

  function handleSelectRoute(route) {
    setSelectedRoute(route)
    setPage('schedules')
  }

  function handleSelectSchedule(schedule) {
    setSelectedSchedule(schedule)
    setPage('passengers')
  }

  function handleBackToCalendar() {
    setPage('calendar')
  }

  function handleBackToRoutes() {
    setPage('routes')
  }

  function handleBackToSchedules() {
    setPage('schedules')
  }

  if (page === 'passengers') {
    return (
      <PassengersPage
        schedule={selectedSchedule}
        route={selectedRoute}
        date={selectedDate}
        onBack={handleBackToSchedules}
      />
    )
  }

  if (page === 'schedules') {
    return (
      <SchedulesPage
        route={selectedRoute}
        date={selectedDate}
        onBack={handleBackToRoutes}
        onSelectSchedule={handleSelectSchedule}
      />
    )
  }

  if (page === 'routes') {
    return (
      <RoutesPage
        date={selectedDate}
        onBack={handleBackToCalendar}
        onSelectRoute={handleSelectRoute}
      />
    )
  }

  return (
    <CalendarPage
      onSelectDate={handleSelectDate}
    />
  )
}

export default App