import express from "express";
import { Client } from "./models/Client";
import bcrypt from "bcrypt";
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
      return res.status(500).send("Email já utilizado");
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).send(error.message);
    }
  }
});

// Login
routes.post("/clients/login", async (req, res) => {
  const user = await Client.findOne({
    email: req.body.email,
  });

  if (user === null) {
    return res.status(500).send("Email não encontrado");
  }

  try {
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
      return res.status(500).send("Senha incorreta");
    }
  } catch (error) {
    return res.status(400).send("Erro ao logar usuário");
  }
});

// Confirm Login token
routes.post("/cliesnt/login/confirm", async (req, res) => {
  try {
    const { token, key, userId } = req.body;
    const user = await Client.findOne({ _id: userId });
    jwt.verify(token, key);

    return res.status(201).json(user);
  } catch (error) {
    return res.status(401).send("Usuário não autorizado");
  }
});

// Get client
routes.get("/clients", async (req, res) => {
  try {
    const clients = await Client.find({});
    return res.status(200).json(clients);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).send(error.message);
    }
  }
});

// Get client
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

    const approvedPassword = await bcrypt.compare(
      req.body.password,
      client[0].password
    );
    if (approvedPassword) {
      const hashedNewPassword: string = await bcrypt.hash(
        req.body.newPassword,
        10
      );

      const clientWithNewPassword = await Client.updateOne(
        { _id: id },
        {
          password: hashedNewPassword,
          update_at: req.body.update_at,
        }
      );

      return res.status(200).json(clientWithNewPassword);
    } else {
      return res.status(400).send("A senha está incorreta.");
    }
  } catch (error) {
    return res.status(400).send("Erro ao alterar senha do usuário.");
  }
});

// Delete client
routes.delete("/clients/:id", async (req, res) => {
  try {
    const id: string = req.params.id;
    const client = await Client.findByIdAndDelete({ _id: id });
    return res.status(200).json(client);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).send(error.message);
    }
  }
});

// import nodemailer from "nodemailer";

// routes.post("/email", async (req, res) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {

//       }
//     });
//   } catch (error) {}
// });

export { routes };
