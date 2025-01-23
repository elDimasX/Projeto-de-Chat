
import React, { useState, useContext, useRef } from "react";
import "../../css/Login.css";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/auth";
import { url } from "../url";

export function Register() {

    const usuarioRef = useRef();
    const senhaRef = useRef();
    const confirmacaoSenhaRef = useRef();
    const [esperandoResposta, setEsperandoResposta] = useState(false);

    const navigate = useNavigate();

    const { setChaveUsuario, SetarUsuario } = useContext(AuthContext);


    const criarConta = async (e) => {

        e.preventDefault();

        setEsperandoResposta(true);

        const usuarioAtual = usuarioRef.current.value;
        const senhaAtual = senhaRef.current.value;
        const confirmacaoSenhaAtual = confirmacaoSenhaRef.current.value;

        if (usuarioAtual.length < 3) {
            toast.error("O usuário deve ter no mínimo 3 caracteres.");
        }
        else if (senhaAtual.length < 6 ) {
            toast.error("A senha deve ter no mínimo 6 caracteres.");
        }
        else if (usuarioAtual.length > 15) {
            toast.error("O usuário deve ter no máximo 15 caracteres.");
        }
        else if (senhaAtual.length > 25 ) {
            toast.error("A senha deve ter no máximo 25 caracteres.");
        }
        else if (senhaAtual !== confirmacaoSenhaAtual) {
            toast.error("As senhas não coincidem.");
        }
        else {

            // Espera uma resposta do servidor
            await fetch(`${url}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    usuario: usuarioAtual,
                    senha: senhaAtual,
                    perfilVisivel: false
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

                    navigate("/chat");
                }
                else {
                    const mensagemErro = await resposta.text();
                    toast.error(mensagemErro);
                }

            }).catch(error => {
                
                toast.error(error);

            });
        }

        setEsperandoResposta(false);


    };

    return (

        <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", textAlign: "center"}}>
        <div className="login-container">

            <h1>ChatSphere</h1>
            <h2>Crie uma conta sem email, para armazenas suas conversas.<br/>Vai ser rapidinho.</h2>

            <div className="login-form">

                <input type="text" placeholder="Usuário" name="usuario" autoComplete="off" className="dados" ref={usuarioRef} />

                <input type="password" placeholder="Senha" name="senha" className="dados" ref={senhaRef} />

                <input type="password" placeholder="Confirme a senha" name="confirmacaoSenha" className="dados" ref={confirmacaoSenhaRef} />

                <button className="button" onClick={criarConta} disabled={esperandoResposta}>
                    Criar conta e iniciar
                </button>

                <Link to="/chat" className="link">Ou faça login</Link>

            </div>

        </div>
        </div>

    )

}
