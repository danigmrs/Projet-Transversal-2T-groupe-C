import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const isTest = process.env.NODE_ENV === "test";

const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  storage: isTest ? ":memory:" :"./database.sqlite",
  dialect: "sqlite"});



export default sequelize;
