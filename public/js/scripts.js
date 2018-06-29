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
  const projects = $('.projects-container');

  generateNewPalette();
  populateProjects();
  $('.new-palette-button').on('click', generateNewPalette);
  $('.lock').on('click', toggleLock);
  $('.create-project-form').on('submit', addProject);
  $('.save-palette').on('submit', savePalette);
  $('.projects-container').on('click', '.delete-palette-button', deletePalette);
  // $('.projects-container').on('click', '.palette', getPaletteColors);

  function getPaletteColors(event) {

    const selectedPalette = $(`#${ event.currentTarget.id }.palette`)
    const colorCards = $(selectedPalette).children('div');
    console.log(colorCards);
    const colors = $(colorCards).map(card => {
      debugger;
    //   const rgbString = card.style.backgroundColor;
    //   const rgbNums = rgbString.match(/\d+/g);
    //   return covertToHex(rgbNums);
    })

    // updatePalette(colors);
  }

  function convertToHex(numArray) {
    return '#' + numArray.map(num => {
      const hex = num.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  function updatePalette(colors) {
    allCards.forEach((card, i) => {
      card.css('background-color', colors[i]);
      card.children('p').text(colors[i]);
    })
  }

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

  async function populateProjects() {
    const projects = await getAllProjects();
    projects.forEach(project => {
      appendProject(project)
      updateProjectOptions(project);
    })
  }

  async function getAllProjects() {
    const url = 'http://localhost:3000/api/v1/projects';
    const response = await fetch(url);
    const projects = await response.json();
    const fullProjectPromises = projects.map(async project => {
      const { name, id } = project;
      const projectPalettes = await getProjectPalettes(id);
      return { name, id, projectPalettes }
    })

    return Promise.all(fullProjectPromises);
  }

  async function addProject(event) {
    event.preventDefault();
    const name = $('.create-project-form :input').val();
    const url = 'http://localhost:3000/api/v1/projects'
    const options = {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name }) 
    }
    const matchingCurrentProjects = $('.project-options option[value="' + name + '"]');

    if (!matchingCurrentProjects.length) {
      const response = await fetch(url, options);
      const { project_id } = await response.json();
      const projectPalettes = await getProjectPalettes(project_id);
      const project = { id: project_id, name, projectPalettes }

      appendProject(project);
      updateProjectOptions(project);
      $('.create-project-form :input').val('');
    }
  }

  async function getProjectPalettes(project_id) {
    const url = `http://localhost:3000/api/v1/projects/${project_id}/palettes`;
    const response = await fetch(url);
    const projectPalettes = await response.json();

    return projectPalettes;
  }

  function appendProject({ id, name, projectPalettes }) {
    const palettes = createPaletteElements(projectPalettes);
    const newProject = `
      <div class="project" id=${ id } >
        <h3>${ name }</h3> 
        <div class="project-palettes">
          ${ palettes } 
        </div>
      </div>
    ` 
    $('.projects-container').append(newProject);
  }

  function createPaletteElements(palettes) {
    let allPalettes = '';

    if (palettes.length) {
      allPalettes = palettes.reduce((allPalettes, palette) => {
        const { id, name, color1, color2, color3, color4, color5 } = palette;
        const paletteElement = `
          <div class="palette" id=${ id }>
            <h4>${ name }</h4>
            <div style="background-color:${ color1 };"></div>
            <div style="background-color:${ color2 };"></div>
            <div style="background-color:${ color3 };"></div>
            <div style="background-color:${ color4 };"></div>
            <div style="background-color:${ color5 };"></div>
            <button class="delete-palette-button"></button>
          </div>
        `;
        return allPalettes + paletteElement
      }, '')
    }
    
    return allPalettes;
  }

  function updateProjectOptions({ name, id }) {
    const projectOption = `
      <option value=${ name } id=${ id }>
      ${ name } 
      </option>
      ` 
    $('.project-options').append(projectOption);
  }

  async function savePalette(event) {
    event.preventDefault();
    const name = $('.save-palette :input').val();
    const id = $('.project-options option:selected').attr('id');
    const color1 = $('.card-1 p')[0].innerText;
    const color2 = $('.card-2 p')[0].innerText;
    const color3 = $('.card-3 p')[0].innerText;
    const color4 = $('.card-4 p')[0].innerText;
    const color5 = $('.card-5 p')[0].innerText;
    const palette = { name, color1, color2, color3, color4, color5 }
  
    const { palette_id } = await postPalette(palette, id);
    palette.id = palette_id;
    appendPalette(palette, id);
  }

  async function postPalette(palette, id) {
    const url = `http://localhost:3000/api/v1/projects/${ id }/palettes`
    const options = {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify( palette ) 
    }

    const response = await fetch(url, options);
    return await response.json();
  }

  function appendPalette(palette, id) {
    const project = $(`div#${ id }.project`);
    const paletteElement = createPaletteElements([palette])
    project.append(paletteElement);
  }

  async function deletePalette(event) {
    const palette = event.target.parentElement;
    const url = `http://localhost:3000/api/v1/palettes/${ palette.id }`;
    const options = {
      method: 'DELETE'
    }

    const response = await fetch(url, options)
    if (response.status === 200) {
      palette.remove();
    }
  };


})
