import express from "express";
import cors from "cors";

import { connectDataBase } from "./database/connect";
import { routes } from "./router";

const app = express();

app.use(express.json());

connectDataBase();

const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use("/", routes);

app.listen(8080, () => console.log("Init APP"));
