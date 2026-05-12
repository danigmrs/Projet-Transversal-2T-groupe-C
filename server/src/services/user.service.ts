import User from "../models/User";

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
    return User.create(data);
  }

  static async updateUser(id: number, data: any) {
    const user = await User.findByPk(id);
    if (!user) return null;

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