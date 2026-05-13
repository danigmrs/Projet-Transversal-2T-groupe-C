import { Request, Response } from "express";
import Scores from "../models/Scores";
import User from "../models/user";

export class ScoresController {
  static async create(req: Request, res: Response) {
    try {
      const { id_user, score } = req.body;

      const newScore = await Scores.create({
        id_user,
        score,
      });

      return res.status(201).json(newScore);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getTop5(req: Request, res: Response) {
    try {
      const scores = await Scores.findAll({
        order: [["score", "DESC"]],
        limit: 5,
        include: [
          {
            model: User,
            as: "utilisateur", // IMPORTANT
            attributes: ["prenom_user", "nom_user"],
          },
        ],
      });

      return res.json(scores);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}