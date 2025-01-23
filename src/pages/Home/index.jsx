
import React from 'react';
import "../../css/Home.css"
import { Link } from "react-router-dom";
import { Header } from "../../includes/header";
import { Footer } from "../../includes/footer";

export function Home(){

    return (
        <div className="container">

            <Header/>

            <main>

                <div className="content">

                    <h1>Sem email, sem rastreamento, apenas inicie um bate-papo!</h1>
                    <h2>Privacidade e sem rastremento de dados ou qualquer informação!<br/>Apenas um bate-papo simples e direto.</h2>

                    <Link to="/chat" className="button">Iniciar uma Conversa</Link>

                </div>

            </main>



            <Footer/>

        </div>
    )
}

