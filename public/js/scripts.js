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
    //get all projects (array)
    const projects = await getAllProjects();
    //iterate over and run appendProject for each one
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

    const response = await fetch(url, options);
    const { project_id } = await response.json();
    const projectPalettes = await getProjectPalettes(project_id);
    const project = { id: project_id, name, projectPalettes }
    
    appendProject(project);
    updateProjectOptions(project);
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
        ${ palettes } 
      </div>
    ` 
    $('.projects-container').append(newProject);
  }

  function createPaletteElements(palettes) {
    let allPalettes = '';

    if (palettes.length) {
      allPalettes = palettes.reduce((allPalettes, palette) => {
        const { name, color1, color2, color3, color4, color5 } = palette;
        const paletteElement = `
          <div class="palette" >
            <h4>${ name }</h4>
            <div style="background-color:${ color1 };"></div>
            <div style="background-color:${ color2 };"></div>
            <div style="background-color:${ color3 };"></div>
            <div style="background-color:${ color4 };"></div>
            <div style="background-color:${ color5 };"></div>
          </div>
        `;
        return allPalettes + paletteElement
      }, '')
    }
    
    return `<div class="projectPalettes">${ allPalettes }</div>`
  }

  function updateProjectOptions({ name, id }) {
    const projectOption = `
      <option value=${ name } id=${ id }>
      ${ name } 
      </option>
      ` 
    $('.project-options').append(projectOption);
  }

})
