
import { Home } from "../pages/Home";
import { Chat } from "../pages/Chat";
import { Register } from "../pages/Register";
import { NotFound } from "../pages/404";
import { User } from "../pages/User";
import { Profile } from "../pages/Profile";
import { About } from "../pages/About";

import { Routes, Route } from "react-router-dom";

function RoutesApp()
{
    return (
        <Routes>
            <Route path="/"  element={<Home/>}/>
            <Route path="/chat" element={<Chat/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/user/:usuarioNome" element={<User/>}/>
            <Route path="/profile" element={<Profile/>}/>
            <Route path="/about" element={<About/>}/>
            <Route path="*" element={<NotFound/>}/>
        </Routes>
    )
}

export default RoutesApp;
