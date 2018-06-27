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
  database('projects').select()
    .then(projects => {
      response.status(200).json(projects)
    })
    .catch(error => {
      response.status(500).json({ error })
    })
});


// GET A PROJECT = returns a project object
app.get('/api/v1/projects/:id', (request, response) => {
  const { id } = request.params;

  database('projects').where('id', id).select()
    .then(project => {
      if (project.length) {
        response.status(200).json(project[0]);
      } else {
        response.status(404).json({
          error: `Could not find project with id ${ id }.`
        })
      }
    })
    .catch(error => {
      respons.status(500).json({ error });
    });

});


// GET ALL PALETTES FOR A PROJECT - returns an array of palettes (gets empty array if no palettes match)
app.get('/api/v1/projects/:id/palettes', (request, response) => {
  const { id } = request.params;

  database('palettes').where('project_id', id).select()
    .then(palettes => {
      response.status(200).json(palettes)
    })
    .catch(error => {
      response.status(500).json({ error })
    });

});


// GET A SPECIFIC PALETTE - returns a palette object
app.get('/api/v1/palettes/:id', (request, response) => {
  const { id } = request.params;

  database('palettes').where('id', id).select()
    .then(palette => {
      if (palette.length) {
        response.status(200).json(palette[0]);
      } else {
        response.status(404).json({
          error: `Could not find palette with id ${ id }.`
        })
      }
    })
    .catch(error => {
      response.status(500).json({ error });
    });

});


// ADD A PROJECT - send name in the body
app.post('/api/v1/projects', (request, response) => {
  const project = request.body;

  if (!project.name) {
    return response.status(422).send({
      error: `Expected format: { name: <String> }. You're missing a name property.`
    }); 
  }

  database('projects').insert(project, 'id')
    .then(project_id => {
      response.status(201).json({ project_id: project_id[0] });
    })
    .catch(error => {
      response.status(500).json({ error });
    });

});


// ADD A PALETTE TO A PROJECT - send name and colors in body
app.post('/api/v1/projects/:project_id/palettes', (request, response) => {
  const { project_id } = request.params;
  const palette = request.body;
  const requiredParams =  ['name', 'color1', 'color2', 'color3', 'color4', 'color5'];

  for (let requiredParam of requiredParams) {
    if (!palette[requiredParam]) {
      return response.status(422).send({
        error: `Expected format: { name: <String>, color1: <String>, color2: <String>, color3: <String>, color4: <String>, color5: <String> }. You're missing a ${ requiredParam } property`
      })
    }
  }

  database('projects').where('id', project_id).select()
    .then(project => {
      if (!project.length) {
        response.status(404).send({
          error: `Could not find project with id ${ project_id }.`
        })
      } else {
        const newPalette = { ...palette, project_id };

        database('palettes').insert(newPalette, 'id')
          .then(palette_id => {
            response.status(201).json({ palette_id: palette_id[0] })
          })
          .catch(error => {
            response.status(500).json({ error })
          })
      }
    })
    .catch(error => {
      response.status(500).json({ error });
    });

});


// DELETE A PROJECT
app.delete('/api/v1/projects/:id', (request, response) => {
  const { id } = request.params;

  database('projects').where('id', id).select()
    .then(project => {
      if (!project.length) {
        response.status(404).send({
          error: `Could not find project with id ${ project_id }.`
        })
      } else {
        database('palettes').where('project_id', id).del()
          .then(() => {
            database('projects').where('id', id).del()
              .then(deletedProject => {
                response.status(200).send(`Deleted ${ deletedProject } project of id ${ id }.`)
              })
              .catch(error => {
                response.status(500).json({ error })
              })
          })
          .catch(error => {
            response.status(500).json({ error })
          })
      }
    })
    .catch(error => {
      response.status(500).json({ error })
    });

})


// DELETE A PALETTE FROM A PROJECT
app.delete('/api/v1/palettes/:id', (request, response) => {
  const { id } = request.params;
  const paletteToDelete = palettes.find(palette => palette.id === id);

  if (paletteToDelete) {
    palettes = palettes.filter(palette => palette.id !== id);
    response.sendStatus(200);
  } else {
    response.sendStatus(404);
  }
})


app.listen(app.get('port'), () => {
  console.log(`Palette Picker is running on ${app.get('port')}`)
})
