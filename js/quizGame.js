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

export function initQuizGame() {
  startBtn.addEventListener('click', startQuiz);
};

export async function startQuiz() {
  try {
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

export function showQuestion(questionData) {
  // TODO: Implement the showQuestion function
  // 1. Set the question text
  // 2. Clear previous answer buttons
  // 3. Create and append new answer buttons
  console.log('showQuestion', questionData);
  questionEl.innerText = questionData.question;
  const answers = [questionData.correct_answer, ...questionData.incorrect_answers];
  
  const formAnswerElement = document.createElement('form');
  const formAnswerRadioButtonSectionElement = document.createElement('fieldset');
  const formAnswerButtonSectionElement = document.createElement('div');
  
  const formAnswerButtonElement = document.createElement('button');
  formAnswerButtonElement.type = 'submit';
  formAnswerButtonElement.innerText = 'submit';
  formAnswerButtonElement.addEventListener('click', (e) => {
    e.preventDefault();
    checkAnswer(answerSelected, questionData.correct_answer);
  });
  formAnswerButtonSectionElement.appendChild(formAnswerButtonElement);

  for (const index in answers) {
    const radioButtonAnswerElement = document.createElement('input');
    radioButtonAnswerElement.type = 'radio'
    radioButtonAnswerElement.id = `answer-${index}`;
    radioButtonAnswerElement.name = 'answer';
    radioButtonAnswerElement.value = answers[index];
    radioButtonAnswerElement.addEventListener('click', (e) => {
      answerSelected = e.target.value;
    });

    const labelAnswerElement = document.createElement('label');
    labelAnswerElement.setAttribute('for', `answer-${index}`);
    labelAnswerElement.innerText = answers[index];    

    const answerSectionElement = document.createElement('div');
    answerSectionElement.appendChild(radioButtonAnswerElement);
    answerSectionElement.appendChild(labelAnswerElement);

    formAnswerRadioButtonSectionElement.appendChild(answerSectionElement);
  };

  formAnswerRadioButtonSectionElement.appendChild(formAnswerButtonSectionElement);
  formAnswerElement.appendChild(formAnswerRadioButtonSectionElement);

  answersEl.appendChild(formAnswerElement);
};

export function checkAnswer(selectedAnswer, correctAnswer) {
  // TODO: Implement the checkAnswer function
  // 1. Check if the selected answer is correct
  // 2. Update the score if correct
  // 3. Move to the next question or end the quiz
  console.log('checkAnswer', selectedAnswer, correctAnswer);

  if (selectedAnswer === correctAnswer) {
    score += 1;
  }
  scoreEl.textContent = score;
};

export function startTimer() {
  // TODO: Implement the startTimer function
  // 1. Set up an interval to decrease timeLeft
  // 2. Update the timer display
  // 3. End the quiz if time runs out
};

export function endQuiz() {
  // TODO: Implement the endQuiz function
  // 1. Clear the timer
  // 2. Display the final score
  // 3. Show the start button again
  // 4. Re-enable the difficulty selector
};