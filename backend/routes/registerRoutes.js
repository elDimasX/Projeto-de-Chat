
const express = require("express");

const router = express.Router();

const { db, admin } = require("../firebase");

const crypto = require('crypto');

// Função para gerar uma chave segura
function gerarChave() {
    return crypto.randomBytes(16).toString('hex');
}


router.post("/register", async (req, res) => {

    const { usuario, senha } = req.body;

    if (usuario.length < 3) {
        res.status(400).send("O usuário deve ter no mínimo 3 caracteres.");
    }
    else if (senha.length < 6) {
        res.status(400).send("A senha deve ter no mínimo 6 caracteres.");
    }
    else if (usuario.length > 15)
    {
        res.status(400).send("O usuário deve ter no máximo 15 caracteres.");
    }
    else if (senha.length > 25)
    {
        res.status(400).send("A senha deve ter no máximo 25 caracteres.");
    }
    else {

        const usuarioRef = db.collection("usuarios").doc(usuario);

        const doc = await usuarioRef.get();

        if (doc.exists) {

            // 409 Conflict
            return res.status(409).send("O usuário já existe.");
        }
        else {

            const chave = gerarChave();

            await usuarioRef.set({
                senha: senha,
                usuarioChave: chave,
                perfilVisivel: false,
                created: admin.firestore.FieldValue.serverTimestamp()
            });


            return res.status(200).send(chave);
        }
    }

});

module.exports = router;
