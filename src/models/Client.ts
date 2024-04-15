import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
  surveyor: {
    type: Boolean,
  },

  email: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  password: {
    type: String,
  },

  firstName: {
    type: String,
    required: true,
  },

  status: {
    type: Boolean,
    required: true,
  },

  address: {
    CEP: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    road: {
      type: String,
    },

    number: { type: Number },

    reference: {
      type: String,
    },
  },
  created_at: {
    type: String,
  },

  update_at: {
    type: String,
  },
});

export const Client = mongoose.model("Client", ClientSchema);
