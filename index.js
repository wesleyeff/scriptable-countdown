// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: calendar-alt;

/**
 * At the top of your script put the following code to run this widget
 *
 * const CountdownWidget = importModule('countdown')
 * new CountdownWidget().run()
 */
module.exports = class CountdownWidget {
  run() {
    let widget = this.deployWidget()

    if (!config.runsInWidget) {
      widget.presentLarge()
    }

    Script.setWidget(widget)
    Script.complete()
  }

  deployWidget() {
    const FONT_NAME = 'Menlo'
    const FONT_SIZE = 12

    let list = new ListWidget()

    list.backgroundColor = new Color('#151515')
    list.setPadding(15, 10, 15, 15)

    let events = [
      // Holidays
      {
        title: '🎆',
        month: 1,
        day: 1,
      },
      {
        title: '🦫',
        month: 2,
        day: 2,
      },
      {
        title: '💝',
        month: 2,
        day: 14,
      },
      {
        title: '🇺🇸🎆',
        month: 7,
        day: 4,
      },
      {
        title: '🎃',
        month: 10,
        day: 31,
      },
      {
        title: '🎄',
        month: 12,
        day: 25,
      },

      // Birthdays
      {
        title: 'Jesus 🎂',
        month: 4,
        day: 15,
      },
      {
        title: 'Santa 🎂',
        month: 12,
        day: 26,
      },
      {
        title: 'St P. 🎂',
        month: 3,
        day: 17,
      },

      // Yearly events
      //       {
      //         title: "🏊‍♂️",
      //         month: 5,
      //         day: 27,
      //       },

      // One-off events
      {
        title: 'Switch 2 🕹️',
        month: 6,
        day: 5,
        year: 2025,
      },
      {
        title: '6th grade 🎓',
        month: 5,
        day: 29,
        year: 2025,
      },
      {
        title: 'Superman 🍿',
        month: 7,
        day: 11,
        year: 2025,
      },
      {
        title: 'DK Bananza 🍌',
        month: 7,
        day: 17,
        year: 2025,
      },

      {
        title: 'Test January',
        month: 1,
        day: 3,
        year: 2026,
      },
      {
        title: 'Test February',
        month: 2,
        day: 21,
        year: 2026,
      },
    ]

    // Add some test data if not running in a widget
    if (!config.runsInWidget) {
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

      date.setFullYear(event.year || date.getFullYear())
      event.Date = date
      event.daysLeft = this.calculateDaysLeft(date)

      console.log(JSON.stringify(event, '', 2))
      console.log('\n\n\n')
    })

    events = events.filter((a) => a.daysLeft >= 0)

    // Sort ascending by the number of days left
    events.sort((a, b) => {
      return a.daysLeft > b.daysLeft
    })

    // Add events to the UI list
    events.forEach((event, i) => {
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

// new CountdownWidget().run();
