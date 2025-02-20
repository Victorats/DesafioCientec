const http = require('http'); //sem o uso de frameworks utilzar o nativo de http mesmo
const fs = require('fs');
const path = require('path');

const PORT = 3000;

function StaticFileHandler(res, filePath, contentType, respodeCode = 200){ //servir arquivos estáticos, lendo o arquivo e envia na resposta HTTP
    fs.readFile(filePath, (err, data) => {
        if(err){
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('Erro interno');
        }else{
            res.writeHead(respodeCode, {'Content-Type': contentType});
            res.end(data);
        }
    });
}

const server = http.createServer((req, res) => {//define um callback executado para cada requisição que chegar

    if(req.url === '/'){
        const filePath = path.join(__dirname,'views', 'index.html');
        StaticFileHandler(res, filePath, 'text/html');
    }else{
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Página não encontrada');
    }
});

server.listen(PORT, () => { //inicia o servidor na porta
    console.log('Servidor rodando na porta ${PORT}');
});
