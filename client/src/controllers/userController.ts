import type { Request, Response } from "express";
import Utilisateur from "../models/Utilisateur.js";


// Crée un nouvel utilisateur

export const createUser = async (req: Request, res: Response) => {
  try {
    const { lastname, firstname, mail, password } = req.body;

    if (!lastname || !firstname || !mail || !password) {
      return res.status(400).json({ error: "Champs manquants" });
    }
    console.log("MODEL =", Utilisateur);

    const user = await Utilisateur.create({
      nom_user: lastname,
      prenom_user: firstname,
      mail_user: mail,
      mdp_user: password,
    });

    res.status(201).json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};