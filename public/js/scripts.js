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
  $('.lock').on('click', toggleLock);

  function getRandomColor() {
    const letters = '0123456789ABCDEF'.split('');
    let color = '#';
    for (var i = 0; i < 6; i++ ) {
      color += letters[Math.round(Math.random() * 15)];
    }
    return color;
  }

  function generateNewPalette() {
    allCards.forEach(card => {
      if (!card[0].classList.contains('locked')) {
        let randomColor = getRandomColor();
        card.css('background-color', randomColor);
        card.children('p').text(randomColor);
      }
    })
  }

  function toggleLock(event) {
    const { classList } = event.target.parentElement;
    classList.toggle('locked');
  }



})
