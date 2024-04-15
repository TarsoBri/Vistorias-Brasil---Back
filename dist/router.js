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
const nodemailer_1 = __importDefault(require("nodemailer"));
const routes = express_1.default.Router();
exports.routes = routes;
// Create client
routes.post("/clients", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingClient = yield Client_1.Client.findOne({ email: req.body.email });
        if (!existingClient) {
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
        const client = yield Client_1.Client.findOne({
            email: req.body.email,
        });
        if (client === null) {
            throw new Error("Email não encontrado");
        }
        const approvedPassword = yield bcrypt_1.default.compare(req.body.password, client.password);
        if (approvedPassword) {
            const userId = client._id;
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
            const tokenDecoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_PASSWORD);
            if (tokenDecoded && typeof tokenDecoded === "object") {
                const client = yield Client_1.Client.findOne({
                    _id: tokenDecoded.userId,
                });
                return res.status(201).json(client);
            }
            else {
                throw new Error("Token inválido");
            }
        }
        else {
            throw new Error("Token inválido");
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
        const clientsFilter = clients.map(({ firstName, address, _id, created_at, status, update_at, __v, surveyor, }) => {
            if (address) {
                const { city, state } = address;
                return {
                    _id,
                    __v,
                    firstName,
                    address: { city, state },
                    status,
                    update_at,
                    created_at,
                    surveyor,
                };
            }
        });
        return res.status(200).json(clientsFilter);
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
        const authToken = req.headers["login-auth"];
        const id = req.params.id;
        const client = yield Client_1.Client.findOne({ _id: id });
        if (authToken && typeof authToken === "string") {
            const decodedAuthToken = jsonwebtoken_1.default.verify(authToken, process.env.TOKEN_PASSWORD);
            const clientSurveryor = yield Client_1.Client.findOne({
                _id: decodedAuthToken.userId,
            });
            if (client && clientSurveryor && clientSurveryor.surveyor) {
                const { __v, _id, firstName, email, address, phone, created_at, status, update_at, surveyor, } = client;
                return res.status(200).json({
                    __v,
                    _id,
                    firstName,
                    email,
                    address,
                    phone,
                    created_at,
                    status,
                    update_at,
                    surveyor,
                });
            }
            else {
                throw new Error("Acesso negado.");
            }
        }
        else {
            throw new Error("Token de autorização negado.");
        }
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
        const authToken = req.headers["login-auth"];
        if (authToken && typeof authToken === "string") {
            const decodedAuthToken = jsonwebtoken_1.default.verify(authToken, process.env.TOKEN_PASSWORD);
            if (decodedAuthToken.userId === id) {
                const client = yield Client_1.Client.findByIdAndUpdate({ _id: id }, req.body, {
                    new: true,
                });
                return res.status(200).json(client);
            }
            else {
                throw new Error("Token não autoriado.");
            }
        }
        else {
            throw new Error("Token não encontrado.");
        }
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
        const client = yield Client_1.Client.findOne({ _id: id });
        if (client === null) {
            throw new Error("Usuário não encontrado.");
        }
        let approvedPasswordHashed = false;
        let approvedPassword = false;
        if (req.body.code && req.body.hashedCode) {
            approvedPasswordHashed = yield compareCodes(req.body.code, req.body.hashedCode);
            if (!approvedPassword) {
                throw new Error("Código está incorreta.");
            }
        }
        else {
            approvedPassword = yield compareCodes(req.body.password, client.password);
        }
        if (approvedPassword || approvedPasswordHashed) {
            const hashedNewPassword = yield bcrypt_1.default.hash(req.body.newPassword, 10);
            const clientWithNewPassword = yield Client_1.Client.findByIdAndUpdate({ _id: id }, {
                password: hashedNewPassword,
                update_at: req.body.update_at,
            }, {
                new: true,
            });
            return res.status(200).json(clientWithNewPassword);
        }
        else {
            throw new Error("Sua senha está incorreta.");
        }
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(400).send(error.message);
        }
    }
}));
routes.post("/sendMailRecovery", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const client = yield Client_1.Client.findOne({ email });
        if (client === null) {
            throw new Error("Email ainda não cadastrado.");
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
            const hashedCode = yield bcrypt_1.default.hash(code, 10);
            const configEmail = {
                from: {
                    name: "Vistorias Brasil",
                    address: process.env.EMAIL,
                },
                to: email,
                subject: "Redefinição de senha",
                html: `<p>Olá ${client.firstName}, Você solicitou a redfinição de senha no Vistorais Brasil, utilize o código de validação a seguir para redefinir sua senha: </p> 
        <p> <strong>${code}</strong> </p>`,
            };
            transporter.sendMail(configEmail, (err, data) => {
                if (err) {
                    throw new Error("Falha ao enviar o email.");
                }
                else {
                    res.status(200).json({ hashedCode, email, id: client._id });
                }
            });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(400).send(error.message);
        }
    }
}));
// Confirm Recovery
routes.post("/sendMailRecovery/confirm", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const approvedCode = yield compareCodes(req.body.code, req.body.hashedCode);
        if (approvedCode) {
            return res.status(200).send("APPROVED");
        }
        else {
            throw new Error("Código de validação não autorizado.");
        }
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(400).send(error.message);
        }
    }
}));
const compareCodes = (code, hashedCode) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcrypt_1.default.compare(code, hashedCode);
});
