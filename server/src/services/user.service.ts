import Utilisateur from "../models/User";

export class UserService {

  static async getUsers() {
    return Utilisateur.findAll();
  }

  static async getUserById(id: number) {
    return Utilisateur.findByPk(id);
  }

  static async createUser(data: {
    nom_user: string;
    prenom_user: string;
    mail_user: string;
    mdp_user: string;
  }) {
    return Utilisateur.create(data);
  }

  static async updateUser(id: number, data: any) {
    const user = await Utilisateur.findByPk(id);
    if (!user) return null;

    await user.update(data);
    return user;
  }

  static async deleteUser(id: number) {
    const user = await Utilisateur.findByPk(id);
    if (!user) return null;

    await user.destroy();
    return true;
  }
}