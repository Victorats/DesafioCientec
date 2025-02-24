const request = require('supertest');
const { expect } = require('chai');
const server = require('../src/index');
const db = require('../src/db'); 

describe('Cadastro de Cidadãos', function() {
  //remove qualquer registro que utilize o CPF de teste
  before((done) => {
    db.run(`DELETE FROM citizens WHERE cpf = ?`, ['52998224725'], function(err) {
      done(err);
    });
  });

  
  after((done) => {
    server.close(done);
  });

  it('GET / deve retornar a página de cadastro', function(done) {
    request(server)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).to.include('Cadastro de Cidadãos Brasileiros');
        done();
      });
  });

  it('GET /pesquisa sem parâmetros deve retornar o formulário de pesquisa', function(done) {
    request(server)
      .get('/pesquisa')
      .expect('Content-Type', /html/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).to.include('Pesquisa de Cidadãos');
        done();
      });
  });

  it('POST /cadastro deve cadastrar um cidadão com CPF válido', function(done) {
    const validCitizen = {
      nome: 'Teste de Cadastro',
      cpf: '52998224725' //CPF de teste
    };

    request(server)
      .post('/cadastro')
      .type('form')
      .send(validCitizen)
      .expect('Content-Type', /html/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).to.include('Cidadão cadastrado com sucesso');
        expect(res.text).to.include(validCitizen.nome);
        done();
      });
  });

  it('GET /pesquisa com CPF deve retornar o cidadão cadastrado', function(done) {
    request(server)
      .get('/pesquisa?cpf=52998224725')
      .expect('Content-Type', /html/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).to.include('Cidadão Encontrado');
        expect(res.text).to.include('52998224725');
        done();
      });
  });

  it('GET /pesquisa com nome deve retornar o cidadão cadastrado', function(done) {
    const nome = 'Teste de Cadastro';

    request(server)
      .get(`/pesquisa?nome=${encodeURIComponent(nome)}`)
      .expect('Content-Type', /html/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).to.include('Cidadãos Encontrados');
        expect(res.text).to.include(nome);
        done();
      });
  });

  it('GET /pesquisa com CPF inexistente deve retornar "Cidadão não encontrado"', function(done) {
    request(server)
      .get('/pesquisa?cpf=00000000000')
      .expect('Content-Type', /html/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).to.include('Cidadão não encontrado');
        done();
      });
  });
});
