import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { mockDb } from "../db/mock";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export class AuthService {

  static async register(username: string, password: string) {
    const existing = mockDb.findUserByUsername(username);

    if (existing) {
      throw new Error("User already exists");
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = mockDb.insertUser(username, hashedPassword);

    return user;
  }

  static async login(username: string, password: string) {

    const user = mockDb.findUserByUsername(username);

    if (!user) {
      throw new Error("User not found");
    }

    const isValid = bcrypt.compareSync(password, user.password);

    if (!isValid) {
      throw new Error("Invalid password");
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    };
  }
}