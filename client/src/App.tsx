import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Inscription from "./pages/Inscription";


export default function App() {


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