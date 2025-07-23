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
exports.downloadS3Folder = downloadS3Folder;
exports.copyFinalDist = copyFinalDist;
const aws_sdk_1 = require("aws-sdk");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const s3 = new aws_sdk_1.S3({
    accessKeyId: "46dd8fdc70f8748dd0a2cf772d1c2632",
    secretAccessKey: "47f6b8bd3f8c7db4a6a51924b51294dcec1ae3ec54f0b8084d3e535e82461551",
    endpoint: "https://435ed2140535b09ada1284d216c793e4.r2.cloudflarestorage.com"
});
function downloadS3Folder(prefix) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`📥 Downloading from S3: ${prefix}`);
        // Add trailing slash if missing
        const normalizedPrefix = prefix.endsWith('/') ? prefix : prefix + '/';
        try {
            const { Contents } = yield s3.listObjectsV2({
                Bucket: "dployr",
                Prefix: normalizedPrefix
            }).promise();
            if (!Contents || Contents.length === 0) {
                console.log("❌ No files found in S3 folder");
                return;
            }
            const downloadPromises = Contents.map(({ Key }) => {
                if (!Key)
                    return Promise.resolve();
                // Skip folder markers
                if (Key.endsWith('/')) {
                    console.log(`⏩ Skipping folder: ${Key}`);
                    return Promise.resolve();
                }
                return new Promise((resolve, reject) => {
                    // Create correct local path in dist/output
                    const relativePath = Key.replace(normalizedPrefix, "");
                    const localPath = path_1.default.join(process.cwd(), "dist", "output", relativePath);
                    const dirPath = path_1.default.dirname(localPath);
                    // Create directories if needed
                    if (!fs_1.default.existsSync(dirPath)) {
                        fs_1.default.mkdirSync(dirPath, { recursive: true });
                        console.log(`📁 Created directory: ${dirPath}`);
                    }
                    console.log(`⬇️ Downloading: ${Key} → ${localPath}`);
                    const outputFile = fs_1.default.createWriteStream(localPath);
                    const s3Stream = s3.getObject({
                        Bucket: "dployr",
                        Key
                    }).createReadStream();
                    s3Stream
                        .on('error', err => {
                        console.error(`❌ Download failed for ${Key}:`, err);
                        reject(err);
                    })
                        .pipe(outputFile)
                        .on('error', err => {
                        console.error(`❌ File write error for ${localPath}:`, err);
                        reject(err);
                    })
                        .on('finish', () => {
                        console.log(`✅ Downloaded: ${Key}`);
                        resolve();
                    });
                });
            });
            console.log(`⏳ Awaiting ${downloadPromises.length} downloads...`);
            yield Promise.all(downloadPromises);
            console.log("🎉 All files downloaded to dist/output!");
        }
        catch (error) {
            console.error("🔥 Critical download error:", error);
        }
    });
}
function copyFinalDist(id) {
    const folderPath = path_1.default.join(__dirname, `output/${id}/dist`);
    const allFiles = getAllFiles(folderPath);
    allFiles.forEach(file => {
        uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
    });
}
const getAllFiles = (folderPath) => {
    let response = [];
    const allFilesAndFolders = fs_1.default.readdirSync(folderPath);
    allFilesAndFolders.forEach(file => {
        const fullFilePath = path_1.default.join(folderPath, file);
        if (fs_1.default.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath));
        }
        else {
            response.push(fullFilePath);
        }
    });
    return response;
};
const uploadFile = (fileName, localFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    const fileContent = fs_1.default.readFileSync(localFilePath);
    const response = yield s3.upload({
        Body: fileContent,
        Bucket: "dployr",
        Key: fileName,
    }).promise();
    console.log(response);
});
