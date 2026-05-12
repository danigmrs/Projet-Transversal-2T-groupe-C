import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Utilisateur from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET ?? "secret";

export class AuthService {

  static async register(username: string, password: string) {
    const existing = await Utilisateur.findOne({
      where: { mail_user: username },
    });

    if (existing) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Utilisateur.create({
      nom_user: "inconnu",
      prenom_user: "inconnu",
      mail_user: username,
      mdp_user: hashedPassword,
    });

    return {
      id: user.id_user,
      mail: user.mail_user,
    };
  }

  static async login(username: string, password: string) {

    const user = await Utilisateur.findOne({
      where: { mail_user: username },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isValid = await bcrypt.compare(password, user.mdp_user);

    if (!isValid) {
      throw new Error("Invalid password");
    }

    const token = jwt.sign(
      {
        id: user.id_user,
        mail: user.mail_user,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return {
      token,
      user: {
        id: user.id_user,
        mail: user.mail_user,
      },
    };
  }
}