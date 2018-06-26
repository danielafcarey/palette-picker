$(document).ready(() => {
  const card1 = $('.card-1');
  const card2 = $('.card-2');
  const card3 = $('.card-3');
  const card4 = $('.card-4');
  const card5 = $('.card-5');
  const allCards = [
    card1,
    card2,
    card3,
    card4,
    card5
  ]
  
  generateNewPalette();
  $('.new-palette-button').on('click', generateNewPalette);

  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateNewPalette() {
    allCards.forEach(card => {
      let randomNum1 = getRandomNumber(0, 255);
      let randomNum2 = getRandomNumber(0, 255);
      let randomNum3 = getRandomNumber(0, 255);

      let randomColor = `rgba(${randomNum1}, ${randomNum2}, ${randomNum3})`
      card.css('background-color', randomColor);
    })
  }
})
