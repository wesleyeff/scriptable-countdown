const fm = importModule('countdown/file-manager')

module.exports = async (eventsPath = 'events.json') => {
  console.log('Create Event')
  const savedEvents = await fm.readEvents(eventsPath)

  const alert = new Alert()
  alert.title = 'Create Event'
  alert.message = 'Event created successfully!'
  alert.addAction('OK')
  alert.addCancelAction('Cancel')
  alert.addTextField('Title')
  const month = new Date().getMonth() + 1
  alert.addTextField('Month', `${month}`)
  alert.addTextField('Day', `${new Date().getDate()}`)
  alert.addTextField('Year (optional)')

  await alert.present()

  const titleRes = alert.textFieldValue(0)
  const monthRes = parseInt(alert.textFieldValue(1))
  const dayRes = parseInt(alert.textFieldValue(2))
  const yearRes = parseInt(alert.textFieldValue(3))

  const newEvent = {
    title: titleRes,
    month: monthRes,
    day: dayRes,
    year: yearRes,
  }
  if (titleRes && monthRes && dayRes) {
    savedEvents.push(newEvent)

    await fm.writeEvents(savedEvents, eventsPath)

    return newEvent
  }
}
