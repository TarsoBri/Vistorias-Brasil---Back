import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config()

const uri: string = `mongodb+srv://${process.env.USER_DB}:${process.env.PASSWORD_DB}@cluster0.6jalwra.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
export const connectDataBase = async () => {
  await mongoose
    .connect(uri)
    .then((res) => console.log("Connected DataBase!"))
    .catch((err) => console.error("Erro DataBase!", err));
};
