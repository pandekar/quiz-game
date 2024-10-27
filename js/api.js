export const FETCHING = 'FETCHING';
export const FETCHING_DONE = 'FETCHING_DONE';

export async function fetchQuestions(difficulty) {
  try {
    document.dispatchEvent(new Event(FETCHING));
    const data = await fetch(`https://opentdb.com/api.php?amount=5&difficulty=${difficulty}&type=multiple`);
    const parsedData = await data.json();

    if (parsedData.response_code !== 0) {
      throw new Error('An error has occured');
    }

    document.dispatchEvent(new Event(FETCHING_DONE));
    return parsedData.results;
  } catch (error) {
    console.error(error)
  }
};
