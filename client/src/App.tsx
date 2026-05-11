import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Inscription from "./pages/Inscription";


export default function App() {

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/users`)
            .then(res => res.json())
            .then(data => console.log(data));
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/Inscription" element={<Inscription/>}/>
                <Route path="/Game" element={<Game />} />
            </Routes>
        </BrowserRouter>
    );
}