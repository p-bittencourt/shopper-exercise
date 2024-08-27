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
require("dotenv/config");
const { GoogleGenerativeAI } = require('@google/generative-ai');
class GenerativeAIService {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
    }
    initializeModel(modelName) {
        this.model = this.genAI.getGenerativeModel({ model: modelName });
    }
    generateContent(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.generateContent(prompt);
            const response = yield result.response;
            return response.text();
        });
    }
}
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY environment variable is not set.');
        }
        const genAIService = new GenerativeAIService(apiKey);
        genAIService.initializeModel('gemini-1.5-flash');
        const prompt = 'Write a short story about a magic backpack.';
        const text = yield genAIService.generateContent(prompt);
        console.log(text);
    });
}
run();
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
