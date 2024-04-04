import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import jwt, { Secret } from "jsonwebtoken";
import { connectDataBase } from "./database/connect";
import { routes } from "./router";

const autheticateToken = (req: Request, res: Response, next: NextFunction) => {
  if ("token-auth" in req.headers) {
    const token = req.headers["token-auth"];
    try {
      if (token && typeof token === "string") {
        jwt.verify(token, process.env.TOKEN_PASSWORD as Secret);
        next();
      } else {
        return res.send("Token não recebido!");
      }
    } catch (error) {
      return res.status(400).send("Não autorizado!");
    }
  }
};

const app = express();

app.use(express.json());

connectDataBase();

const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.get("/auth", async (req, res) => {
  try {
    const tokenAuth = jwt.sign({}, process.env.TOKEN_PASSWORD as Secret);
    return res.status(200).json({ tokenAuth });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).send(error.message);
    }
  }
});

app.use("/", autheticateToken, routes);

app.listen(8080, () => console.log("Init APP"));
