const http = require('http');
const fs = require('fs');
const path = require('path');
const CitizenControllerClass = require('./controllers/citizenController');
const citizenRepository = require('./repositories/citizenRepository');
const CPFValidator = require('./utils/cpfValidator');

//instanciando o controller com injeção de dependências
const citizenController = new CitizenControllerClass(citizenRepository, CPFValidator);

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

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(new URLSearchParams(body));
    });
    req.on('error', err => reject(err));
  });
}

const server = http.createServer((req, res) => {
  (async () => {
    //rota para pagina de cadastro
    if (req.url === '/' && req.method === 'GET') {
      const filePath = path.join(__dirname, 'views', 'index.html');
      serveStaticFile(res, filePath, 'text/html');
      return;
    }

    if (req.url.startsWith('/js/') && req.method === 'GET') {
      const filePath = path.join(__dirname, 'views', req.url.substring(1));
      serveStaticFile(res, filePath, 'application/javascript');
      return;
    }
    

    //rota de cadastro com post
    if (req.url === '/cadastro' && req.method === 'POST') {
      try {
        const params = await parseBody(req);
        const nome = params.get('nome');
        const cpf = params.get('cpf');
        const result = await citizenController.addCitizen(nome, cpf);
        const responseMessage = `
          <h1>${result.message}</h1>
          <p>Nome: ${result.citizen.nome}</p>
          <p>CPF: ${result.citizen.cpf}</p>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(responseMessage);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`<h1>Erro</h1><p>${err.message}</p>`);
      }
      return;
    }

    //rota de pesquisar pelo cidadao
    if (req.url.startsWith('/pesquisa') && req.method === 'GET') {
      const urlObj = new URL(req.url, `http://localhost:${PORT}`);
      const cpf = urlObj.searchParams.get('cpf');
      const nome = urlObj.searchParams.get('nome');

      if (!cpf && !nome) {
        const filePath = path.join(__dirname, 'views', 'search.html');
        serveStaticFile(res, filePath, 'text/html');
      } else if (cpf) {
        const cleanCpf = cpf.replace(/\D/g, '');
        try {
          const citizen = await citizenController.findCitizenByCPF(cleanCpf);
          if (citizen) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
              <h1>Cidadão Encontrado</h1>
              <p>Nome: ${citizen.nome}</p>
              <p>CPF: ${citizen.cpf}</p>
              <a href="/pesquisa">Nova pesquisa</a>
            `);
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
              <h1>Cidadão não encontrado</h1>
              <a href="/pesquisa">Nova pesquisa</a>
            `);
          }
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end(`<h1>Erro</h1><p>${err.message}</p>`);
        }
      } else if (nome) {
        try {
          const citizens = await citizenController.findCitizenByName(nome);
          if (citizens && citizens.length > 0) {
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
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end(`<h1>Erro</h1><p>${err.message}</p>`);
        }
      }
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Página não encontrada');
  })().catch(err => {
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`<h1>Erro</h1><p>${err.message}</p>`);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = server;
