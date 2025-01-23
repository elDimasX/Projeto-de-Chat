import React, { useState, useEffect, useContext, useRef } from "react";
import { toast } from "react-toastify";
import { FaPaperPlane, FaTrash, FaBars } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/auth";
import "../../css/Chat.css";
import { Login } from "../Login";
import { url } from "../url"

export function Chat() {

    // Função para formatar o timestamp
    function formatTimestamp(timestamp) {

        // Convertendo segundos para milissegundos
        const date = new Date(timestamp._seconds * 1000); 

         // Retorna a data formatada (ex: "02/07/2023, 15:42:21")
        return date.toLocaleString();
    }

    const [mensagens, setMensagens] = useState([]);
    const [mensagem, setMensagem] = useState("");
    const chatNome = useRef();

    const [aberto, setAberto] = useState(false);
    const [chatAtual, setChatAtual] = useState("conversas");
    const [chats, setChats] = useState([]);

    const navegar = useNavigate();

    const { carregando, setCarregando, usuario, chaveUsuario } = useContext(AuthContext);

    // Configurar WebSocket para receber mensagens em tempo real
    useEffect(() => {

        if (!carregando && usuario === null) {
            toast.error("Você precisa estar logado para acessar o ChatSphere!");
            return;
        }
        else if (carregando && usuario !== null) {

            toast.success("Bem-vindo ao ChatSphere! Os chats podem ser apagados a qualquer momento.");

        }
        
        todosOsChats();

        const urlParams = new URLSearchParams(window.location.search); // Usar window.location.search
        const canal = urlParams.get("canal") || "conversas"; // Definir o canal padrão como 'conversas'

        setChatAtual(canal); // Atualizar o estado do chat atual

        // Usando 'let' para poder reatribuir
        let socket;
        socket =  new WebSocket(`ws://localhost:3001/?canal=${canal}&usuarioChave=${chaveUsuario}`); 
        
        socket.onmessage = (event) => {

            const data = JSON.parse(event.data);

            if (data.type === "REDIRECT") {

                toast.info(`Canal deletado: ${chatAtual}.`);

                // Redireciona o cliente para a URL recebida
                navegar(`/chat/`, { replace: true });
                setAberto(false);
                setMensagens([]);
                setCarregando(true);

            } 
            else if (data.type === "NEW CHANNEL")
            {
                todosOsChats();
            }
            else {
                // Lógica para tratar mensagens normais
                setMensagens(data);
            }
        };

        // Limpeza do WebSocket ao desmontar o componente
        return () => socket.close();
    }, [carregando, usuario]);

    const todosOsChats = async () => {
        setChats([]);

        await fetch(`${url}/chats?chaveUsuario=${chaveUsuario}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(async (resposta) => {

            if (resposta.ok)
            {
                const chatsRes = await resposta.json();
                console.log(chatsRes.collections);

                setChats(chatsRes.collections);
                console.log(chats);

            }

        }).catch(error => toast.error(error));

    };

    // Função para enviar mensagem
    const enviarMensagem = async (e) => {

        e.preventDefault();
        
        if (mensagem === "") {
            toast.error("Digite uma mensagem para enviar!");
            return;
        }
        else if (
            mensagem.length > 60
        ) {
            toast.error("A mensagem é muito longa. Máximo de 60 caracteres.");
            return;
        }

        // Enviar a mensagem para o backend via POST
        await fetch(`${url}/data`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                mensagem,
                usuario: usuario || "Anônimo",
                usuarioChave: chaveUsuario,
                canal: chatAtual
            })
        })
        .then(async (resposta) => {

            if (resposta.ok) {
                setMensagem(""); // Limpar o campo de input
            } else {
                const mensagemErro = await resposta.text();
                toast.error(
                    <>
                    {mensagemErro}
                    </>
                );
            }
        })
        .catch(error => toast.error(error));

        
    };

    const deletarMensagem = async (id) => {

        // Enviar a mensagem para o backend via DELETE
        const response = await fetch(`${url}/data/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                usuarioChave: chaveUsuario,
                canal: chatAtual
            })
        });

        if (response.ok)
        {
            toast.success("Mensagem deletada com sucesso!");
        }
        else {
            
            toast.error("Erro ao deletar mensagem.");
        }
    };

    const trocarChat = (e) => {
        e.stopPropagation();
        setAberto(false);
        setMensagens([]);
        setCarregando(true);
    };

    const criarChat = async () => 
    {

        const canal = chatNome.current.value;

        await fetch(`${url}/chats`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usuarioChave: chaveUsuario,
                nomeCanal: canal
            })
        }).then(async (resposta) => {


            if (resposta.ok)
            {
                navegar(`/chat/?canal=${canal}`, { replace: true });
                setAberto(false);
                setMensagens([]);
                setCarregando(true);
            } else {

                const mensagemErro = await resposta.text();
                toast.error(mensagemErro);

            }

        }).catch(error => toast.error(error));

    };

    const deletarChat = async (e) => 
    {

        if (window.confirm(`Você tem certeza de que deseja deletar o chat ${e}?`) == true)
        {
            await fetch(`${url}/chats`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    usuarioChave: chaveUsuario,
                    nomeCanal: e
                })
            }).then(async (resposta) => {

                
                if (resposta.ok){

                    toast.success("Canal deletado com sucesso! Todos os usuários conectados nele não poderão enviar ou receber mensagens. Pode levar um tempo até o canal sumir para todos.");
                }
                else {

                    const respostaTexto = await resposta.text();

                    toast.error(respostaTexto);
                }

            }).catch(error => toast.error(error));
        }
        else {

        }

    };

    function mostrarBars(e)
    {
        e.stopPropagation(); // Impede a propagação do clique para "onlineChat"
        setAberto(true);
    }

    function ocultarBars(e)
    {
        e.stopPropagation();
        setAberto(false);
    }


    return (

        <div className="onlineChat" onClick={ocultarBars}>
        {usuario === null ? (
            
            <Login/>
            
        ) : (
            <>
            <div className="todasAsConversas">

                <div className="descricao">
                    <i>Você está no chat <b>{chatAtual}</b>.</i>
                </div>

                {mensagens.map((item, key) => (
                <div key={key} className="mensagensUsuarios">

                    <p><Link to={`/user/${item.usuario}`}>{item.usuario}</Link> -</p>
                    <p>{item.mensagem}</p>
                    <div className="info">
                        <p><small>Enviado em: {formatTimestamp(item.created)}</small></p>

                        {
                            /* Botão para deletar a mensagem */
                            item.podeDeletar === true ? (
                                <button className="deletar" aria-label="Deletar mensagem" onClick={() => deletarMensagem(item.id)}><FaTrash/></button>
                            ) : null
                        }
                    </div>
                </div>
                ))}
            </div>

            <div className={`ocultarTudo ${aberto ? "aberto" : ""}`}>
                <div className={`chatsLinks ${aberto ? "aberto" : ""}`} onClick={mostrarBars}>

                    <i>Chats criado pelos usuários</i>

                    {chats.map((item, key) => {
                        return (
                            <div className="canal">
                                

                                <Link to={`/chat/?canal=${item.name}`} onClick={trocarChat} className="link">{item.name}</Link>
                                {item.okDelete ? <FaTrash onClick={() => deletarChat(item.name)} size={15}></FaTrash> : null}
                                
                            </div>
                        )
                    })}

                    <div className="criarChat">
                        <input type="text" className="dados" placeholder="Nome da sala de chat" ref={chatNome} onChange={(e) => chatNome.current.value = e.target.value}/>
                        <button className="button" onClick={criarChat}>Criar Chat</button>
                    </div>

                </div>
            </div>
            

            <div className="input">

                <div className="alinharInputs">

                    <FaBars onClick={mostrarBars}></FaBars>

                    <div className="usuarioLink">
                        <Link to="/profile" className="link">{usuario}</Link>
                    </div>
                
                    <input type="text" placeholder="Digite sua mensagem" value={mensagem} onChange={(e) => setMensagem(e.target.value)}/>

                    <button onClick={enviarMensagem}>
                        <FaPaperPlane />
                    </button>
                </div>
            </div>
            </>
        )}
        </div>
    );
}
