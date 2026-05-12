import type { Request, Response } from "express";
import { UserService } from "../services/user.service";

/**
 * GET ALL USERS
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserService.getUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET USER BY ID
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const user = await UserService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * CREATE USER
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const { lastname, firstname, mail, password } = req.body;

    if (!lastname || !firstname || !mail || !password) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    const user = await UserService.createUser({
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

/**
 * UPDATE USER
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const user = await UserService.updateUser(id, {
      nom_user: req.body.lastname,
      prenom_user: req.body.firstname,
      mail_user: req.body.mail,
      mdp_user: req.body.password,
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE USER
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const deleted = await UserService.deleteUser(id);

    if (!deleted) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json({ message: "Utilisateur supprimé" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};