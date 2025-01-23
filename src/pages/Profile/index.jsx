
import React, { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "../../css/Profile.css"
import { AuthContext } from "../../contexts/auth"
import { toast } from "react-toastify"
import { url } from "../url"

export function Profile()
{
    const { usuario, carregando, chaveUsuario } = useContext(AuthContext);

    const [alterado, setAlterado] = useState(false);
    const navigate = useNavigate();

    const carregarPerfilWeb = async () => {

        const resposta = await fetch(`${url}/user/${usuario}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (resposta.ok) 
        {
            document.getElementById("morning").checked = true;
        }
        else {

            document.getElementById("morning").checked = false;
        }

    };

    useEffect(() => {

        if (!carregando)
        {
            if (!usuario)
            {
                navigate("/chat");
            }
            else {

                carregarPerfilWeb();
            }
        }

    }, [carregando, usuario]);

    const mudarAlgo = () => {

        setAlterado(true);
    }

    const salvarAlteracoes = async () => {


        await fetch(`${url}/user/save`, {
         
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                chaveUsuario: chaveUsuario,
                perfilVisivel: document.getElementById("morning").checked,
                usuarioNome: usuario
            })

        }).then(async (resposta) => {

            if (resposta.ok)
            {
                toast.success("Alterações salvas com sucesso!");
                setAlterado(false);
            }
            else {
                
                const mensagemErro = await resposta.text();
                toast.error(mensagemErro);
            }
        })
        .catch(error => toast.error(error));
        
    }


    return (


        <div className="perfil-container">

            <div className="perfil">

                {
                    !carregando ? (

                        <>
                            <h2>Bem-vindo ao seu perfil</h2>

                            <h3>Usuário: </h3>
                            <input type="text" className="dados" value={usuario} readOnly disabled/>

                            <div class="checkbox-wrapper-4">
                                <input class="inp-cbx" id="morning" type="checkbox" onChange={mudarAlgo}/>
                                <label class="cbx" for="morning"><span>
                                <svg width="12px" height="10px">
                                    <use href="#check-4"></use>
                                </svg></span><span>Perfil visível para os outros</span></label>
                                <svg class="inline-svg">
                                    <symbol id="check-4" viewbox="0 0 12 10">
                                    <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                                    </symbol>
                                </svg>
                            </div>

                            <button className="button" disabled={!alterado} onClick={salvarAlteracoes}>
                                Salvar modificações
                            </button>
                        </>
                    ) : (

                        <h1>Carregando perfil...</h1>
                    )

                }

            </div>

        </div>

    )

}
