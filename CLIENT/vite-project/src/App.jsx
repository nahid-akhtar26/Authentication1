import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import Reset from "./pages/Reset";
  import { ToastContainer } from 'react-toastify';
const App = () => {
  return (
    <div>
      <ToastContainer/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />}/>
        <Route path="/email-verify" element={<VerifyEmail />}/>
        <Route path="/reset-password" element={<Reset />}/>
      </Routes>
    </div>
  );
};

export default App;
