
import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaInfoCircle, FaUser, FaSignInAlt } from 'react-icons/fa';

export function Footer()
{

    return (
        
        <footer>

                <p>Desenvolvido por <a href="https://github.com/elDimasX" className="link">Dimas Pereira</a></p>

                <div>
                    <nav>

                        <i>Links rápidos</i>
                        <Link to="/chat" className="link">Entrar <FaUser></FaUser></Link>
                        <Link to="/register" className="link">Registrar <FaSignInAlt></FaSignInAlt></Link>

                    </nav>

                    <nav>

                        <i>Redes Sociais</i>
                        <Link to="https://github.com/elDimasX/projetochatreactnode" className="link" target="_blank">GitHub <FaGithub></FaGithub></Link>
                        <Link to="https://www.linkedin.com/in/eldimas/" className="link" target="_blank">LinkedIn <FaLinkedin></FaLinkedin></Link>

                    </nav>

                    <nav>

                        <i>Outros</i>
                        <Link to="/about" className="link">Sobre <FaInfoCircle></FaInfoCircle></Link>

                    </nav>
                </div>
                

            </footer>

    )

}
