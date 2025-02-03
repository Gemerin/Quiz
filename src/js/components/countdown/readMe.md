# Countdown Timer Component

# Countdown Timer Web Component

This project is a custom HTML element that extends HTMLElement. It represents a countdown timer component in the application.

## Features

- Countdown timer with a default duration of 20 seconds.
- The duration can be customized using the 'duration' attribute.
- The timer starts automatically when the custom element is connected to the DOM.
- The timer can be reset to the value of the 'duration' attribute or to 20 if the attribute is not set.
- When the countdown reaches 0, a 'timesup' event is dispatched.

## Usage

To use this web component, include the following tag in your HTML:

```html
<countdown-timer duration="30"></countdown-timer>