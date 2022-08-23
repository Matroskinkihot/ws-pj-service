import express from 'express';
import https from 'https';
import path from 'path';
import fs from 'fs';
import WebSocket, { WebSocketServer as WSWebSocketServer } from 'ws';

const privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
const certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
const credentials = {key: privateKey, cert: certificate};
const app = express();
const port = 3000;
const server = https.createServer(credentials, app);
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

app.get('/api', (req, res) => {
  let reqUsername = req.query.username;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send('example@example.com');
      if (client.clientData.username === reqUsername) {
        client.send(JSON.stringify(req.query));
      }
    }
  });
  res.sendStatus(200);
});

server.listen(port, () => console.log(`http server is listening on http://localhost:${port}`));