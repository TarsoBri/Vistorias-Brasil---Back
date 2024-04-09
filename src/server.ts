import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import jwt, { Secret } from "jsonwebtoken";
import { connectDataBase } from "./database/connect";
import { routes } from "./router";

const port = process.env.PORT || 3001;

// Interafces
interface decodedToken {
  auth: boolean;
  iat: number;
}

// Middlewares
const autheticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    if ("token-auth" in req.headers) {
      const token = req.headers["token-auth"];
      if (token && typeof token === "string") {
        const decodedToken = jwt.decode(token) as decodedToken;
        if (decodedToken && decodedToken.auth) {
          jwt.verify(token, process.env.TOKEN_PASSWORD as Secret);
          next();
        } else {
          throw new Error("Token inválidado!");
        }
      }
    } else {
      throw new Error("Token não recebido!");
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).send(error.message);
    }
  }
};

const app = express();

// Use Json in express
app.use(express.json());

// Connect DataBase
connectDataBase();

// Cors
const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Routers
app.get("/auth", async (req, res) => {
  try {
    const auth: boolean = true;
    const tokenAuth = jwt.sign({ auth }, process.env.TOKEN_PASSWORD as Secret);
    return res.status(200).json({ tokenAuth });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).send(error.message);
    }
  }
});

app.use("/", autheticateToken, routes);

app.listen(port, () => console.log("Init APP on Port:", port));
