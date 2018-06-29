// import express module 
const express = require('express');
// use express module to create app
const app = express()
// import body parser module
const bodyParser = require('body-parser');

// import database created by knex from knex.js
const database = require('./db/knex');

// allows app to parse json
app.use(bodyParser.json());

// sets the loction for app port
app.set('port', process.env.PORT || 3000);
// sets the location for static assets
app.use(express.static('public'));


// GET ALL PROJECTS: setup endpoint for GET projects - returns an array of projects
app.get('/api/v1/projects', (request, response) => {
  // go into my database and select all from the projects table
  database('projects').select()
  // when that promise resolves
    .then(projects => {
      // send a response with status 200 and json body of projects
      response.status(200).json(projects)
    })
  // if there's an error, 
    .catch(error => {
      // send a response with status 500 and the error
      response.status(500).json({ error })
    })
});


// GET A PROJECT: setup endpoint for GET a project - returns a project object
app.get('/api/v1/projects/:id', (request, response) => {
  // get the id from the request parameters
  const { id } = request.params;

  // go into projects table in database and select the row where the id matches the request id
  database('projects').where('id', id).select()
  // when that promise resolves
    .then(project => {
      // if a project was found
      if (project.length) {
        // return a response status of 200 and body of json and that project
        response.status(200).json(project[0]);
        // else 
      } else {
        // return a response status of 404 
        response.status(404).json({
          // and error message that it was not found
          error: `Could not find project with id ${ id }.`
        })
      }
    })
  // if there is an error, 
    .catch(error => {
      // return a response status of 500 and the error
      respons.status(500).json({ error });
    });

});


// GET ALL PALETTES FOR A PROJECT: setup endpoint for GET all palettes for a project - returns an array of palettes (gets empty array if no palettes match)
app.get('/api/v1/projects/:id/palettes', (request, response) => {
  // get the id from the request parameters
  const { id } = request.params;

  // select from the palettes table the row where the project_id matches the request params id
  database('palettes').where('project_id', id).select()
  // when that promise resolves
    .then(palettes => {
      // return a response with status 200 and body of the palettes
      response.status(200).json(palettes)
    })
  // if there is an error,
    .catch(error => {
      // return a response with status 500 and the error
      response.status(500).json({ error })
    });

});


// GET A SPECIFIC PALETTE: setup endpoint for GET a palette -  returns a palette object
app.get('/api/v1/palettes/:id', (request, response) => {
  // get the id from the request parameters
  const { id } = request.params;

  // select from the palettes table the row where the id matches the request id
  database('palettes').where('id', id).select()
  // when that promise resolves
    .then(palette => {
      // if a palette was found
      if (palette.length) {
        // return a response with status 200 and body of the palette
        response.status(200).json(palette[0]);
        // else 
      } else {
        // return a response with status 404 
        response.status(404).json({
          // and error message
          error: `Could not find palette with id ${ id }.`
        })
      }
    })
  // if there is an error
    .catch(error => {
      // return a reponse with status of 500 and the error
      response.status(500).json({ error });
    });

});


// ADD A PROJECT: setup endpoint for POST a project 
app.post('/api/v1/projects', (request, response) => {
  // get the project from the request body
  const project = request.body;

  // if there is not a name on the request body,
  if (!project.name) {
    // return a response with status 422
    return response.status(422).send({
      // and an error that the name is missing
      error: 'Expected format: { name: <String> }. You\'re missing a name property.'
    }); 
  }

  // insert the project into the projects table and return the id
  database('projects').insert(project, 'id')
  // when that promise resolves
    .then(project_id => {
      // send a response with status 200 and json body of the project id
      response.status(201).json({ project_id: project_id[0] });
    })
  // if there is an error
    .catch(error => {
      // send a response withs tatus 500 and the error
      response.status(500).json({ error });
    });

});


// ADD A PALETTE TO A PROJECT: setup endpoint to POST a palette to a project 
app.post('/api/v1/projects/:project_id/palettes', (request, response) => {
  // get the project id from the request parameters
  const { project_id } = request.params;
  // get the palette from the request body
  const palette = request.body;
  // list of required body parameters
  const requiredParams =  ['name', 'color1', 'color2', 'color3', 'color4', 'color5'];

  // iterate over the requiredParams array
  for (let requiredParam of requiredParams) {
    // if the palette does not contain the current requiredParam,
    if (!palette[requiredParam]) {
      // return a response withs tatus 422
      return response.status(422).send({
        // and an error stating the required format and the missing param
        error: `Expected format: { name: <String>, color1: <String>, color2: <String>, color3: <String>, color4: <String>, color5: <String> }. You're missing a ${ requiredParam } property`
      })
    }
  }

  // select the project from the projects table where the id matches id passed in request
  database('projects').where('id', project_id).select()
  // when the promise resolves
    .then(project => {
      // if a matching project was not found
      if (!project.length) {
        // return a response with status 404
        response.status(404).send({
          // and error message
          error: `Could not find project with id ${ project_id }.`
        })
        // else 
      } else {
        // create a new palette object, adding in the project id
        const newPalette = { ...palette, project_id };

        // insert the new palette into the palettes table and return the id
        database('palettes').insert(newPalette, 'id')
        // when that promise resolves
          .then(palette_id => {
            // return a response with status 201 and the palette id
            response.status(201).json({ palette_id: palette_id[0] })
          })
        // if there is an error,
          .catch(error => {
            // return a response with status 500 and the error
            response.status(500).json({ error })
          })
      }
    })
  // if there is an error (in the outer knex function)
    .catch(error => {
      // return a response with status 500 and the error
      response.status(500).json({ error });
    });

});


// DELETE A PALETTE FROM A PROJECT: setup endpoint for delete a palette from a project
app.delete('/api/v1/palettes/:id', (request, response) => {
  // get the id from the request parameters
  const { id } = request.params;

  // select from the palettes table the row where the id matches the request id
  database('palettes').where('id', id).select()
  // when the promise resolves
    .then(palette => {
      // if a palette was not selected from the database
      if (!palette.length) {
        // return a response with status 404
        response.status(404).send({
          // and the error
          error: `Could not find palette with id ${ id }.`
        })
        // else 
      } else {
        // delete from the palettes table the row where the id matches the request id
        database('palettes').where('id', id).del()
        // when the promise resolves
          .then(deletedPalette => {
            // return a response with status 200 and delete message
            response.status(200).send(`Deleted ${ deletedPalette } palette with id ${ id }.`)
          })
        // if there was an error
          .catch(error => {
            // return a response with status 500 and the error
            response.status(500).json({ error })
          })
      }
    })
  // if there was an error (in the outer knex function)
    .catch(error => {
      // return a response with status 500 and the error
      response.status(500).json({ error })
    })
})


// listen on whatever the port was set to
app.listen(app.get('port'), () => {
  // log into the console a message with what port the app is listening to 
  console.log(`Palette Picker is running on ${app.get('port')}`)
})

// export the app (to be used in test files)
module.exports = app;

