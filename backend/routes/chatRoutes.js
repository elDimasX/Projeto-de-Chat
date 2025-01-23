
// Express
const express = require("express");

// Websocket
const WebSocket = require("ws");

// Pegue os clientes
const { clients, todosOsClientes } = require("../clientsSocket");

// Router
const router = express.Router();

const { admin, db } = require("../firebase");

// Rota para adicionar uma mensagem
router.post("/data", async (req, res) => {
    try {
        // Pegar os dados da requisição
        const { mensagem, usuario, usuarioChave, canal } = req.body;

        // Verificar se a mensagem, usuário e canal foram enviados
        if (!mensagem || !usuario || !usuarioChave || !canal) {
            return res.status(400).send("Mensagem, usuário e canal são obrigatórios.");
        }

        // Verificar se a mensagem é muito longa
        if (mensagem.length > 60) {
            return res.status(400).send("A mensagem é muito longa. Máximo de 60 caracteres.");
        }

        const docRef = db.collection(canal).doc("configuracoes");
        const doc = await docRef.get();


        db.collection("usuarios").doc(usuario).get().then(doc => {

            // Se não existir o documento nos usuários, com esse nome, significa que o usuário não alterou o nome no request
            if (!doc.exists) {
                return res.status(400).send("Usuário ou senha inválidos.");
            }

            // Adicionar a mensagem à coleção correspondente ao canal
            db.collection(canal).add({
                mensagem,
                usuario,
                usuarioChave,
                created: admin.firestore.FieldValue.serverTimestamp(),
            })
            .then((docRef) => {
                // Enviar o ID da mensagem e o status 201 (Created)
                return res.status(201).json({ status: "Sucesso"/*"docRef.id"*/ });
            })
            .catch((error) => { 
                console.error("Erro ao adicionar mensagem:", error);
                return res.status(500).send("Erro ao adicionar dados.");
            });

        }).catch(error => {

            return res.status(500).send("Erro interno.");
        });


        

    } catch (error) {
        // Se houver um erro, logar e enviar o status 500 (Internal Server Error)
        console.error("Erro ao adicionar dados:", error);
        res.status(500).send("Erro ao adicionar dados.");
    }
});

// Rota para deletar uma mensagem
router.delete("/data/:id", async (req, res) => {

    try {

        // Pegar a chave do usuário da requisição
        const { usuarioChave, canal } = req.body;

        // Pegar o ID da mensagem para deletar a mensagem correta
        const id = req.params.id;

        if (!usuarioChave) {
            return res.status(400).send("Usuário e mensagem são obrigatórios.");
        }

        // Pegar a mensagem do Firestore através do ID
        const doc = await db.collection(canal).doc(id).get();

        // Verificar se a mensagem existe
        if (!doc.exists) {
            return res.status(404).send("Mensagem não encontrada.");
        }

        // Verificar se o usuário é o mesmo que enviou a mensagem. Se não for, enviar o status 403 (Forbidden)
        if (doc.data().usuarioChave !== usuarioChave) {
            return res.status(403).send("Usuário não autorizado.");
        }

        // Deletar a mensagem
        await db.collection(canal).doc(id).delete();

        // Enviar o status 204 (No Content)
        res.status(204).send("Mensagem deletada com sucesso.");
    } catch (error) {

        // Se houver um erro, logar e enviar o status 500 (Internal Server Error)
        console.error("Erro ao deletar dados:", error);
        res.status(500).send("Erro ao deletar dados");
    }
});

