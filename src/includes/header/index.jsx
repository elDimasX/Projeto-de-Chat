
import React from 'react';
import { Link } from 'react-router-dom';

export function Header()
{

    return (
        
        <header>
            <Link to="/" className="linkPrincipal">ChatSphere</Link>

            <div className="links">
                <Link to="/chat">Iniciar uma Conversa</Link>
                <Link to ="/about">Sobre</Link>
            </div>
        </header>

    )

}
