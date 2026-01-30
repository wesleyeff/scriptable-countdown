const fm = importModule('countdown/file-manager')
const createEvent = importModule('countdown/create-event')

module.exports = async function (eventsPath = 'events.json') {
  console.log('Manage Events')
  let savedEvents = await fm.readEvents(eventsPath)

  // Create a new UITable
  const table = new UITable()
  let eventRows = []

  // Create single button at top
  const addEventRow = new UITableRow()
  addEventRow.backgroundColor = new Color('#6fb77b')
  addEventRow.dismissOnSelect = false
  const addCell = addEventRow.addText('New Event')
  addCell.centerAligned()
  addEventRow.onSelect = async () => {
    const newEvent = await createEvent(eventsPath)
    savedEvents.push(newEvent)
    refreshEventsTable()
  }
  table.addRow(addEventRow)

  // Header row
  const headerRow = new UITableRow()
  headerRow.isHeader = true
  const titleHeader = UITableCell.text('Title')
  const dateHeader = UITableCell.text('Date')
  const recurHeader = UITableCell.text('↻')

  titleHeader.widthWeight = 2
  dateHeader.widthWeight = 1
  recurHeader.widthWeight = 0.5

  dateHeader.centerAligned()
  recurHeader.centerAligned()

  headerRow.addCell(titleHeader)
  headerRow.addCell(dateHeader)
  headerRow.addCell(recurHeader)
  table.addRow(headerRow)

  // Add row function
  function addRow(event) {
    const r = new UITableRow()
    // Visual cue for past, non-recurring events
    // (subtle background to indicate completion)
    // background remains default for recurring/upcoming
    table.addRow(r)
    eventRows.push(r)
    r.dismissOnSelect = false
    const titleCell = UITableCell.text(
      event.pinned ? `📌 ${event.title}` : event.title,
    )
    const dateCell = UITableCell.text(`${event.month}/${event.day}`)
    const recurCell = UITableCell.text(!event.year ? '↻' : '')

    titleCell.widthWeight = 2
    dateCell.widthWeight = 1
    recurCell.widthWeight = 0.5
    // Combine actions via row tap menu (Edit/Delete/Cancel)
    r.onSelect = async () => {
      const editAlert = new Alert()
      editAlert.title = 'Edit Event'
      editAlert.addAction('Save')
      editAlert.addAction(event.pinned ? 'Unpin' : 'Pin')
      editAlert.addDestructiveAction('Delete')
      editAlert.addCancelAction('Cancel')
      editAlert.addTextField('Title', event.title)
      editAlert.addTextField('Month', `${event.month}`)
      editAlert.addTextField('Day', `${event.day}`)
      editAlert.addTextField(
        'Year (optional)',
        event.year ? `${event.year}` : '',
      )

      const choice = await editAlert.present()
      // Save
      if (choice === 0) {
        const updated = {
          title: editAlert.textFieldValue(0),
          month: parseInt(editAlert.textFieldValue(1)),
          day: parseInt(editAlert.textFieldValue(2)),
          year: parseInt(editAlert.textFieldValue(3)),
          pinned: event.pinned || false,
        }
        if (updated.title && updated.month && updated.day) {
          const idx = savedEvents.findIndex(
            (e) =>
              e.title === event.title &&
              e.month === event.month &&
              e.day === event.day &&
              e.year === event.year,
          )
          if (idx !== -1) {
            savedEvents[idx] = updated
            await fm.writeEvents(savedEvents, eventsPath)
            refreshEventsTable()
          }
        }
      }
      // Pin/Unpin
      else if (choice === 1) {
        const idx = savedEvents.findIndex(
          (e) =>
            e.title === event.title &&
            e.month === event.month &&
            e.day === event.day &&
            e.year === event.year,
        )
        if (idx !== -1) {
          const current = savedEvents[idx]
          savedEvents[idx] = { ...current, pinned: !current.pinned }
          await fm.writeEvents(savedEvents, eventsPath)
          refreshEventsTable()
        }
      }
      // Delete
      else if (choice === 2) {
        const confirm = new Alert()
        confirm.title = 'Delete Event'
        confirm.message = `${event.title} - ${event.month}/${event.day}`
        // Make confirm delete destructive (red)
        confirm.addDestructiveAction('Delete')
        confirm.addCancelAction('Cancel')
        const res = await confirm.present()
        if (res >= 0) {
          const index = savedEvents.findIndex(
            (e) =>
              e.title === event.title &&
              e.month === event.month &&
              e.day === event.day,
          )
          if (index !== -1) {
            savedEvents.splice(index, 1)
            await fm.writeEvents(savedEvents, eventsPath)
            refreshEventsTable()
          }
        }
      }
    }

    dateCell.centerAligned()
    recurCell.centerAligned()

    // Shade past non-recurring rows
    if (event.year && isPast(event)) {
      r.backgroundColor = new Color('#ffecec')
    }

    r.addCell(titleCell)
    r.addCell(dateCell)
    r.addCell(recurCell)
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

  function refreshEventsTable() {
    // Remove existing event rows
    eventRows.forEach((row) => table.removeRow(row))
    eventRows = []
    // Resort using the same comparator
    savedEvents.sort((a, b) => {
      const aRecurring = !a.year
      const bRecurring = !b.year
      if (aRecurring !== bRecurring) return aRecurring ? -1 : 1
      return nextDate(a) - nextDate(b)
    })
    // Rebuild rows
    savedEvents.forEach(addRow)
    table.reload()
  }
  table.present()
}
