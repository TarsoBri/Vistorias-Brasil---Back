import express from "express";
import { Client } from "./models/Client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt, { Secret } from "jsonwebtoken";
import { ObjectId } from "mongodb";

const routes = express.Router();

// Create client
routes.post("/clients", async (req, res) => {
  try {
    const existingUser = await Client.findOne({ email: req.body.email });

    if (!existingUser) {
      const hashedPassword: string = await bcrypt.hash(req.body.password, 10);
      const clientData = {
        ...req.body,
        password: hashedPassword,
      };
      const client = await Client.create(clientData);
      return res.status(201).json(client);
    } else {
      throw new Error("Email já utilizado");
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).send(error.message);
    }
  }
});

// Login
routes.post("/clients/login", async (req, res) => {
  try {
    const user = await Client.findOne({
      email: req.body.email,
    });

    if (user === null) {
      throw new Error("Email não encontrado");
    }

    const approvedPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (approvedPassword) {
      const userId: ObjectId = user._id;
      const token = jwt.sign({ userId }, process.env.TOKEN_PASSWORD as Secret, {
        expiresIn: "1h",
      });

      return res.status(200).json({ token });
    } else {
      throw new Error("Senha incorreta");
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).send(error.message);
    }
  }
});

// Confirm Login token
routes.post("/clients/login/confirm", async (req, res) => {
  try {
    const { token } = req.body;
    if (token != "") {
      jwt.verify(token, process.env.TOKEN_PASSWORD as Secret);

      const tokenDecoded = jwt.decode(token);

      if (tokenDecoded && typeof tokenDecoded === "object") {
        const user = await Client.findOne({
          _id: tokenDecoded!.userId,
        });

        return res.status(201).json(user);
      } else {
        throw new Error("Token inválido");
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).send(error.message);
    }
  }
});

// Get clients
routes.get("/clients", async (req, res) => {
  try {
    const clients = await Client.find({});
    const token = jwt.sign({ clients }, process.env.TOKEN_PASSWORD as Secret);
    console.log (token)
    return res.status(200).json(token);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).send(error.message);
    }
  }
});

// Get client by id
routes.get("/clients/:id", async (req, res) => {
  try {
    const id: string = req.params.id;
    const client = await Client.find({ _id: id });
    return res.status(200).json(client);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).send(error.message);
    }
  }
});

// Patch client
routes.patch("/clients/:id", async (req, res) => {
  try {
    const id: string = req.params.id;
    const client: string | null = await Client.findByIdAndUpdate(
      { _id: id },
      req.body,
      {
        new: true,
      }
    );
    return res.status(200).json(client);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).send(error.message);
    }
  }
});

//Patch password client
routes.patch("/clients/changePassword/:id", async (req, res) => {
  try {
    const id: string = req.params.id;
    const client = await Client.find({ _id: id });

    const approvedPassword = await bcrypt
      .compare(req.body.password, client[0].password)
      .then(async () => {
        const hashedNewPassword: string = await bcrypt.hash(
          req.body.newPassword,
          10
        );

        const clientWithNewPassword = Client.updateOne(
          { _id: id },
          {
            password: hashedNewPassword,
            update_at: req.body.update_at,
          }
        );

        return res.status(200).json(clientWithNewPassword);
      })
      .catch(() => {
        throw new Error("A sua senha está incorreta.");
      });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).send(error.message);
    }
  }
});

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

import nodemailer from "nodemailer";

interface ConfigEmail {
  from: {
    name: string;
    address: string;
  };
  to: string;
  subject: string;
  html: string;
}

routes.post("/email", async (req, res) => {
  try {
    const { email } = req.body;
    const client = await Client.findOne({ email });

    if (client === null) {
      throw new Error("Email não encontrado!");
    }

    if (process.env.EMAIL && process.env.PASSWORD_EMAIL) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD_EMAIL,
        },
      });

      const code = crypto.randomBytes(3).toString("hex");
      console.log(code);

      const configEmail: ConfigEmail = {
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).send(error.message);
    }
  }
});

export { routes };
