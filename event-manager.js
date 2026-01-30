const fm = importModule('countdown/file-manager')
const createEvent = importModule('countdown/create-event')

module.exports = async function (eventsPath = 'events.json') {
  console.log('Manage Events')
  let savedEvents = await fm.readEvents(eventsPath)

  // Create a new UITable
  const table = new UITable()

  // Create single button at top
  const addEventRow = new UITableRow()
  addEventRow.backgroundColor = new Color('#6fb77b')
  addEventRow.dismissOnSelect = false
  const addCell = addEventRow.addText('New Event')
  addCell.centerAligned()
  addEventRow.onSelect = async () => {
    const newEvent = await createEvent(eventsPath)
    savedEvents.push(newEvent)
    addRow(newEvent)
    table.reload()
  }
  table.addRow(addEventRow)

  // Header row
  const headerRow = new UITableRow()
  headerRow.isHeader = true
  const titleHeader = UITableCell.text('Title')
  const dateHeader = UITableCell.text('Date')
  const recurHeader = UITableCell.text('↻')
  const actionHeader = UITableCell.text('Action')

  titleHeader.widthWeight = 2
  dateHeader.widthWeight = 1
  recurHeader.widthWeight = 0.5
  actionHeader.widthWeight = 1

  dateHeader.centerAligned()
  recurHeader.centerAligned()
  actionHeader.rightAligned()

  headerRow.addCell(titleHeader)
  headerRow.addCell(dateHeader)
  headerRow.addCell(recurHeader)
  headerRow.addCell(actionHeader)
  table.addRow(headerRow)

  // Add row function
  function addRow(event) {
    const r = new UITableRow()
    // Visual cue for past, non-recurring events
    // (subtle background to indicate completion)
    // background remains default for recurring/upcoming
    table.addRow(r)
    const titleCell = UITableCell.text(event.title)
    const dateCell = UITableCell.text(`${event.month}/${event.day}`)
    const recurCell = UITableCell.text(!event.year ? '↻' : '')
    const deleteCell = UITableCell.button('delete')
    deleteCell.rightAligned()

    titleCell.widthWeight = 2
    dateCell.widthWeight = 1
    recurCell.widthWeight = 0.5
    deleteCell.widthWeight = 1

    dateCell.centerAligned()
    recurCell.centerAligned()

    // Shade past non-recurring rows
    if (event.year && isPast(event)) {
      r.backgroundColor = new Color('#ffecec')
    }

    deleteCell.onTap = async () => {
      const alert = new Alert()
      alert.title = 'Event Details'
      alert.message = `${event.title} - ${event.month}/${event.day}`
      alert.addAction('Delete')
      alert.addCancelAction('Cancel')
      const alertResult = await alert.present()

      if (alertResult >= 0) {
        // User tapped "Delete"

        // Find the index of the event in savedEvents
        const index = savedEvents.findIndex(
          (e) =>
            e.title === event.title &&
            e.month === event.month &&
            e.day === event.day,
        )

        // Remove the event if found
        if (index !== -1) {
          savedEvents.splice(index, 1)
          // Save the updated events
          await fm.writeEvents(savedEvents, eventsPath)
          // Refresh the table
          table.removeRow(r)
          table.reload()
        }
      }
    }
    r.addCell(titleCell)
    r.addCell(dateCell)
    r.addCell(recurCell)
    r.addCell(deleteCell)
  }
  function isPast(event) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    if (!event.year) return false
    const date = new Date(event.year, event.month - 1, event.day)
    return date < today
  }

  // set up rows for events
  // Sort events by next occurrence date (handles recurring)
  function nextDate(event) {
    const now = new Date()
    if (event.year) {
      return new Date(event.year, event.month - 1, event.day)
    }
    const thisYearDate = new Date(now.getFullYear(), event.month - 1, event.day)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return thisYearDate < today
      ? new Date(now.getFullYear() + 1, event.month - 1, event.day)
      : thisYearDate
  }
  // Put recurring (no year) events at the top, then by next date
  savedEvents
    .sort((a, b) => {
      const aRecurring = !a.year
      const bRecurring = !b.year
      if (aRecurring !== bRecurring) return aRecurring ? -1 : 1
      return nextDate(a) - nextDate(b)
    })
    .forEach(addRow)

  table.present()
}
