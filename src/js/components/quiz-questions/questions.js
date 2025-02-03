/**
 * The question web component module.
 *
 * @author // Saskia Heinemann <sh224wg@student.lnu.se>
 * @version 1.1.0
 */
const quizQuestionsTemplate = document.createElement('template')
quizQuestionsTemplate.innerHTML = `
  <style>
    .hidden {
    display: none;
    }
    button {
      margin-top: 10px;
      align-self: center;
    }
    input[type="radio"] {
  margin-right: 10px;
  flex-wrap: wrap;
  margin: 5px;
}
  </style>
  <div>
  <!-- questions inserted here -->
    <p id="question"></p>
    <form>
      <!-- Answers inserted here -->
    <div id="answersForm">
      <input type="text" id="answerInput" placeholder="Type your answer...">
    </div>
      <button type="submit" id="submitAnswer">Submit Answer</button>
    </form>
  </div>
`

/**
 * `QuizQuestions` is a custom HTML element that extends HTMLElement.
 * It represents a component for displaying quiz questions in the application.
 */
class QuizQuestions extends HTMLElement {
  /**
   * Constructs a new instance of the QuizQuestions component.
   * It attaches a shadow root and initializes the currentQuestion property to null.
   */
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.currentQuestion = null
  }

  /**
   * Lifecycle method that is called when the custom element is connected to the DOM.
   * Render displays the component and the addEventListeners method sets up event listeners.
   */
  connectedCallback () {
    this.render()
    this.addEventListeners()
  }

  /**
   * Renders the QuizQuestions component.
   * It clones the content of the quizQuestionsTemplate, clears the existing content in the shadow root,
   * and appends the cloned template content to the shadow root.
   */
  render () {
    const templateContent = quizQuestionsTemplate.content.cloneNode(true)
    this.shadowRoot.innerHTML = ''
    this.shadowRoot.appendChild(templateContent)
  }

  /**
   * Generates the answer options for the current question.
   * If the question type is 'multiple-choice', it creates radio buttons for each alternative.
   * If the question type is 'text', it creates a text input field for the answer.
   */
  generateAnswerOptions () {
    const answersForm = this.shadowRoot.getElementById('answersForm')

    if (this.currentQuestion.type === 'multiple-choice') {
      answersForm.innerHTML = `
      ${Object.keys(this.currentQuestion.alternatives)
          .map(
            (answer, index) => `
            <div>
              <input type="radio" name="answer" id="answer${index + 1}" value="${answer}">
              <label for="answer${index + 1}">${this.currentQuestion.alternatives[answer]}</label><br>
            </div>
          `
          )
          .join('')}
    `
    } else if (this.currentQuestion.type === 'text') {
      answersForm.innerHTML = `
      <input type="text" id="answerInput" placeholder="Type your answer...">
    `
    }
  }

  /**
   * Adds event listeners to the QuizQuestions component.
   * It sets up a 'submit' event listener on the form.
   */
  addEventListeners () {
    const answersForm = this.shadowRoot.getElementById('answersForm')

    this.shadowRoot.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault()

      const answerInput = this.shadowRoot.getElementById('answerInput')
      if (this.currentQuestion.type === 'multiple-choice') {
        const selectedAnswer = answersForm.querySelector('input[name="answer"]:checked')
        if (selectedAnswer) {
          this.dispatchEvent(new CustomEvent('submitAnswer', {
            detail: { answer: selectedAnswer.value }
          }))
        }
      } else if (this.currentQuestion.type === 'text') {
        const trimmedAnswer = answerInput.value.trim()
        if (trimmedAnswer !== ' ') {
          this.dispatchEvent(new CustomEvent('submitAnswer', {
            detail: { answer: trimmedAnswer }
          }))
        }
      }
    })
  }

  /**
   * Toggles the visibility of the answers form and the submit button.
   */
  toggleVisibility () {
    const submitButton = this.shadowRoot.getElementById('submitAnswer')
    const answersForm = this.shadowRoot.getElementById('answersForm')

    if (answersForm.classList.contains('hidden')) {
      answersForm.classList.remove('hidden')
      submitButton.classList.remove('hidden')
    } else {
      answersForm.classList.add('hidden')
    }
  }

  /**
   * Displays a question in the QuizQuestions component.
   * It sets the currentQuestion property to the given question data and calls the updateQuestion method.
   *
   * @param {object} questionData - The data of the question to display.
   */
  displayQuestion (questionData) {
    this.currentQuestion = questionData
    this.updateQuestion()

    const answerInput = this.shadowRoot.getElementById('answerInput')
    if (answerInput) {
      answerInput.focus()
    }
  }

  /**
   * Updates the displayed question in the QuizQuestions component.
   * If there is a current question, it sets the text content of the question element to the question text,
   * and calls the generateAnswerOptions method to generate the answer options for the current question.
   */
  updateQuestion () {
    const questionElement = this.shadowRoot.getElementById('question')

    if (this.currentQuestion) {
      questionElement.textContent = this.currentQuestion.question || ''
      this.generateAnswerOptions()
    }
  }
}

customElements.define('quiz-questions', QuizQuestions)
