
const admin = require("firebase-admin");

// Inicialização do Firebase
admin.initializeApp({
    credential: admin.credential.cert(require("./firebaseConfig.json"))
});

// Inicialização do Firestore
const db = admin.firestore();

// Exporte o banco de dados
module.exports = { admin, db};

