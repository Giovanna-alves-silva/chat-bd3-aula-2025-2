const express = require('express');

const http = require('http');

const socketIO = require('socket.io');

const app = express();

const server = http.createServer(app);

const io = socketIO(server);

const ejs = require('ejs');
const path = require('path')

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'public'));

app.engine('html', ejs.renderFile);

app.use('/', (req, res)=> {
    res.render('index.html');
});

/*##### LÓGICA DO SOCKET.IO - ENVIO E PROPAGAÇÃO DE MENSGAENS #####*/

//Array que simula o banco de dados:
let messages = [];

/* ESTRUTURA DE CONEXÃO DO SOCKET.IO */
io.on('connection', socket=>{

    //Teste de conexão
    console.log('NOVO USUÁRIO CONECTADO: ' + socket.id);

    //Recupera e mantém(exibe) as mensagens entre o front e o back:
    socket.emit('previousMessage', messages);

    //Lógica de chat quando uma mensagem é enviada:
    socket.on('sendMessage', data =>{

        //Adiciona a mensagem no final do array de mensagens:
        messages.push(data);

        socket.broadcast.emit('receivedMessage', data);
        console.log('QTD MENSAGENS: ' + messages.length);

    });

    console.log('QTD MENSAGENS: ' + messages.length);

});




server.listen(3000, ()=> {
    console.log('chat rodando em: http://localhost:3000')
});