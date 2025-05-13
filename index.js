const express = require('express');

const http = require('http');

const socketIO = require('socket.io');

const app = express();

const server = http.createServer(app);

const io = socketIO(server);

const mongoose = require('mongoose');

const ejs = require('ejs');
const path = require('path');
const { stringify } = require('querystring');
const { error } = require('console');

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'public'));

app.engine('html', ejs.renderFile);

app.use('/', (req, res)=> {
    res.render('index.html');
});

function connectDB() {

    let dbURL = 'mongodb+srv://Dona_gigi:Donagigialves@cluster0.qjrnc.mongodb.net/';

    mongoose.connect(dbURL);

    mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

    mongoose.connection.once('open', function(){
        console.log('ATLAS MONGO DB CONECTADO COM SUCESSO!');
    });
}

connectDB();

let Message = mongoose.model('Message', {usuario:String, data_hora: String, message:String});

/*##### LÓGICA DO SOCKET.IO - ENVIO E PROPAGAÇÃO DE MENSGAENS #####*/

//Array que simula o banco de dados:
let messages = [];

Message.find({})
    .then(docs=>{
        messages = docs
    }).catch(error=>{
        console.log(error);
    });

/* ESTRUTURA DE CONEXÃO DO SOCKET.IO */
io.on('connection', socket=>{

    //Teste de conexão
    console.log('NOVO USUÁRIO CONECTADO: ' + socket.id);

    //Recupera e mantém(exibe) as mensagens entre o front e o back:
    socket.emit('previousMessage', messages);

    //Lógica de chat quando uma mensagem é enviada:
    socket.on('sendMessage', data =>{

        //Adiciona a mensagem no final do array de mensagens:
        //messages.push(data);
        let message = new Message(data);

        message.save()
            .then(
                socket.broadcast.emit('receivedMessage', data)
            )
            .catch(error=>{
                console.log(error);
            });
        
        console.log('QTD MENSAGENS: ' + messages.length);

    });

    console.log('QTD MENSAGENS: ' + messages.length);

});




server.listen(3000, ()=> {
    console.log('chat rodando em: http://localhost:3000')
});