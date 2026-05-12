import User from "../models/user";
import bcrypt from "bcrypt";

export class UserService {

  static async getUsers() {
    return User.findAll();
  }

  static async getUserById(id: number) {
    return User.findByPk(id);
  }

  static async createUser(data: {
    nom_user: string;
    prenom_user: string;
    mail_user: string;
    mdp_user: string;
  }) {

    const hashedPassword = await bcrypt.hash(data.mdp_user, 10);

    return User.create({
      nom_user: data.nom_user,
      prenom_user: data.prenom_user,
      mail_user: data.mail_user,
      mdp_user: hashedPassword,
    });
  }

  static async updateUser(id: number, data: any) {
    const user = await User.findByPk(id);
    if (!user) return null;

    if (data.mdp_user) {
      data.mdp_user = await bcrypt.hash(data.mdp_user, 10);
    }

    await user.update(data);
    return user;
  }

  static async deleteUser(id: number) {
    const user = await User.findByPk(id);
    if (!user) return null;

    await user.destroy();
    return true;
  }
}