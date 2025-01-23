
import React from "react";
import { Header } from "../../includes/header"
import { Link } from "react-router-dom";
import "./404.css";

export function NotFound()
{

    return (
        
        <div>
            <Header/>

            <div className="naoEncontrado">
                <h1>ChatSphere</h1>
                <p>Página não encontrada, <Link to="/" className="link">voltar para a home.</Link></p>
            </div>

        </div>

    )

}

