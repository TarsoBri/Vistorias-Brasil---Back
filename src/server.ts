import express from "express";
import cors from "cors";
import jwt, { Secret } from "jsonwebtoken";
import { connectDataBase } from "./database/connect";
import { routes } from "./router";

const autheticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  console.log(token);
  if (token && token == 123) {
    req.body.auth = "autorizado chefe!";
  } else {
    res.status(400).send("Não autorizado!");
  }
  next();
  // jwt.verify(token, process.env.TOKEN_PASSWORD as Secret);
};

const app = express();

app.use(express.json());

connectDataBase();

const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
import { Client } from "./models/Client";

app.use(autheticateToken);
// app.use("/", routes);
// Get client
app.get("/clients", async (req, res) => {
  try {
    if (req.body.auth) {
      const clients = await Client.find({});
      return res.status(200).json(clients);
    } else {
      throw new Error("Não authh");
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).send(error.message);
    }
  }
});

app.listen(8080, () => console.log("Init APP"));
