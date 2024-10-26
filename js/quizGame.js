import { fetchQuestions } from './api.js';
import { shuffleArray, decodeHTML } from './utils.js';
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

// Game state variables
let currentQuestion = 0;
let score = 0;
let timer = null;
let timeLeft = 30; // in seconds
let questions = [];
let answerSelected = null;
const SUBMIT_ANSWER = 'SUBMIT_ANSWER';

export function initQuizGame() {
  startBtn.addEventListener('click', startQuiz);
};

export async function startQuiz() {
  try {
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

  difficultySelector.disabled = false;
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
