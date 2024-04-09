"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ClientSchema = new mongoose_1.default.Schema({
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
        required: true,
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
exports.Client = mongoose_1.default.model("Client", ClientSchema);
