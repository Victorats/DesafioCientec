const http = require('http');
const fs = require('fs');
const path = require('path');
const CitizenController = require('./controllers/citizenController');

const PORT = 3000;

function serveStaticFile(res, filePath, contentType, responseCode = 200) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Erro interno do servidor');
    } else {
      res.writeHead(responseCode, { 'Content-Type': contentType });
      res.end(data);
    }
  });
}

function parseBody(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    callback(new URLSearchParams(body));
  });
}

const server = http.createServer((req, res) => {
  //formulário de cadastro
  if (req.url === '/' && req.method === 'GET') {
    const filePath = path.join(__dirname, 'views', 'index.html');
    serveStaticFile(res, filePath, 'text/html');

  //rota para servir arquivos JavaScript
  } else if (req.url.startsWith('/js/') && req.method === 'GET') {
    const filePath = path.join(__dirname, 'views', req.url.substring(1));
    serveStaticFile(res, filePath, 'application/javascript');

  //cadastro via POST
  } else if (req.url === '/cadastro' && req.method === 'POST') {
    parseBody(req, (params) => {
      const nome = params.get('nome');
      const cpf = params.get('cpf');

      CitizenController.addCitizen(nome, cpf, (err, result) => {
        let responseMessage = '';
        if (err || !result || !result.success) {
          responseMessage = `<h1>Erro</h1><p>${(err && err.message) || (result && result.message) || 'Erro desconhecido'}</p>`;
        } else {
          responseMessage = `
            <h1>${result.message}</h1>
            <p>Nome: ${result.citizen.nome}</p>
            <p>CPF: ${result.citizen.cpf}</p>
          `;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(responseMessage);
      });
    });

  //pesquisa de cidadãos
  } else if (req.url.startsWith('/pesquisa') && req.method === 'GET') {
    
    const urlObj = new URL(req.url, `http://localhost:${PORT}`);
    const cpf = urlObj.searchParams.get('cpf');
    const nome = urlObj.searchParams.get('nome');

    
    if (!cpf && !nome) {
      const filePath = path.join(__dirname, 'views', 'search.html');
      serveStaticFile(res, filePath, 'text/html');
    } else {
      
      if (cpf) {
        const cleanCpf = cpf.replace(/\D/g, '');
        CitizenController.findCitizenByCPF(cleanCpf, (err, citizen) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end(`<h1>Erro</h1><p>${err.message}</p>`);
          } else if (citizen) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
              <h1>Cidadão Encontrado</h1>
              <p>Nome: ${citizen.nome}</p>
              <p>CPF: ${citizen.cpf}</p>
              <a href="/pesquisa">Nova pesquisa</a>
            `);
          } else if (nome) {
           
            CitizenController.findCitizenByName(nome, (err, citizens) => {
              if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end(`<h1>Erro</h1><p>${err.message}</p>`);
              } else if (citizens && citizens.length > 0) {
                let resultHtml = '<h1>Cidadãos Encontrados</h1>';
                citizens.forEach(c => {
                  resultHtml += `<p>Nome: ${c.nome} | CPF: ${c.cpf}</p>`;
                });
                resultHtml += '<a href="/pesquisa">Nova pesquisa</a>';
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(resultHtml);
              } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                  <h1>Cidadão não encontrado</h1>
                  <a href="/pesquisa">Nova pesquisa</a>
                `);
              }
            });
          } else {
            
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
              <h1>Cidadão não encontrado</h1>
              <a href="/pesquisa">Nova pesquisa</a>
            `);
          }
        });
      } else if (nome) {
        
        CitizenController.findCitizenByName(nome, (err, citizens) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end(`<h1>Erro</h1><p>${err.message}</p>`);
          } else if (citizens && citizens.length > 0) {
            let resultHtml = '<h1>Cidadãos Encontrados</h1>';
            citizens.forEach(c => {
              resultHtml += `<p>Nome: ${c.nome} | CPF: ${c.cpf}</p>`;
            });
            resultHtml += '<a href="/pesquisa">Nova pesquisa</a>';
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(resultHtml);
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
              <h1>Cidadão não encontrado</h1>
              <a href="/pesquisa">Nova pesquisa</a>
            `);
          }
        });
      }
    }


  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Página não encontrada');
  }
});

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = server;
