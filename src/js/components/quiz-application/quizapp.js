import '../quiz-questions/questions.js'
import '../nickname/name-input.js'
import '../countdown/index.js'
import '../highscore/index.js'

/**
 * The Quiz Application web component module.
 *
 * @author // Saskia Heinemann <sh224wg@student.lnu.se>
 * @version 1.1.0
 */

const template = document.createElement('template')
template.innerHTML = `
  <div>
    <name-input class="nameInput"></name-input>
  </div>
`

/**
 * `QuizApplication` is a custom HTML element that extends HTMLElement.
 * It represents a quiz application with various properties to manage the game state.
 *
 */
class QuizApplication extends HTMLElement {
  /**
   * @private
   * @type {Function}
   * A bound function that handles the game over state.
   */

  #boundGameOver
  /**
   * @private
   * @type {number}
   * The start time of the quiz.
   */

  #startTime
  /**
   * @private
   * @type {string}
   * The name of the player.
   */
  #playerName

  /**
   * @private
   * @type {boolean}
   * A flag indicating whether all questions have been answered.
   * Defaults to false.
   */
  #allQuestionsAnswered = false

  /**
   * @public
   * @type {boolean}
   * A flag indicating whether the game is over.
   * Defaults to false.
   */
  gameOver = false

  /**
   * @private
   * @type {boolean}
   * A flag indicating whether the last answer was correct.
   * Defaults to false.
   */
  #correctAnswer = false

