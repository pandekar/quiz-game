const CHECK_ANSWER = 'CHECK_ANSWER';
const SELECT_ANSWER = 'SELECT_ANSWER';

/**
 * _createAnswerButtonElement
 * @param {string} formId 
 * @param {string} decodedCorrectAnswer
 * @returns {HTMLButtonElement}
 */
const _createAnswerButtonElement = (formId, decodedCorrectAnswer) => {
  const formAnswerButtonElement = document.createElement('button');
  formAnswerButtonElement.type = 'submit';
  formAnswerButtonElement.innerText = 'submit';
  formAnswerButtonElement.addEventListener('click', (e) => {
    e.preventDefault();
    const correctAnswer = decodedCorrectAnswer;

    document.dispatchEvent(new CustomEvent(CHECK_ANSWER, {
      detail: {
        correctAnswer,
        formId,
      }
    }));
  });

  return formAnswerButtonElement;
};

/**
 * _createRadioButtonAnswerElement
 * @param {string} answer
 * @param {string} index 
 * @returns {HTMLInputElement}
 */
const _createRadioButtonAnswerElement = (answer, index) => {
  const radioButtonAnswerElement = document.createElement('input');
  radioButtonAnswerElement.type = 'radio'
  radioButtonAnswerElement.id = `answer-${index}`;
  radioButtonAnswerElement.name = 'answer';
  radioButtonAnswerElement.value = answer;
  radioButtonAnswerElement.addEventListener('click', (e) => {
    document.dispatchEvent(new CustomEvent(SELECT_ANSWER, {
      detail: { selectedValue: e.target.value }
    }));
  });

  return radioButtonAnswerElement;
};

/**
 * _createLabelAnswerElement
 * @param {string} answer
 * @param {string} index 
 * @returns {HTMLLabelElement}
 */
const _createLabelAnswerElement = (answer, index) => {
  const labelAnswerElement = document.createElement('label');
  labelAnswerElement.setAttribute('for', `answer-${index}`);
  labelAnswerElement.innerText = answer;

  return labelAnswerElement;
};

export {
  SELECT_ANSWER,
  CHECK_ANSWER,
  _createAnswerButtonElement,
  _createRadioButtonAnswerElement,
  _createLabelAnswerElement,
};
