import type { Request, Response } from "express";
import Utilisateur from "../models/Utilisateur.js";


/**
 * GET ALL USERS
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    
    const users = await Utilisateur.findAll();

    res.json(users);
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
    });
  }
};

/**
 * GET USER BY ID
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await Utilisateur.findByPk(Number(req.params.id));

    if (!user) {
      return res.status(404).json({
        error: "Utilisateur non trouvé",
      });
    }

    res.json(user);
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
    });
  }
};


/**
 * CREATE USER
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const { lastname, firstname, mail, password } = req.body;

    if (!lastname || !firstname || !mail || !password) {
      return res.status(400).json({
        error: "Champs manquants",
      });
    }

    const user = await Utilisateur.create({
      nom_user: lastname,
      prenom_user: firstname,
      mail_user: mail,
      mdp_user: password,
    });

    res.status(201).json(user);

  } catch (err: any) {
    res.status(500).json({
      error: err.message,
    });
  }
};

/**
 * UPDATE USER
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await Utilisateur.findByPk(Number(req.params.id));

    if (!user) {
      return res.status(404).json({
        error: "Utilisateur non trouvé",
      });
    }

    const { lastname, firstname, mail, password } = req.body;

    await user.update({
      nom_user: lastname,
      prenom_user: firstname,
      mail_user: mail,
      mdp_user: password,
    });

    res.json(user);
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
    });
  }
};

/**
 * DELETE USER
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await Utilisateur.findByPk(Number(req.params.id));

    if (!user) {
      return res.status(404).json({
        error: "Utilisateur non trouvé",
      });
    }

    await user.destroy();

    res.json({
      message: "Utilisateur supprimé",
    });
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
    });
  }
};