  /**
   * Constructs a new instance of the QuizApplication component.
   * It attaches a shadow root, sets the initial URL for the quiz questions,
   * clones and appends the content of the template, and initializes the
   * #allQuestionsAnswered flag to false.
   */
  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    this.currentURL = 'https://courselab.lnu.se/quiz/question/1'
    this.shadow.appendChild(template.content.cloneNode(true))
    this.#allQuestionsAnswered = false
  }

  /**
   * Lifecycle method that is called when the custom element is connected to the DOM.
   * When the 'submitAndStart' event is triggered, it initializes the game with the player's name and removes the name input field.
   * When the 'playAgain' event is triggered, it restarts the game.
   * It also creates a new highscore list component, initially hidden, and appends it to the shadow root.
   */
  connectedCallback () {
    const nameInput = this.shadowRoot.querySelector('name-input')
    nameInput.addEventListener('submitAndStart', (event) => {
      this.init(event.detail.playerName)
      nameInput.remove()
    })
    const highscoreList = document.createElement('highscore-list')
    highscoreList.style.display = 'none'
    this.shadowRoot.appendChild(highscoreList)

    highscoreList.addEventListener('playAgain', () => {
      this.restartGame()
    })
  }

  /**
   * Initializes the quiz application with the given player's name.
   * It sets the start time for score calculation, removes the name input field if it exists,
   * creates a new quiz questions component with a 'submitAnswer' event listener,
   * and fetches the first question.
   *
   * @param {string} playerName - The name of the player.
   */
  async init (playerName) {
    this.#startTime = Date.now() / 1000
    this.#playerName = playerName

    const nameInput = this.shadowRoot.querySelector('name-input')
    if (nameInput) {
      nameInput.remove()
    }
    const quizQuestion = document.createElement('quiz-questions')
    quizQuestion.addEventListener('submitAnswer', (event) => this.submitAnswer(event.detail.answer))
    this.shadowRoot.appendChild(quizQuestion)
    const firstQuestionURL = 'https://courselab.lnu.se/quiz/question/1'
    await this.fetchQuestion(firstQuestionURL)
  }

  /**
   * Fetches a quiz question from the given URL and displays it.
   * It also creates a countdown timer with a duration based on the question's limit.
   * If the timer reaches zero before all questions are answered, it triggers the game over state.
   *
   * @param {string} url - The URL to fetch the question from.
   * @throws {Error} If the network response is not ok.
   */
  async fetchQuestion (url) {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Network response not viable.')
    }
    const data = await response.json()

    const questionData = {
      question: data.question
    }
    if (data.alternatives) {
      questionData.type = 'multiple-choice'
      questionData.alternatives = data.alternatives
    } else {
      questionData.type = 'text'
    }
    this.shadowRoot.querySelector('quiz-questions').displayQuestion(questionData)

    const timer = document.createElement('countdown-timer')
    let limit = 20
    if (data.limit) {
      limit = data.limit
    }
    timer.setAttribute('duration', limit)

    /**
     * Sets up an event listener for the 'timesup' event on the timer.
     * When the timer reaches zero, it checks if all questions have been answered.
     * If not, it triggers the game over state by calling the #gameOver method.
     */
    timer.addEventListener('timesup', this.#boundGameOver = () => {
      if (!this.#allQuestionsAnswered) {
        this.#gameOver()
      }
    })
    this.shadowRoot.appendChild(timer)
    this.nextURL = data.nextURL
  }

  /**
   * Submits the player's answer to the current question.
   * It removes the 'timesup' event listener and the timer, then sends a POST request with the answer.
   * If the response is ok, it sets #correctAnswer to true.
   * If there is no next question URL in the response, it sets #allQuestionsAnswered to true and triggers the game over state if the last answer was correct.
   *
   * @param {string} answer - The player's answer to the current question.
   * @throws {Error} If the network response is not ok and the status is not 400.
   */
  async submitAnswer (answer) {
    const timer = this.shadowRoot.querySelector('countdown-timer')
    timer.removeEventListener('timesup', this.#boundGameOver)
    timer.remove()

    const response = await fetch(this.nextURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ answer })
    })
    if (!response.ok) {
      if (response.status === 400) {
        alert('Wrong answer, try again!')
        this.#correctAnswer = false
        this.#gameOver()
      } else {
        throw new Error('Network response not viable.')
      }
    } else {
      this.#correctAnswer = true
    }
    const data = await response.json()
    if (!data.nextURL) {
      this.#allQuestionsAnswered = true
      if (this.#allQuestionsAnswered && this.#correctAnswer) {
        this.#gameOver()
      }
    } else {
      await this.fetchQuestion(data.nextURL)
    }
  }

  /**
   * Handles the game over state.
   * It removes the current question and the timer, calculates the total time taken to answer all questions.
   * It sets the gameOver flag to true and ensures the highscore list is displayed.
   */
  #gameOver () {
    if (this.shadowRoot.querySelector('quiz-questions')) {
      this.shadowRoot.querySelector('quiz-questions').remove()
    }
    const timer = this.shadowRoot.querySelector('countdown-timer')
    if (timer) {
      timer.removeEventListener('timesup', this.#boundGameOver)
      timer.remove()
    }

    const totalTime = ((Date.now() / 1000) - this.#startTime).toFixed(2)

    if (this.#allQuestionsAnswered && !this.gameOver && this.#correctAnswer) {
      const highscoreList = this.shadowRoot.querySelector('highscore-list')
      if (highscoreList) {
        highscoreList.addHighScore(this.#playerName, totalTime)
        highscoreList.style.display = 'block'
      }
    }
    this.gameOver = true

    const highscoreList = this.shadowRoot.querySelector('highscore-list')
    if (highscoreList) {
      highscoreList.style.display = 'block'
    }
  }

  /**
   * Restarts the game.
   * It removes the quiz-questions, name-input, and countdown-timer components from the shadow root.
   * It resets the #allQuestionsAnswered, gameOver, and #correctAnswer variables.
   * It creates a new name-input component and sets up an event listener for the 'submitAndStart' event.
   */
  restartGame () {
    const oldQuizQuestion = this.shadowRoot.querySelector('quiz-questions')
    const oldNameInput = this.shadowRoot.querySelector('name-input')
    const oldTimer = this.shadowRoot.querySelector('countdown-timer')
    if (oldQuizQuestion) oldQuizQuestion.remove()
    if (oldNameInput) oldNameInput.remove()
    if (oldTimer) oldTimer.remove()

    this.#allQuestionsAnswered = false
    this.gameOver = false
    this.#correctAnswer = false

    const nameInput = document.createElement('name-input')
    nameInput.addEventListener('submitAndStart', (event) => {
      this.init(event.detail.playerName)
      nameInput.remove()
    })
    this.shadowRoot.appendChild(nameInput)

    const highscoreList = this.shadowRoot.querySelector('highscore-list')
    if (highscoreList) {
      highscoreList.style.display = 'none'
    }
  }
}
customElements.define('quiz-application', QuizApplication)
