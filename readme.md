# Countdown

js script to use in the Scriptable ios app.

## Use

- Clone repo into your Scriptable folder in iCloud Drive.
- Create `events.js` file in the countdown dir.
  ```js
  module.exports = [
    // Holidays/Birthdays (recurring, no year)
    {
      title: '🎆',
      month: 1,
      day: 1,
    },
    {
      title: '🎄',
      month: 12,
      day: 25,
    },
    {
      title: 'Joe 🎂',
      month: 6,
      day: 6,
    },
    // One-off events (including year)
    {
      title: 'Switch 2 🕹️',
      month: 6,
      day: 5,
      year: 2025,
    },
  ]
  ```
- Create a script in scriptable with the following js:
  ```js
  const CountdownWidget = importModule('countdown')
  const events = importModule('countdown/events')
  new CountdownWidget({ config, events }).run()
  ```
