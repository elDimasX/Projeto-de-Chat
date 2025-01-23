
const express = require("express");
const router = express.Router();

const { db } = require("../firebase");

function converterData(created) {
    const timestampInMillis = created._seconds * 1000;
    const timestampWithNanoseconds = timestampInMillis + created._nanoseconds / 1000000;
    const date = new Date(timestampWithNanoseconds);
  
    // Extrai os componentes da data
    const day = String(date.getDate()).padStart(2, '0');  // Dia com dois dígitos
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Mês com dois dígitos
    const year = date.getFullYear();  // Ano
    const hours = String(date.getHours()).padStart(2, '0');  // Hora com dois dígitos
    const minutes = String(date.getMinutes()).padStart(2, '0');  // Minutos com dois dígitos
    const seconds = String(date.getSeconds()).padStart(2, '0');  // Segundos com dois dígitos
  
    // Retorna no formato "dd/mm/yyyy, hh:mm:ss"
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
}

router.get("/user/:usuarioNome", (req, res, next) => {

    const usuarioNome = req.params.usuarioNome;

    db.collection("usuarios")
    .doc(usuarioNome)
    .get()
    .then((doc) => {

        if (!doc.exists)
        {
            return res.status(404).send("Usuário não existe");
        }
        else {

            // Pegue as informações
            const usuarioData = doc.data();

            if (usuarioData.perfilVisivel === false)
            {
                return res.status(404).send("Usuário não existe");
            }

            const dadosEnviar = {
                data: converterData(usuarioData.created),
            };

            return res.status(200).send(JSON.stringify(dadosEnviar));

        }



    });

});

router.post("/user/save", (req, res, next) => {


    const chaveUsuario = req.body.chaveUsuario;
    const perfilVisivel = req.body.perfilVisivel;
    const usuarioNome = req.body.usuarioNome;

    db.collection("usuarios")
    .doc(usuarioNome)
    .get()
    .then((doc) => {

        if (!doc.exists)
        {
            return res.status(403).send("Proibido 1!");
        }

        const usuarioData = doc.data();

        if (usuarioData.usuarioChave !== chaveUsuario)
        {
            return res.status(403).send("Proibido 2!");
        }

        return doc.ref.update({
            perfilVisivel: perfilVisivel
        }).then(() => {

            return res.status(200).send("");

        }).catch(error => res.status(500).send(error));

    });

});

module.exports = router;
