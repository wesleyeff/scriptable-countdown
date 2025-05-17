# Countdown

js script to use in the Scriptable ios app.

## Use

- Clone repo into your Scriptable folder in iCloud Drive.
- Events will be stored by default in an `events.json` file in the Scriptable dir. You can store them in a different file, just make sure you reference that file in every script.

- Widget
  - Create a script in scriptable with the following js:
    ```js
    const CountdownWidget = importModule('countdown/widget')
    new CountdownWidget({ config }).runStack()
    // new CountdownWidget({ config, eventPath: 'my-events.json' }).runStack() // custom json
    ```
- Manage Events Script
  - Create a script in scriptable with the following js:
    ```js
    const eventManager = importModule('countdown/event-manager')
    eventManager()
    // eventManager('my-events.json') // custom json
    ```
