
// Express
const express = require("express");

// Router para o middleware
const router = express.Router();

const { db } = require("../firebase");

router.post("/login", (req, res) => {

    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.status(400).send("Usuário e senha são obrigatórios.");
    }

    if (senha.length < 6) {
        return res.status(400).send("A senha deve ter no mínimo 6 caracteres.");
    }

    // Verificar se o usuário já existe
    db.collection("usuarios")
    .doc(usuario) // Acessa o documento com o nome do usuário
    .get()
    .then((doc) => {

        // Se o documento não existir
        if (!doc.exists) {
            return res.status(400).send("Usuário ou senha inválidos.");
        }

        // Pega os dados do usuário
        const usuarioData = doc.data();

        // Comparar a senha (assumindo que esteja em texto puro no banco)
        if (usuarioData.senha === senha) {
            const usuarioChave = usuarioData.usuarioChave;

            // Se o usuário existe e a senha está correta, envie a resposta de sucesso
            return res.status(200).send(usuarioChave);

        } else {

            // Acesso negado
            return res.status(400).send("Usuário ou senha inválidos.");
        }
    })
    .catch((error) => {

        // Retorna status 500
        console.error("Erro ao verificar o usuário:", error);
        res.status(500).send("Erro interno do servidor.");
    });
});

module.exports = router;
