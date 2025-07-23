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
const redis_1 = require("redis");
const aws_1 = require("./aws");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const subscriber = (0, redis_1.createClient)();
subscriber.connect();
// await subscriber.connect();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            const response = yield subscriber.brPop('build-queue', 0);
            console.log("Received:", response);
            // @ts-ignore
            const id = response.element;
            // Create dist/output if it doesn't exist
            const distPath = path_1.default.join(process.cwd(), "dist", "output");
            if (!fs_1.default.existsSync(distPath)) {
                fs_1.default.mkdirSync(distPath, { recursive: true });
            }
            yield (0, aws_1.downloadS3Folder)(`output/${id}`);
            // await buildProject(id);
            // await copyFinalDist(id);
        }
    });
}
main();
