const express = require('express');
const app = express();
let { projects, palettes } = require('./mockData.js');
const bodyParser = require('body-parser');

const env = process.env.NODE_ENV || 'development';
const config = require('./knexfile')[env];
const database = require('knex')(config);

app.use(bodyParser.json());

app.set('port', process.env.PORT || 3000);
app.use(express.static('public'));


// GET ALL PROJECTS - returns an array of projects
app.get('/api/v1/projects', (request, response) => {
  response.json(projects);
});


// GET A PROJECT = returns a project object
app.get('/api/v1/projects/:id', (request, response) => {
  const { id } = request.params;
  const project = projects.find(project => project.id === id);

  if (project) {
    response.status(200).json(project);
  } else {
    response.sendStatus(404);
  }

});


// GET ALL PALETTES FOR A PROJECT - returns an array of palettes
app.get('/api/v1/projects/:id/palettes', (request, response) => {
  const { id } = request.params;
  const project = projects.find(project => project.id === id);

  if (project) {
    const projectPalettes = palettes.filter(palette => palette.project_id === id);
    response.status(200).json(projectPalettes);
  } else {
    response.sendStatus(404);
  }
})


// GET A SPECIFIC PALETTE - returns a palette object
app.get('/api/v1/palettes/:id', (request, response) => {
  const { id } = request.params;
  const palette = palettes.find(palette => palette.id === id);

  if (palette) {
    response.status(200).json(palette);
  } else {
    response.sendStatus(404);
  }
})


// ADD A PROJECT - send name in the body
app.post('/api/v1/projects', (request, response) => {
  const id = Date.now().toString();
  const { name } = request.body;

  if (!name) {
    response.status(422).send({
      error: 'No name provided in request body.'
    }); 
  } else {
    projects.push({ id, name }); 
    response.status(201).json({ id, name });
  }
})


// ADD A PALETTE TO A PROJECT - send name and colors in body
app.post('/api/v1/projects/:project_id/palettes', (request, response) => {
  const { project_id } = request.params;
  const id = Date.now().toString();
  const { name, colors } = request.body;
  const newPalette = { id, name, project_id, colors };

  if (!name) {
    response.status(422).send({
      error: 'No name provided in request body.'
    });
  } else if (!colors) {
    response.status(422).send({
      error: 'No colors provided in request body.'
    });
  } else if (colors.length !== 5) {
    response.status(422).send({
      error: 'Colors should be an array of 5 hex color code strings pass into the request body.'
    });
  } else {
    palettes.push(newPalette);
    response.status(201).json(newPalette);
  }
})


// DELETE A PROJECT
app.delete('/api/v1/projects/:id', (request, response) => {
  const { id } = request.params;
  const projectToDelete = projects.find(project => project.id === id);

  if (projectToDelete) {
    projects = projects.filter(project => project.id !== id);
    response.sendStatus(204);
  } else {
    response.sendStatus(404);
  }
})


// DELETE A PALETTE FROM A PROJECT
app.delete('/api/v1/palettes/:id', (request, response) => {
  const { id } = request.params;
  const paletteToDelete = palettes.find(palette => palette.id === id);

  if (paletteToDelete) {
    palettes = palettes.filter(palette => palette.id !== id);
    response.sendStatus(204);
  } else {
    response.sendStatus(404);
  }
})


app.listen(app.get('port'), () => {
  console.log(`Palette Picker is running on ${app.get('port')}`)
})
