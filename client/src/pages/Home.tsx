
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isEmpty, isValidEmail } from "../utils/validation.ts";



export default function Connexion() {

  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  

  const goToInscription = () => {
      navigate("/Inscription");
    }

  const goToHome = async() => {


    // champ vide
    if (isEmpty(mail)) {
      alert("Le mail est obligatoire");
      return;
    }
    
    //format email
    if (!isValidEmail(mail)) {
      alert("Format email invalide");
      return;
    }


    //champ vide
    if (isEmpty(password)) {
      alert("Le mot de passe est obligatoire");
      return;
    }

    //vérif data en demandant a api 
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      credentials: "include",

      body: JSON.stringify({
        username: mail,
        password
      })
    });

    //renvoie réponse api
    const data = await response.json();

    // envoie a Game si data ok
    if (response.ok) {
      navigate("/Game");
    } 

    // erreur si data pas ok
    else {
      alert(data.error);
    }
  };
  
  //html page
  return (
    <div className="connexion-container">
      <h1>Quiz Culture Générale</h1>


      <input
        type="email"
        placeholder="Votre mail"
        value={mail}
        onChange={(e) => setMail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Votre mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={goToHome}>Se connecter</button>


      <p>Vous n'avez pas de compte ?</p>
      <button onClick={goToInscription}>S'inscrire</button>
    </div>
  );
}