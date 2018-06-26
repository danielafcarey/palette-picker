const express = require('express');
const app = express();
const { projects, palettes } = require('./mockData.js');

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
    const palettes = palettes.filter(palette => palette.project_id === id);
    response.status(200).json(palettes);
  } else {
    response.sendStatus(404);
  }
})


// GET A SPECIFIC PALETTE ON A PROJECT - returns a palette object
app.get('/api/v1/projects/:id/palettes/:id', (request, response) => {

})


// ADD A PROJECT
app.post('/api/v1/projects', (request, response) => {

})

// ADD A PALETTE TO A PROJECT
app.post('/api/v1/projects/:id/palettes', (request, response) => {

})

// DELETE A PROJECT
app.post('/api/v1/projects/:id', (request, response) => {

})

// DELETE A PALETTE FROM A PROJECT
app.post('/api/v1/projects/:id/palettes/:id', (request, response) => {

})

app.listen(app.get('port'), () => {
  console.log(`Palette Picker is running on ${app.get('port')}`)
})
