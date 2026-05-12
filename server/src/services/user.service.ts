import Utilisateur from "../models/user.js";

export class UserService {

  /**
   * GET ALL USERS
   */
  static async getAllUsers() {
    return await Utilisateur.findAll();
  }

  /**
   * GET USER BY ID
   */
  static async getUserById(id: number) {
    return await Utilisateur.findByPk(id);
  }

  /**
   * CREATE USER
   */
  static async createUser(data: {
    lastname: string;
    firstname: string;
    mail: string;
    password: string;
  }) {

    return await Utilisateur.create({
      nom_user: data.lastname,
      prenom_user: data.firstname,
      mail_user: data.mail,
      mdp_user: data.password,
    });
  }

  /**
   * UPDATE USER
   */
  static async updateUser(
    id: number,
    data: {
      lastname?: string;
      firstname?: string;
      mail?: string;
      password?: string;
    }
  ) {

    const user = await Utilisateur.findByPk(id);

    if (!user) {
      return null;
    }

    await user.update({
      nom_user: data.lastname,
      prenom_user: data.firstname,
      mail_user: data.mail,
      mdp_user: data.password,
    });

    return user;
  }

  /**
   * DELETE USER
   */
  static async deleteUser(id: number) {

    const user = await Utilisateur.findByPk(id);

    if (!user) {
      return null;
    }

    await user.destroy();

    return true;
  }
}