import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ToastContainer } from "react-toastify";

// Link para as fontes funcionarem
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&family=Open+Sans:wght@400;600&family=Source+Code+Pro:wght@400;500&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet"></link>


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ToastContainer autoClose={3500} theme="dark" className="custom-toast-container" toastClassName="custom-toast" />
    <App />
  </React.StrictMode>
);

