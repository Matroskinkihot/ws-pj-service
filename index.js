import express from 'express';
import http from 'http';
import path from 'path';
import WebSocket, { WebSocketServer as WSWebSocketServer } from 'ws';

const app = express();
const port = 3000;
const server = http.createServer(app);
const wss = new WSWebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const messageJson = JSON.parse(message);
    const user = messageJson.username;

    if (user.length !== undefined && user.length > 0) {
      ws.clientData = {};
      ws.clientData.username = user;
    }
  });
});

app.get('/client/:id', (req, res) => {
  res.sendFile(path.resolve(__dirname, `./public/client-${req.params.id}.html`));
});

app.get('/external-api', (req, res) => {
  let reqUsername = req.query.username;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      // console.log('client ->', JSON.stringify(client.clientData))
      client.send('example@example.com');
      if (client.clientData.username === reqUsername) {
        client.send(JSON.stringify(req.query));
      }
    }
  });
  res.sendStatus(200);
});

server.listen(port, () => console.log(`http server is listening on http://localhost:${port}`));

// const express = require('express')
// const app = express()
// const port = 3000
// const WebSocket = require('ws')

// const wss = new WebSocket.Server({ server: app })
// console.log(wss)
// wss.on('connection', function connection(ws) {
//     ws.on('message', function message(data) {
//       console.log('received: %s', data);
//     });
  
//     ws.send('something');
//   });

// app.get('/', (req, res) => {
//   res.send('Hello World2!')
// })

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })