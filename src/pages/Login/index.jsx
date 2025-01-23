
import React, { useState, useContext, useRef } from "react";
import "../../css/Login.css";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/auth";

export function Login() {

    const usuarioRef = useRef();
    const senhaRef = useRef();
    const [esperandoResposta, setEsperandoResposta] = useState(false);

    const {setChaveUsuario, SetarUsuario } = useContext(AuthContext);


    const fazerLogin = async (e) => {

        e.preventDefault();

        setEsperandoResposta(true);

        const usuarioAtual = usuarioRef.current.value;
        const senhaAtual = senhaRef.current.value;

        if (usuarioAtual.length < 3) {
            toast.error("O usuário deve ter no mínimo 3 caracteres.");
        }
        else if (senhaAtual.length < 6 ) {
            toast.error("A senha deve ter no mínimo 6 caracteres.");
        }
        else {

            // Espera uma resposta do servidor
            await fetch("http://localhost:3001/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    usuario: usuarioAtual,
                    senha: senhaAtual
                })
            }).then(async (resposta) => {

                // Se a resposta for OK
                if (resposta.ok) {

                    // Pega do servidor, a chave do usuário
                    const chave = await resposta.text();

                    // Gerar uma chave para o usuário
                    //const chave = gerarChave(usuarioAtual);

                    // Setar a chave do usuário
                    setChaveUsuario(chave);

                    // Setar o usuário
                    SetarUsuario(usuarioAtual);

                }
                else {
                    const mensagemErro = await resposta.text();
                    toast.error(mensagemErro);
                }
            })
            .catch(error => toast.error(error));

            
        }

        setEsperandoResposta(false);

    };

    return (

        <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100vh"}}>
        <div className="login-container">

            <h1>ChatSphere</h1>
            <h2>Antes de continuar, você precisa fornecer um usuário e senha</h2>

            <div className="login-form">

                <input type="text" placeholder="Usuário" name="usuario" autoComplete="off" className="dados" ref={usuarioRef} />

                <input type="password" placeholder="Senha" name="senha" className="dados" ref={senhaRef} />

                <button className="button" onClick={fazerLogin} disabled={esperandoResposta}>
                    Entrar
                </button>
                <Link to="/register" className="link">Crie uma conta rápida</Link>

            </div>

        </div>
        </div>

    )

}
