"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const connect_1 = require("./database/connect");
const router_1 = require("./router");
const port = process.env.PORT || 3001;
// Middlewares
const autheticateToken = (req, res, next) => {
    try {
        if ("token-auth" in req.headers) {
            const token = req.headers["token-auth"];
            if (token && typeof token === "string") {
                const decodedToken = jsonwebtoken_1.default.decode(token);
                if (decodedToken && decodedToken.auth) {
                    jsonwebtoken_1.default.verify(token, process.env.TOKEN_PASSWORD);
                    next();
                }
                else {
                    throw new Error("Token inválidado!");
                }
            }
        }
        else {
            throw new Error("Token não recebido!");
        }
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(400).send(error.message);
        }
    }
};
const app = (0, express_1.default)();
// Use Json in express
app.use(express_1.default.json());
// Connect DataBase
(0, connect_1.connectDataBase)();
// Cors
const corsOptions = {
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
};
app.use((0, cors_1.default)(corsOptions));
// Routers
app.get("/auth", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const auth = true;
        const tokenAuth = jsonwebtoken_1.default.sign({ auth }, process.env.TOKEN_PASSWORD);
        return res.status(200).json({ tokenAuth });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(400).send(error.message);
        }
    }
}));
app.use("/", autheticateToken, router_1.routes);
app.listen(port, () => console.log("Init APP on Port:", port));
