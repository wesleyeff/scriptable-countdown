// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: calendar-alt;

/**
 * At the top of your script put the following code to run this widget
 *
 * const CountdownWidget = importModule('countdown')
 * new CountdownWidget(config).run()
 */

module.exports = class CountdownWidget {
  constructor({ config, events }) {
    this.config = config
    this.events = events
  }

  run() {
    let widget = this.deployWidget()

    if (!this.config.runsInWidget) {
      widget.presentLarge()
    }

    Script.setWidget(widget)
    Script.complete()
  }

  runStack() {
    let widget = this.deployStackWidget()

    if (!this.config.runsInWidget) {
      widget.presentSmall()
    }

    Script.setWidget(widget)
    Script.complete()
  }

  getEvents(maxItems) {
    let events = this.events

    let oneOffEvents = []
    let yearlyEvents = []

    // Add some test data if not running in a widget
    if (!this.config.runsInWidget) {
      let testToday = new Date(Date.now())
      let testTomorrow = new Date(Date.now())
      testTomorrow.setDate(testTomorrow.getDate() + 1)

      let testRed = new Date(Date.now())
      testRed.setDate(testRed.getDate() + 9)

      let testYellow = new Date(Date.now())
      testYellow.setDate(testYellow.getDate() + 29)

      events.push(
        {
          title: 'Test Today',
          month: testToday.getMonth() + 1,
          day: testToday.getDate(),
          year: testToday.getFullYear(),
        },
        {
          title: 'Test Tomorrow',
          month: testTomorrow.getMonth() + 1,
          day: testTomorrow.getDate(),
          year: testTomorrow.getFullYear(),
        },
        {
          title: 'Test Red',
          month: testRed.getMonth() + 1,
          day: testRed.getDate(),
          year: testRed.getFullYear(),
        },
        {
          title: 'Test Yellow',
          month: testYellow.getMonth() + 1,
          day: testYellow.getDate(),
        },
      )
    }

    // Create Date object in events list and calculate the number of days left
    events.forEach((event, i) => {
      console.log(`creating: ${event.title}`)

      let date = new Date(Date.now())

      date.setMonth(event.month - 1)
      date.setDate(event.day)

      if (event.year) {
        date.setFullYear(event.year)
        event.Date = date
        event.daysLeft = this.calculateDaysLeft(date)
        oneOffEvents.push(event)
      } else {
        date.setFullYear(date.getFullYear())
        event.Date = date
        event.daysLeft = this.calculateDaysLeft(date)
        if (event.daysLeft < 0) {
          date.setFullYear(date.getFullYear() + 1)
          event.Date = date
          event.daysLeft = this.calculateDaysLeft(date)
        }
        yearlyEvents.push(event)
      }

      console.log(JSON.stringify(event, '', 2))
      console.log('\n\n\n')
    })
    oneOffEvents = oneOffEvents
      .filter((a) => a.daysLeft >= 0)
      .sort((a, b) => a.daysLeft > b.daysLeft)
    yearlyEvents = yearlyEvents
      .filter((a) => a.daysLeft >= 0)
      .sort((a, b) => a.daysLeft > b.daysLeft)

    // Combine the one-off and yearly events
    events = oneOffEvents.concat(yearlyEvents)

    // Sort ascending by the number of days left
    events = events.slice(0, maxItems).sort((a, b) => {
      return a.daysLeft > b.daysLeft
    })

    return events
  }

  deployWidget() {
    const FONT_NAME = 'Menlo'
    const FONT_SIZE = 12

    let list = new ListWidget()

    list.backgroundColor = new Color('#151515')
    list.setPadding(5, 10, 5, 5)

    const linesPerWidgetSize = {
      small: 10,
      medium: 10,
      large: 24,
      extraLarge: 24,
    }
    const numItems = linesPerWidgetSize[this.config.widgetFamily] || 15

    let events = this.getEvents(numItems)

    const numItemsToShow = Math.min(events.length, numItems)

    // Add events to the UI list
    events.slice(0, numItemsToShow).forEach((event, i) => {
      let days = `${event.daysLeft}`

      if (event.daysLeft === 0) {
        days = 'Today!'
      }

      let daysLeftTxt = list.addText(`${event.title}: ${days}`)
      daysLeftTxt.textColor = this.decideDisplayColor(event.daysLeft)
      daysLeftTxt.font = new Font(FONT_NAME, FONT_SIZE)

      //       Font.lightMonospacedSystemFont(12);
    })

    return list
  }

  deployStackWidget() {
    const FONT_NAME = 'Menlo'
    const FONT_SIZE = 12

    let widget = new ListWidget()

    widget.backgroundColor = new Color('#151515')
    widget.setPadding(5, 10, 5, 5)

    let rootStack = widget.addStack()
    rootStack.layoutVertically()

    const linesPerWidgetSize = {
      small: 9,
      medium: 9,
      large: 18,
      extraLarge: 18,
    }
    const numItems = linesPerWidgetSize[this.config.widgetFamily] || 9
    let events = this.getEvents(numItems)

    events.slice(0, numItems).forEach((event, i) => {
      let days = `${event.daysLeft}`

      if (event.daysLeft === 0) {
        days = 'Today!'
      }

      let row = rootStack.addStack()
      let labelText = row.addText(`${event.title}:`)
      labelText.textColor = this.decideDisplayColor(event.daysLeft)
      labelText.font = new Font(FONT_NAME, FONT_SIZE)

      row.addSpacer()
      let countText = row.addText(days)
      countText.textColor = this.decideDisplayColor(event.daysLeft)
      countText.font = new Font(FONT_NAME, FONT_SIZE)
    })

    return widget
  }

  calculateDaysLeft(future) {
    let today = new Date(Date.now())

    let hasEndDate = today.getFullYear() < future.getFullYear()
    let dateHasPassed = false //(today.getMonth() >= future.getMonth() || (today.getMonth() === future.getMonth() && today.getDay() > future.getDay()));

    console.log(`hasEndDate: ${hasEndDate}`)
    console.log(`dateHasPassed: ${dateHasPassed}`)

    // Set the correct year if we've passed it
    // TODO: refoctor how we are setting the year
    if (!hasEndDate && dateHasPassed) {
      let nextYear = future.getFullYear()
      nextYear = nextYear + 1
      future.setFullYear(nextYear)
    }

    future = future.getTime()
    today = today.getTime()

    let difference = future - today
    let convertInDays = 24 * 3600 * 1000

    return Math.round(difference / convertInDays)
  }

  decideDisplayColor(daysLeft) {
    if (!daysLeft) {
      return Color.green()
    }

    if (daysLeft < 10) {
      return Color.red()
    }

    if (daysLeft < 30) {
      return Color.yellow()
    }

    return Color.white()
  }
}
