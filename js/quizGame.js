import { fetchQuestions } from './api.js';
import { shuffleArray, decodeHTML } from './utils.js';

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
 * _createAnswerButtonElement
 * @param {string} formId 
 * @param {Object} questionData 
 * @returns {HTMLButtonElement}
 * @private
 */
const _createAnswerButtonElement = (formId, questionData) => {
  const formAnswerButtonElement = document.createElement('button');
  formAnswerButtonElement.type = 'submit';
  formAnswerButtonElement.innerText = 'submit';
  formAnswerButtonElement.addEventListener('click', (e) => {
    e.preventDefault();
    const correctAnswer = decodeHTML(questionData.correct_answer);

    checkAnswer(answerSelected, correctAnswer, formId);
  });

  return formAnswerButtonElement;
};

/**
 * _createRadioButtonAnswerElement
 * @param {Array<string>} answers 
 * @param {string} index 
 * @returns {HTMLInputElement}
 * @private
 */
const _createRadioButtonAnswerElement = (answers, index) => {
  const radioButtonAnswerElement = document.createElement('input');
  radioButtonAnswerElement.type = 'radio'
  radioButtonAnswerElement.id = `answer-${index}`;
  radioButtonAnswerElement.name = 'answer';
  radioButtonAnswerElement.value = decodeHTML(answers[index]);
  radioButtonAnswerElement.addEventListener('click', (e) => {
    answerSelected = e.target.value;
  });

  return radioButtonAnswerElement;
};

/**
 * _createLabelAnswerElement
 * @param {Array<string>} answers 
 * @param {string} index 
 * @returns {HTMLLabelElement}
 * @private
 */
const _createLabelAnswerElement = (answers, index) => {
  const labelAnswerElement = document.createElement('label');
  labelAnswerElement.setAttribute('for', `answer-${index}`);
  labelAnswerElement.innerText = decodeHTML(answers[index]);

  return labelAnswerElement;
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
  
  const formAnswerButtonElement = _createAnswerButtonElement(formId, questionData);
  formAnswerButtonSectionElement.appendChild(formAnswerButtonElement);

  for (const index in answers) {
    const radioButtonAnswerElement = _createRadioButtonAnswerElement(answers, index);
    const labelAnswerElement = _createLabelAnswerElement(answers, index);

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
export function checkAnswer(selectedAnswer, correctAnswer, formId) {
  if (selectedAnswer === correctAnswer) { 
    score += 1;
  }

  if (questions.length > currentQuestion) {
    currentQuestion += 1;

    document.dispatchEvent(new CustomEvent(SUBMIT_ANSWER, {
      detail : { formId }
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
