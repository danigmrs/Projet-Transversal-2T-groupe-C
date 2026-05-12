import { Optional } from "sequelize";

//Définition des attributs
 
export interface UserAttributes {
  id_user: number;
  nom_user: string;
  prenom_user: string;
  mail_user: string;
  mdp_user: string;
}

//Attributs optionnels (pour create)
 
export interface UserCreationAttributes
  extends Optional<UserAttributes, "id_user"> {}