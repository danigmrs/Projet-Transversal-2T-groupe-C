import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export default class AuthController {

  static async register(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      const user = await AuthService.register(username, password);

      return res.status(201).json({
        message: "User created successfully",
        user,
      });

    } catch (err: any) {
      return res.status(400).json({
        error: err.message,
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      const { token, user } = await AuthService.login(username, password);

      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // true en prod HTTPS
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.json({
        message: "Login successful",
        user,
      });

    } catch (err: any) {
      return res.status(401).json({
        error: err.message,
      });
    }
  }
}