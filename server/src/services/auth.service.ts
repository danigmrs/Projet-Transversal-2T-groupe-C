import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user";

const JWT_SECRET = process.env.JWT_SECRET ?? "secret";

export class AuthService {

  static async register(username: string, password: string) {
    const existing = await User.findOne({
      where: { mail_user: username },
    });

    if (existing) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
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

    const user = await User.findOne({
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