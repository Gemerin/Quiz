/**
 * Count Down web component module.
 *
 * @author // Saskia Heinemann <sh224wg@student.lnu.se>
 * @version 1.1.0
 */
const timerTemplate = document.createElement('template')
timerTemplate.innerHTML = `
  <style>
    :host {
      display: block;
    }
    #timer{
      margin-top: 10px;
      font-size: 20px;
    }
  </style>
  <div id="timer"></div>  
  `

/**
 * `CountdownTimer` is a custom HTML element that extends HTMLElement.
 * It represents a countdown timer component in the application.
 */
class CountdownTimer extends HTMLElement {
  /**
   * #timer is a private property that holds the timer instance.
   *
   * @type {number|null}
   */
  #timer

  /**
   * #duration is a private property that holds the duration of the countdown in seconds.
   *
   * @type {number}
   */
  #duration

  /**
   * Constructs a new instance of the CountdownTimer component.
   * It attaches a shadow root, clones and appends the content of the timerTemplate to the shadow root,
   * and initializes the #duration property to 20 seconds and the #timer property to null.
   */
  constructor () {
    super()
    this.attachShadow({ mode: 'open' }).appendChild(timerTemplate.content.cloneNode(true))
    this.#duration = 20
    this.#timer = null
  }

  /**
   * Returns an array of attribute names to monitor for changes.
   * The 'duration' attribute is being observed for changes.
   *
   * @returns {Array} An array of attribute names.
   */
  static get observedAttributes () {
    return ['duration']
  }

  /**
   * Lifecycle callback that is invoked when the value of an observed attribute has changed.
   * If the name of the changed attribute is 'duration', it updates the #duration property with the new value and resets the timer.
   *
   * @param {string} name - The name of the attribute.
   * @param {string} newValue - The new value of the attribute.
   */
  attributeChangedCallback (name, newValue) {
    if (name === 'duration') {
      this.#duration = parseInt(newValue, 10)
      this.resetTimer()
    }
  }

  /**
   * Lifecycle callback that is invoked when the custom element is connected to the DOM.
   * If the timer is not already running, it sets the #duration property to the value of the 'duration' attribute or to 20 if the attribute is not set,
   * and starts the timer.
   */
  connectedCallback () {
    if (!this.#timer) {
      this.#duration = parseInt(this.getAttribute('duration'), 10) || 20
      this.startTimer()
    }
  }

  /**
   * Starts the countdown timer.
   * It sets the text content of the timer element to the #duration property and sets up an interval to update the timer every second.
   */
  startTimer () {
    this.shadowRoot.querySelector('#timer').textContent = this.#duration
    this.#timer = setInterval(() => {
      this.updateTimer()
    }, 1000)
  }

  /**
   * Updates the countdown timer.
   * It decreases the #duration property by 1, updates the text content of the timer element,
   * and if the #duration property is less than or equal to 0, it clears the interval and dispatches a 'timesup' event.
   */
  updateTimer () {
    this.#duration -= 1
    this.shadowRoot.querySelector('#timer').textContent = this.#duration
    if (this.#duration <= 0) {
      clearInterval(this.timer)
      this.dispatchEvent(new CustomEvent('timesup'))
    }
  }

  /**
   * Resets the countdown timer.
   * It clears the interval, sets the #duration property to the value of the 'duration' attribute or to 20 if the attribute is not set,
   * and starts the timer.
   */
  resetTimer () {
    clearInterval(this.timer)
    this.#duration = this.getAttribute('duration') || 20
    this.startTimer()
  }

  /**
   * Lifecycle callback that is invoked when the custom element is disconnected from the DOM.
   * It clears the interval, effectively stopping the timer.
   */
  disconnectedCallback () {
    clearInterval(this.#timer)
  }
}
customElements.define('countdown-timer', CountdownTimer)
