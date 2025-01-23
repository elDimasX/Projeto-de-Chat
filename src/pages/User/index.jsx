
import { useParams } from "react-router-dom"
import React, { useEffect, useState } from "react"
import { url } from "../url"
import { toast } from "react-toastify";

export function User()
{

    const [info, setInfo] = useState({});
    const { usuarioNome } = useParams();

    const obterInformacoes = async () => {

        await fetch(`${url}/user/${usuarioNome}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(async (resposta) => {

            if (resposta.ok) 
            {
                const chave = await resposta.json();
    
                setInfo(chave);
            }
            else {
    
                const error = await resposta.text();
                setInfo({ error: error });
            }
        })
        .catch(error => toast.error(error));

    };

    useEffect(() => {

        if (usuarioNome) {
            obterInformacoes();  // Chama a função apenas se o nome de usuário estiver presente
        }

    }, [usuarioNome]);

    return (

        <div>
            

             {info ? (

                <>

                    {
                        info.data ? (

                            <div>
                                Nome de usuário: {usuarioNome}<br/>
                                Data criada: {info.data}
                            </div>
                        ) : (
                            <p>{info.error}</p>
                        )
                    }
                </>
            ) : (
                <p>Carregando...</p>
            )}

        </div>

    )

}
