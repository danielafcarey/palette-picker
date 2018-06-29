process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');
const database = require('../db/knex');

chai.use(chaiHttp);

describe('client routes', () => {
  it('should receive a response of index.html when we hit the root endpoint', done => {
    chai.request(server)
      .get('/')
      .end((error, response) => {
        response.should.have.status(200);
        response.should.be.html;
        done();
      })
  })

  it('should return a 404 for a route that does not exist', done => {
    chai.request(server)
      .get('/palettes-are-fun')
      .end((error, response) => {
        response.should.have.status(404);
        done();
      })
  })
})

describe('api routes', () => {

  beforeEach(done => {
    database.migrate.rollback()
      .then(() => {
        database.migrate.latest()
          .then(() => {
            return database.seed.run()
              .then(() => {
                done();
              })
          })
      })
  })

  afterEach(done => {
    database.migrate.rollback()
      .then(() => {
        done();
      })
  })

  describe('GET /api/v1/projects', () => {
    it('should return an array of projects', done => {
      chai.request(server)
        .get('/api/v1/projects')
        .end((error, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('array');
          response.body.length.should.equal(1);
          response.body[0].should.have.property('name');
          response.body[0].name.should.equal('My Fake Project');
          response.body[0].should.have.property('id');
          response.body[0].id.should.equal(1);
          done();
        })
    })

  })

  describe('GET /api/v1/projects/:id', () => {
    it('should return a specific project', done => {
      chai.request(server)
        .get('/api/v1/projects/1')
        .end((error, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('object');
          response.body.should.have.property('name');
          response.body.name.should.equal('My Fake Project');
          response.body.should.have.property('id');
          response.body.id.should.equal(1);
          done();
        })
    })

    it('should return a 404 if the project was not found', done => {
      chai.request(server)
        .get('/api/v1/projects/3')
        .end((err, response) => {
          response.should.have.status(404);
          done();
        })
    })

  })

  describe('GET /api/v1/projects/:id/palettes', () => {
    it('should return an array of palettes for a specific project', done => {
      chai.request(server)
        .get('/api/v1/projects/1/palettes')
        .end((err, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('array');
          response.body.length.should.equal(2);
          response.body[0].should.have.property('name');
          response.body[0].name.should.equal('greens');
          response.body[0].should.have.property('project_id');
          response.body[0].project_id.should.equal(1);
          response.body[0].should.have.property('color1');
          response.body[0].color1.should.equal('#111111');
          response.body[0].should.have.property('color2');
          response.body[0].color2.should.equal('#222222');
          response.body[0].should.have.property('color3');
          response.body[0].color3.should.equal('#333333');
          response.body[0].should.have.property('color4');
          response.body[0].color4.should.equal('#444444');
          response.body[0].should.have.property('color5');
          response.body[0].color5.should.equal('#555555');
          done(); 
        })
    })

    it('should return an empty array if no palettes match the project', done => {
      chai.request(server)
        .get('/api/v1/projects/2/palettes')
        .end((err, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('array');
          response.body.length.should.equal(0);
          done();
        })
    })

  })

  describe('GET /api/v1/palettes/:id', () => {
    it('should return a palette object', done => {
      chai.request(server)
        .get('/api/v1/palettes/1')
        .end((err, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('object');
          response.body.should.have.property('name');
          response.body.name.should.equal('greens');
          response.body.should.have.property('project_id');
          response.body.project_id.should.equal(1);
          response.body.should.have.property('color1');
          response.body.color1.should.equal('#111111');
          response.body.should.have.property('color2');
          response.body.color2.should.equal('#222222');
          response.body.should.have.property('color3');
          response.body.color3.should.equal('#333333');
          response.body.should.have.property('color4');
          response.body.color4.should.equal('#444444');
          response.body.should.have.property('color5');
          response.body.color5.should.equal('#555555');
          done(); 
        })
    })

    it('should return a 404 if no palette was found', done => {
      chai.request(server)
        .get('/api/v1/palettes/100')
        .end((err, response) => {
          response.should.have.status(404);
          done();
        })
    })

  })

  describe('POST /api/v1/projects', () => {
    it('should add a project to the database', done => {
      chai.request(server)
        .post('/api/v1/projects')
        .send({
          name: 'project schmoject'
        })
        .end((err, response) => {
          response.should.have.status(201);
          response.should.be.json;
          response.body.should.be.a('object');
          response.body.should.have.property('project_id');
          response.body.project_id.should.equal(2);
          done();
        })
    })

    it('should not add a project if the correct params were not sent', done => {
      chai.request(server)
        .post('/api/v1/projects')
        .end((err, response) => {
          response.should.have.status(422);
          response.body.error.should.equal('Expected format: { name: <String> }. You\'re missing a name property.')
          done();
        })
    })
  })

  describe('POST /api/v1/palettes', () => {
    it('should add a palette to the database', done => {
      chai.request(server)
        .post('/api/v1/projects/1/palettes')
        .send({
          name: 'palette schmalette',
          project_id: '1',
          color1: 'red',
          color2: 'green',
          color3: 'blue',
          color4: 'yellow',
          color5: 'marigold'
        })
        .end((err, response) => {
          response.should.have.status(201);
          response.should.be.json;
          response.body.should.be.a('object');
          response.body.should.have.property('palette_id');
          response.body.palette_id.should.equal(3);
          done();
        })
    })

    it('should not add a palette if any params are missing', done => {
      chai.request(server)
        .post('/api/v1/projects/1/palettes')
        .send({
          project_id: '1',
          color1: 'red',
          color2: 'green',
          color3: 'blue',
          color4: 'yellow',
          color5: 'marigold'
        })
        .end((err, response) => {
          response.should.have.status(422);
          response.body.error.should.equal('Expected format: { name: <String>, color1: <String>, color2: <String>, color3: <String>, color4: <String>, color5: <String> }. You\'re missing a name property')
          done();
        })
    })

    it('should not add a palette if the project was not found', done => {
      chai.request(server)
        .post('/api/v1/projects/111/palettes')
        .send({
          name: 'pal',
          project_id: '1',
          color1: 'red',
          color2: 'green',
          color3: 'blue',
          color4: 'yellow',
          color5: 'marigold'
        })
        .end((err, response) => {
          response.should.have.status(404);
          response.body.error.should.equal('Could not find project with id 111.')
          done();
        })
    })
  })

  describe('DELETE /api/v1/palettes/:id', () => {
    it('should delete a palette from the database', done => {
      chai.request(server)
        .delete('/api/v1/palettes/1')
        .end((err, response) => {
          response.should.have.status(200);
          chai.request(server)
            .get('/api/v1/palettes/1')
            .end((err, response) => {
              response.should.have.status(404);
              response.body.error.should.equal('Could not find palette with id 1.');
              done();
            })
        })
    })

    it('should send a 404 if the project was not found', done => {
      chai.request(server)
        .delete('/api/v1/palettes/81')
        .end((err, response) => {
          response.should.have.status(404);
          response.body.error.should.equal('Could not find palette with id 81.');
          done();
        })
    })

  })


})
