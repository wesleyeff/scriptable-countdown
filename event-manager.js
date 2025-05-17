const fm = importModule('countdown/file-manager')

module.exports = async function (eventsPath = 'events.json') {
  console.log('Manage Events')
  let savedEvents = await fm.readEvents(eventsPath)

  const table = new UITable()
  savedEvents.forEach((event) => {
    const r = new UITableRow()
    table.addRow(r)
    r.addCell(UITableCell.text(event.title))
    r.addCell(UITableCell.text(`${event.month}/${event.day}`))
    r.addCell(UITableCell.text(event.year ? '' : 'recurring'))

    const cell = UITableCell.button('delete')
    cell.rightAligned()

    cell.onTap = async () => {
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
    r.addCell(cell)
  })

  table.present()
}
