# Quiz Application Component

This is a custom HTML element that represents a quiz application. It manages the game state and handles the game logic.

## Features

- Fetches quiz questions from a given URL.
- Displays a countdown timer for each question.
- Submits the player's answer and fetches the next question.
- Handles the game over state, calculates the total time taken, and displays the highscore list.
- Allows the player to restart the game.

## Usage

First, import the component:

```javascript
import '../quiz-questions/questions.js'
import '../nickname/name-input.js'
import '../countdown/index.js'
import '../highscore/index.js'

<quiz-application></quiz-application>