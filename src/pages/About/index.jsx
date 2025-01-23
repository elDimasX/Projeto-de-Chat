
import React from "react";
import "../../css/Home.css"
import { Header } from "../../includes/header";
import { Footer } from "../../includes/footer";

export function About() {
    
    return (

        <div className="container">


            <Header />


            <main style={{padding: "30px"}}>

                <h1>Sobre</h1>
                <p>Este é um projeto de chat gratuito desenvolvido por Dimas Pereira.</p>
                <p>É um chat intuitivo, sem muitas coisas por agora, mas funciona em tempo real, com algumas opções de perfil, de deletar e outros.
                </p>
                <p>Feito em uma semana, pode ser melhorado colocando foto de perfil, mas isso custaria o firebase :D</p>

            </main>

            <Footer/>

        </div>

    )

}
