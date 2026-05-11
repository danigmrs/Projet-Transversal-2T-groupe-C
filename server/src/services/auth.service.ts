import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { mockDb } from "../db/mock";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export class AuthService {

  static register(username: string, password: string) {
    return new Promise((resolve, reject) => {

      const existing = mockDb.findUserByUsername(username);

      if (existing) {
        return reject("User already exists");
      }

      const hashedPassword = bcrypt.hashSync(password, 10);

      const user = mockDb.insertUser(username, hashedPassword);

      resolve(user);
    });
  }

    static login(username: string, password: string) {
    return new Promise((resolve, reject) => {

      const user = mockDb.findUserByUsername(username);

      if (!user) {
        return reject("User not found");
      }

      const isValid = bcrypt.compareSync(password, user.password);

      if (!isValid) {
        return reject("Invalid password");
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      resolve({
        token,
        user: {
          id: user.id,
          username: user.username,
        },
      });
    });
  }
}