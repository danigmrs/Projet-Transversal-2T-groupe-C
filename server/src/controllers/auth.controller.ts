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

      const result = await AuthService.login(username, password) as {
        token: string;
        user: any;
      };

      // 🍪 COOKIE HTTP-ONLY (IMPORTANT)
      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // true en production (HTTPS)
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 jour
      });

      return res.json({
        message: "Login successful",
        user,
      });

    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }
}