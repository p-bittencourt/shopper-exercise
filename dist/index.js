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
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const GenerativeAIService_1 = require("./services/GenerativeAIService");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY environment variable is not set.');
        }
        const genAIService = new GenerativeAIService_1.GenerativeAIService(apiKey);
        genAIService.initializeModel('gemini-1.5-flash');
        const prompt = 'Write a short story about a magic backpack.';
        const text = yield genAIService.generateContent(prompt);
        console.log(text);
    });
}
run();
