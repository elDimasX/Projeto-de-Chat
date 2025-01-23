
// Express
const express = require("express");

// Body Parser
const bodyParser = require("body-parser");

// Cors
const cors = require("cors");

// Firebase
const { db } = require("./firebase");

// Websocket
const WebSocket = require("ws");


const { clients, todosOsClientes, channelConfigs } = require("./clientsSocket");

/*
// Função de broadcast otimizada, usando Set (chatgpt)
function broadcast(chatCanal, messages) {
  const clientSet = clients.get(chatCanal) || new Set();
  for (const client of clientSet) {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(messages));
    }
  }
}
*/

// Rotas
const chatRoutes = require("./routes/chatRoutes");
const loginRoutes = require("./routes/loginRoutes");
const registerRoutes = require("./routes/registerRoutes");
const userInfo = require("./routes/userInfo");

// Inicialização do Express
const app = express();

// Use o body-parser para analisar o corpo das requisições
app.use(bodyParser.json());

// Use o CORS para permitir requisições de outros domínios
app.use(cors(
  ["http://localhost:3000"],
  ["http://localhost:3001"]
));

// Configuração do WebSocket
const wss = new WebSocket.Server({ noServer: true });

// Configurar conexão WebSocket
wss.on("connection", async (ws, request) => {
  try {
    const urlParams = new URLSearchParams(request.url.split("?")[1]);
    const chatCanal = urlParams.get("canal") || "conversas";
    const usuarioChave = urlParams.get("usuarioChave") || "vazio";

    // Associar o usuarioChave ao cliente WebSocket
    ws.usuarioChave = usuarioChave;

    const docRef = db.collection(chatCanal).doc("configuracoes");
    const doc = await docRef.get();

    if (!doc.exists || doc.data().canalVisivel === false) {
      ws.close();
      return;
    }
    

    if (!clients.has(chatCanal)) {
      clients.set(chatCanal, new Set());
    }

    const clientSet = clients.get(chatCanal);

    clientSet.add(ws);

    // Adicionar ao Set global
    todosOsClientes.add(ws);

    console.log(`Cliente conectado ao canal: ${chatCanal}`);

    const q = db.collection(chatCanal)
      .orderBy("created", "desc")
      .limit(20);

    const unsubscribe = q.onSnapshot(snapshot => {
      const rawMessages = snapshot.docs.filter(doc => doc.id !== "configuracoes").map(doc => ({
        id: doc.id,
        mensagem: doc.data().mensagem,
        usuario: doc.data().usuario,
        usuarioChave: doc.data().usuarioChave, // Usado apenas internamente
        created: doc.data().created,
      }));

      // Enviar mensagens personalizadas para cada cliente
      clientSet.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          const personalizedMessages = rawMessages.map(msg => ({
            id: msg.id,
            mensagem: msg.mensagem,
            usuario: msg.usuario,
            created: msg.created,
            podeDeletar: msg.usuarioChave === client.usuarioChave, // Verificação individual
          }));

          client.send(JSON.stringify(personalizedMessages));
        }
      });
    });

    ws.on("close", () => {
      console.log(`Cliente desconectado do canal: ${chatCanal}`);

      clientSet.delete(ws);

      // Remover do Set global
      todosOsClientes.delete(ws);

      if (clientSet.size === 0) {
        unsubscribe();
        clients.delete(chatCanal);
      }
    });

    ws.on("error", (err) => {
      console.error("Erro no WebSocket:", err);
    });
  } catch (err) {
    console.error("Erro ao configurar conexão:", err);
    ws.close();
  }
});


// Configuração do servidor HTTP para aceitar WebSockets
app.server = app.listen(3001, () => {
  console.log(`Servidor rodando na porta 3001`);
});

// Configuração do upgrade para WebSocket
app.server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
  });
});


// Use as rotas
app.use(chatRoutes);
app.use(loginRoutes);
app.use(registerRoutes);
app.use(userInfo);
