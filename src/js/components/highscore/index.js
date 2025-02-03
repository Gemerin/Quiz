/**
 * The High Score web component module.
 *
 * @author // Saskia Heinemann <sh224wg@student.lnu.se>
 * @version 1.1.0
 */
const highscoreTemplate = document.createElement('template')
highscoreTemplate.innerHTML = `
<style>
    ol{
        list-style-type: none;
        margin-right:20px;
        display: inline-block;
        text-align: left
    }
</style>
<div>
    <h2>Highscore</h2>
    <ol id="highscoreList">
    </ol>
    </div>
    <button type="button" id="playAgain">Play again</button>
`
/**
 *`HighScore` is a custom HTML element that represents a high score list.
 *
 * @class
 * @augments HTMLElement
 */
class HighScore extends HTMLElement {
  /**
   * A private property that holds the list of high scores.
   *
   * @type {Array}
   * @private
   */
  #highscoreList

  /**
   * A private property that holds a bound event handler for the 'newHighScore' event.
   *
   * @type {Function}
   * @private
   */
  #boundNewHighScore

  /**
   * Constructs a new `HighScore` instance.
   */
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(highscoreTemplate.content.cloneNode(true))
    this.#highscoreList = this.shadowRoot.querySelector('#highscoreList')
  }

  /**
   * A lifecycle callback that is called when this element is inserted into the DOM.
   *
   * This method sets up event listeners for the 'newHighScore' event on the document
   * and the 'click' event on the 'playAgain' button.
   */
  connectedCallback () {
    /**
     *
     * @param {Event} event - The 'newHighScore' event. The detail are 'playerName' and 'totalTime'.
     */
    this.addEventListener('newHighScore', (event) => {
      const { playerName, totalTime } = event.detail
      this.addHighScore(playerName, totalTime)
    })
    const playAgainButton = this.shadowRoot.getElementById('playAgain')
    playAgainButton.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('playAgain', {
        bubbles: true
      }))
    })
    this.render()
  }

  /**
   * A method that renders the high score list.
   * For each high score, it creates a new list item and appends it to the list.
   *
   */
  render () {
    this.#highscoreList.innerHTML = ''

    const highScore = this.getHighScore()

    highScore.forEach((score, index) => {
      const listItem = document.createElement('li')
      listItem.textContent = `${index + 1}. ${score.name} - ${score.time} seconds`
      this.#highscoreList.appendChild(listItem)
    })
  }

  /**
   * Returns the highscore list from localstorage.
   *
   * @returns {object[]} An array of high scores. Each high score is an object with a 'name'
   * property and a 'time' property.
   */
  getHighScore () {
    const storeHighScore = localStorage.getItem('highscores')
    return storeHighScore ? JSON.parse(storeHighScore) : []
  }

  /**
   * A method that stores the high score list in local storage.
   *
   * @param {object[]} scores - An array of high scores. Each high score is an object with a
   * 'name' property and a 'time' property.
   */
  storeHighScore (scores) {
    localStorage.setItem('highscores', JSON.stringify(scores))
  }

  /**
   * Updates the highscore list with a new score.
   *
   * @param {string} playerName - The name of the player.
   * @param {number} totalTime - The total time of the player.
   */
  addHighScore (playerName, totalTime) {
    const highScores = this.getHighScore()
    highScores.push({ name: playerName, time: totalTime })

    highScores.sort((a, b) => a.time - b.time)
    const trimmedScores = highScores.slice(0, 5)
    this.storeHighScore(trimmedScores)
    this.render()
  }

  /**
   * A lifecycle callback that is called when this element is removed from the DOM.
   *
   */
  disconnectedCallback () {
    this.removeEventListener('newHighScore', this.#boundNewHighScore)
  }
}
customElements.define('highscore-list', HighScore)
