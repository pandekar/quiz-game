export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// util function to decode HTML entities. Useful to decode question strings from the API response
// detailed explanation: https://stackoverflow.com/questions/7394748/whats-the-right-way-to-decode-a-string-that-has-special-html-entities-in-it
export function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

export const isStorageExist = () => {
  if (typeof (Storage) === undefined) {
    alert('your browser does not support local storage');
    return false;
  }

  return true;
};
