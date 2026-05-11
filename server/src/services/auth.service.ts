import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db/connection";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export class AuthService {

  static register(username: string, password: string) {
    return new Promise((resolve, reject) => {

      const hashedPassword = bcrypt.hashSync(password, 10);

      const sql = "INSERT INTO users (username, password) VALUES (?, ?)";

      db.query(sql, [username, hashedPassword], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  static login(username: string, password: string) {
    return new Promise((resolve, reject) => {

      const sql = "SELECT * FROM users WHERE username = ?";

      db.query(sql, [username], (err, results: any) => {
        if (err) return reject(err);

        if (results.length === 0) {
          return reject("User not found");
        }

        const user = results[0];

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
            username: user.username
          }
        });
      });
    });
  }
}