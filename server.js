/**
 * Created by leart on 17-05-04.
 */
//requires
const express = require('express');
const http = require('http');
const fs = require('fs');
const socketIo = require('socket.io');
//get server ip and port synchro
const serverConfig = JSON.parse(fs.readFileSync(__dirname +'/config/server.json','utf8'));

//set server config
const severIP = serverConfig.IP;
const serverPORT = serverConfig.PORT;

var app = express();
//Create routes
require('./router')(app);
// Static content (css, js, .png, etc) is placed in /public
app.use(express.static(__dirname + '/public'));
// Location of our views
app.set('views',__dirname + '/views');

// Use ejs as our rendering engine
app.set('view engine', 'ejs');

// Tell Server that we are actually rendering HTML files through EJS.
app.engine('html', require('ejs').renderFile);

//var server = https.createServer(options, app).listen(serverPORT, severIP);
var server = http.createServer(app).listen(serverPORT, severIP);
//setup socket.io
var io = socketIo.listen(server);

// array of all lines drawn
var line_history = [];
var notes;
var notes_taken = 0;

// event-handler for new incoming connections
io.on('connection', function (socket) {

    // first send the history to the new client and old notess
    for (var i in line_history) {
        socket.emit('draw_line', line_history[i] );
    }
    socket.emit('startup', { notes: notes, notes_taken: notes_taken });

    // add handler for message type "draw_line".
    socket.on('draw_line', function (data) {
        // add received line to history
        line_history.push(data);
        // send line to all clients
        io.emit('draw_line', data);
    });

    socket.on('clear_canvas', function(){
        line_history = [];
        io.emit('clear_canvas');
    });

    socket.on('notes_taken', function(uid){
        if(notes_taken === 0){
            notes_taken = 1;
            io.emit('notes_taken', uid);
        }
    });

    socket.on('notes_free', function(){
        if(notes_taken === 1){
            notes_taken = 0;
            io.emit('notes_free');
        }
    });

    socket.on('notes_content', function(data){
        notes = data.notes;
        io.emit('notes_content', data);
    })

});