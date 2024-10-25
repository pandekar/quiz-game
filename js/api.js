export async function fetchQuestions(difficulty) {
  try {
    const data = await fetch(`https://opentdb.com/api.php?amount=5&difficulty=${difficulty}&type=multiple`);
    const parsedData = await data.json();

    if (parsedData.response_code !== 0) {
      throw new Error('An error has occured');
    }

    return parsedData.results;
  } catch (error) {
    console.error(error)
  }
};