// Rota que pega todos os chats que foram criados
router.get("/chats", async (req, res, next) => {
    try {
        // Obter chave do usuário dos parâmetros da URL
        const urlParams = new URLSearchParams(req.url.split("?")[1]);
        const chaveUsuario = urlParams.get("chaveUsuario") || "default";

        // Listar todas as coleções de nível superior
        const collections = await db.listCollections();

        const collectionsPromises = collections.map(async (collection) => {
            const collectionName = collection.id;

            // Ignorar a coleção "usuarios"
            if (collectionName !== "usuarios") {
                try {
                    // Acessar o documento 'configuracoes' dentro da coleção atual
                    const configDoc = await db
                        .collection(collectionName)
                        .doc("configuracoes")
                        .get();

                    if (configDoc.exists) {

                        const data = configDoc.data();

                        // Verificar se o documento existe e se 'canalVisivel' está marcado como verdadeiro
                        if (data?.canalVisivel === true) {
                            const permitido = data?.usuarioChave === chaveUsuario;

                            return {
                                name: collectionName,
                                okDelete: permitido,
                            };
                        }
                    }
                } catch (error) {
                    console.error(`Erro ao acessar configurações na coleção ${collectionName}:`, error);
                    return null; // Retorna null em caso de erro
                }
            }

            return null; // Ignorar a coleção "usuarios"
        });

        // Resolver todas as promessas e filtrar resultados válidos
        const collectionsInfo = (await Promise.all(collectionsPromises)).filter(Boolean);

        // Retornar a resposta com as coleções processadas
        res.status(200).json({
            collections: collectionsInfo,
        });
    } catch (error) {
        console.error("Erro ao pegar coleções:", error);
        res.status(500).send("Erro ao pegar coleções");
    }
});


// Rota que cria canais de comunicação
router.post("/chats", async (req, res, next) => {

    try {

        const { nomeCanal, usuarioChave } = req.body;

        if (!nomeCanal || !usuarioChave)
        {
            return res.status(403).send("Todos os campos são obrigatórios");
        }

        const docRef = db.collection(nomeCanal).doc("configuracoes");

        const doc = await docRef.get();

        // Se existir
        if (doc.exists) {

            // Conflict
            return res.status(409).send("O canal já existe.");
        } else {

            todosOsClientes.forEach(ws => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: "NEW CHANNEL"
                    }));
                }
            });

            await db.collection(nomeCanal).doc("configuracoes").set(
            {
                usuarioChave: usuarioChave,
                canalVisivel: true,
                created: admin.firestore.FieldValue.serverTimestamp(),
            }).then(() => {

                

                return res.status(201).send("Sucesso");
            }).catch((error) => {

                return res.status(500).send(error);
            });
        }
        

    } catch (error)
    {
        console.error("Erro ao pegar coleções:", error);
        return res.status(500).send("Erro ao pegar coleções");
    }


});

// Rota que deleta o chat
router.delete("/chats", async (req, res, next) => {

    try {

        const { nomeCanal, usuarioChave } = req.body;

        if (!nomeCanal || !usuarioChave)
        {
            return res.status(403).send("Todos os campos são obrigatórios");
        }

        const docRef = db.collection(nomeCanal).doc("configuracoes");
        const doc = await docRef.get();

        // Verificar se o canal existe
        if (!doc.exists) {
            return res.status(404).send("Canal não encontrado.");
        }

        // Verificar se o usuário é o mesmo que criou o canal. Se não for, negue.
        if (doc.data().usuarioChave !== usuarioChave) {
            return res.status(403).send("Usuário não autorizado.");
        }

        docRef.update({

            canalVisivel: false
        });

        // Fechar todas as conexões WebSocket associadas ao canal
        if (clients.has(nomeCanal)) {
            const clientSet = clients.get(nomeCanal);

            clientSet.forEach(ws => {

                ws.send(JSON.stringify({
                    type: "REDIRECT",
                    url: "/conversas" // A URL para onde os clientes devem ser redirecionados
                }));

                ws.close(1000, "Canal deletado pelo administrador."); // Fechar o WebSocket com código 1000 (normal closure)
            });

            // Remover o canal do mapa de clientes
            clients.delete(nomeCanal);
            console.log(`Conexões WebSocket para o canal "${nomeCanal}" foram fechadas.`);
        }

        return res.status(200).send("Canal deletado com sucesso.");

    } catch (error) {

        console.log(error);
        res.status(500).send("Erro.");
    }

});

// Exportar o router
module.exports = router;
