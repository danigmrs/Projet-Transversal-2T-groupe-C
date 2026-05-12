import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";

const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  storage: "./database.sqlite",
  dialect: "sqlite"});



export default sequelize;
