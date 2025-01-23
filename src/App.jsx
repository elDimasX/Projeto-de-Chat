

import { BrowserRouter } from "react-router-dom";
import RoutesApp from "./routes"
import AuthModify from "./contexts/auth";
import "./css/Global.css";

function App()
{
  return (

    <BrowserRouter>
    
      <AuthModify>
        <RoutesApp/>
      </AuthModify>

    </BrowserRouter>
  );
}

export default App;
