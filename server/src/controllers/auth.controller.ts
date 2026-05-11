import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export default class AuthController {

  static async register(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const result = await AuthService.register(username, password);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const result = await AuthService.login(username, password);
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }
}