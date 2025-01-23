
import { useState, createContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


// Contexto para todas as páginas de autenticação
export const AuthContext = createContext({});

function AuthModify( {children} )
{
    const [usuario, setUsuario] = useState(null);
    const [chaveUsuario, setChaveUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {

        setCarregando(false);
    });

    function SetarUsuario(nome)
    {
        setUsuario(nome);
    }

    return (
        <AuthContext.Provider value={
            {
                logado: !!usuario,
                usuario,
                chaveUsuario,
                setChaveUsuario,
                SetarUsuario,
                carregando,
                setCarregando
            }
        }>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthModify;
