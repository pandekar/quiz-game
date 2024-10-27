import {
  FETCHING,
  FETCHING_DONE,
  fetchQuestions
} from './api.js';
import { shuffleArray, decodeHTML, isStorageExist } from './utils.js';
import {
  SELECT_ANSWER,
  CHECK_ANSWER,
  _createAnswerButtonElement,
  _createLabelAnswerElement,
  _createRadioButtonAnswerElement
} from './ui.js';

const quizContainer = document.getElementById('quiz-container');
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const startBtn = document.getElementById('start-btn');
const timerEl = document.getElementById('time-value');
const scoreEl = document.getElementById('score-value');
const difficultySelector = document.getElementById('difficulty');
const recentGamesListEl = document.getElementById('recent-games');
const recentGamesContainer = document.getElementById('recent-games-container');
const loadingTextEl = document.getElementById('loading-text');

// Game state variables
const defaultTime = 30;
let currentQuestion = 0;
let score = 0;
let timer = null;
let timeLeft = defaultTime; // in seconds
let questions = [];
let answerSelected = null;
let gameHistories = [];
const SUBMIT_ANSWER = 'SUBMIT_ANSWER';
const STORAGE_KEY = 'QUIZ-GAME';

const _renderRecentMatches = () => {
  recentGamesListEl.innerHTML = gameHistories
    .map((record, index) => {
      const {
        dateTime,
        difficulty,
        timeSpent,
        score
      } = record;
      const dateObj = new Date(dateTime);

      return `
        <tr id='${dateTime}'>
          <th scope='row'>${index + 1}</th>
          <td>${dateObj.toDateString()}</td>
          <td>${dateObj.toLocaleTimeString()}</td>
          <td>${difficulty}</td>
          <td>${timeSpent}</td>
          <td>${score}</td>
        </tr>
      `
    })
    .join('');
};

const _loadExistingData = () => {
  const parsedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (parsedData !== null) {
      recentGamesContainer.removeAttribute('style');
      for (const i in parsedData) {
        gameHistories.push(parsedData[i])
      }

      _renderRecentMatches();
    } else {
      recentGamesContainer.style.display = 'none';  
    }
};

export function initQuizGame() {
  startBtn.addEventListener('click', startQuiz);

  // render game history
  if (isStorageExist()) {
    _loadExistingData();
  }
};

export async function startQuiz() {
  try {
    recentGamesContainer.style.display = 'none';
    answersEl.innerHTML = '';
    answersEl.removeAttribute('style');

    startBtn.style.display = 'none';
    difficultySelector.disabled = true;
    quizContainer.style.display = 'block';
    score = 0;
    scoreEl.textContent = score;
    currentQuestion = 0;
    timeLeft = 30;
    timerEl.textContent = timeLeft;

    const difficulty = difficultySelector.value;
    questions = await fetchQuestions(difficulty);
    showQuestion(questions[currentQuestion]);
    startTimer();
  } catch (error) {
    console.error('Error starting quiz:', error);
    quizContainer.innerHTML = '<p>Error loading quiz. Please try again.</p>';
  }
};

/**
 * showQuestion
 * 1. Set the question text
 * 2. Clear previous answer buttons
 * 3. Create and append new answer buttons
 * @param {Object} questionData 
 */
export function showQuestion(questionData) {
  questionEl.innerText = decodeHTML(questionData.question);
  const answers = [questionData.correct_answer, ...questionData.incorrect_answers];
  shuffleArray(answers);
  
  const formAnswerElement = document.createElement('form');
  const formId = `quiz-form-${currentQuestion}`;
  formAnswerElement.id = formId
  const formAnswerRadioButtonSectionElement = document.createElement('fieldset');
  const formAnswerButtonSectionElement = document.createElement('div');
  
  const decodedCorrectAnswer = decodeHTML(questionData.correct_answer);
  const formAnswerButtonElement = _createAnswerButtonElement(formId, decodedCorrectAnswer);
  formAnswerButtonSectionElement.appendChild(formAnswerButtonElement);

  for (const index in answers) {
    const answer = decodeHTML(answers[index]);
    const radioButtonAnswerElement = _createRadioButtonAnswerElement(answer, index);
    const labelAnswerElement = _createLabelAnswerElement(answer, index);

    const answerSectionElement = document.createElement('div');
    answerSectionElement.appendChild(radioButtonAnswerElement);
    answerSectionElement.appendChild(labelAnswerElement);

    formAnswerRadioButtonSectionElement.appendChild(answerSectionElement);
  };

  formAnswerRadioButtonSectionElement.appendChild(formAnswerButtonSectionElement);
  formAnswerElement.appendChild(formAnswerRadioButtonSectionElement);

  answersEl.appendChild(formAnswerElement);
};

/**
 * checkAnswer
 * 1. Check if the selected answer is correct
 * 2. Update the score if correct
 * 3. Move to the next question or end the quiz
 * @param {string} selectedAnswer 
 * @param {string} correctAnswer 
 * @param {string} formId 
 */
export function checkAnswer(correctAnswer, formId) {
  if (answerSelected === correctAnswer) { 
    score += 1;
  }

  if (questions.length > currentQuestion) {
    currentQuestion += 1;

    document.dispatchEvent(new CustomEvent(SUBMIT_ANSWER, {
      detail: { formId }
    }));
  }
  
  scoreEl.textContent = score;
};

/**
 * startTimer
 * 1. Set up an interval to decrease timeLeft
 * 2. Update the timer display
 * 3. End the quiz if time runs out
 */
export function startTimer() {
  timer = setInterval(() => {
    timeLeft -= 1;
    timerEl.textContent = timeLeft

    if (timeLeft === 0) {
      endQuiz();
    }
  }, 1000);
};

/**
 * endQuiz
 * 1. Clear the timer
 * 2. Display the final score
 * 3. Show the start button again
 * 4. Re-enable the difficulty selector
 */
export function endQuiz() {
  clearInterval(timer);

  questionEl.innerText = 'Quiz finished!';
  answersEl.style.display = 'none';

  startBtn.removeAttribute("style");
  recentGamesContainer.removeAttribute('style');

  difficultySelector.disabled = false;

  if (isStorageExist()) {
    const gameHistory = {
      dateTime: new Date(),
      difficulty: difficultySelector.value,
      timeSpent: defaultTime - timeLeft,
      score
    };

    gameHistories.unshift(gameHistory);
    if (gameHistories.length > 5) {
      gameHistories.pop();
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameHistories))
  }

  recentGamesListEl.innerHTML = '';
  _renderRecentMatches();
};

document.addEventListener(SUBMIT_ANSWER, ({ detail }) => {
  const { formId } = detail;

  const hidePreviousForm = document.getElementById(formId);
  hidePreviousForm.setAttribute('class', 'hide')

  if (currentQuestion < questions.length) {
    showQuestion(questions[currentQuestion]);

    return;
  }

  endQuiz();
});

document.addEventListener(SELECT_ANSWER, ({ detail }) => {
  const { selectedValue } = detail;
  
  answerSelected = selectedValue;
});

document.addEventListener(CHECK_ANSWER, ({ detail }) => {
  const { correctAnswer, formId } = detail;

  checkAnswer(correctAnswer, formId);
});

document.addEventListener(FETCHING, () => {
  loadingTextEl.removeAttribute('style');
  questionEl.innerText = '';
});

document.addEventListener(FETCHING_DONE, () => {
  loadingTextEl.style.display = 'none';
});
