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
exports.routes = void 0;
const express_1 = __importDefault(require("express"));
const Client_1 = require("./models/Client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const routes = express_1.default.Router();
exports.routes = routes;
// Create client
routes.post("/clients", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingUser = yield Client_1.Client.findOne({ email: req.body.email });
        if (!existingUser) {
            const hashedPassword = yield bcrypt_1.default.hash(req.body.password, 10);
            const clientData = Object.assign(Object.assign({}, req.body), { password: hashedPassword });
            const client = yield Client_1.Client.create(clientData);
            return res.status(201).json(client);
        }
        else {
            throw new Error("Email já utilizado");
        }
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(400).send(error.message);
        }
    }
}));
// Login
routes.post("/clients/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield Client_1.Client.findOne({
            email: req.body.email,
        });
        if (user === null) {
            throw new Error("Email não encontrado");
        }
        const approvedPassword = yield bcrypt_1.default.compare(req.body.password, user.password);
        if (approvedPassword) {
            const userId = user._id;
            const token = jsonwebtoken_1.default.sign({ userId }, process.env.TOKEN_PASSWORD, {
                expiresIn: "1h",
            });
            return res.status(200).json({ token });
        }
        else {
            throw new Error("Senha incorreta");
        }
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(400).send(error.message);
        }
    }
}));
// Confirm Login token
routes.post("/clients/login/confirm", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (token != "") {
            jsonwebtoken_1.default.verify(token, process.env.TOKEN_PASSWORD);
            const tokenDecoded = jsonwebtoken_1.default.decode(token);
            if (tokenDecoded && typeof tokenDecoded === "object") {
                const user = yield Client_1.Client.findOne({
                    _id: tokenDecoded.userId,
                });
                return res.status(201).json(user);
            }
            else {
                throw new Error("Token inválido");
            }
        }
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(400).send(error.message);
        }
    }
}));
// Get clients
routes.get("/clients", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clients = yield Client_1.Client.find({});
        return res.status(200).json(clients);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(400).send(error.message);
        }
    }
}));
// Get client by id
routes.get("/clients/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const client = yield Client_1.Client.find({ _id: id });
        return res.status(200).json(client);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(400).send(error.message);
        }
    }
}));
// Patch client
routes.patch("/clients/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const client = yield Client_1.Client.findByIdAndUpdate({ _id: id }, req.body, {
            new: true,
        });
        return res.status(200).json(client);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(400).send(error.message);
        }
    }
}));
//Patch password client
routes.patch("/clients/changePassword/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const client = yield Client_1.Client.find({ _id: id });
        const approvedPassword = yield bcrypt_1.default
            .compare(req.body.password, client[0].password)
            .then(() => __awaiter(void 0, void 0, void 0, function* () {
            const hashedNewPassword = yield bcrypt_1.default.hash(req.body.newPassword, 10);
            const clientWithNewPassword = Client_1.Client.updateOne({ _id: id }, {
                password: hashedNewPassword,
                update_at: req.body.update_at,
            });
            return res.status(200).json(clientWithNewPassword);
        }))
            .catch(() => {
            throw new Error("A sua senha está incorreta.");
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(400).send(error.message);
        }
    }
}));
// Delete client
// routes.delete("/clients/:id", async (req, res) => {
//   try {
//     const id: string = req.params.id;
//     const client = await Client.findByIdAndDelete({ _id: id });
//     return res.status(200).json(client);
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       return res.status(400).send(error.message);
//     }
//   }
// });
const nodemailer_1 = __importDefault(require("nodemailer"));
routes.post("/email", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const client = yield Client_1.Client.findOne({ email });
        if (client === null) {
            throw new Error("Email não cadastrado!");
        }
        if (process.env.EMAIL && process.env.PASSWORD_EMAIL) {
            const transporter = nodemailer_1.default.createTransport({
                service: "gmail",
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD_EMAIL,
                },
            });
            const code = crypto_1.default.randomBytes(3).toString("hex");
            console.log(code);
            const configEmail = {
                from: {
                    name: "Vistorias Brasil",
                    address: process.env.EMAIL,
                },
                to: "tarsobrietzkeiracet@gmail.com",
                subject: "Redefinição de senha",
                html: `<p> Você solicitou a redfinição de senha no Vistorais Brasil, utilize o código a seguir para redefinir sua senha: </p> 
        <p> <strong>${code}</strong> </p>`,
            };
            // transporter.sendMail(configEmail, (err, data) => {
            //   if (err) {
            //     throw new Error("Falha ao enviar o email!");
            //   } else {
            //     res.status(200).send("Sucesso ao enviar o email!");
            //   }
            // });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(400).send(error.message);
        }
    }
}));