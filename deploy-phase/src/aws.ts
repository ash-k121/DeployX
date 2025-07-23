import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";

const s3=new S3({
    accessKeyId:"46dd8fdc70f8748dd0a2cf772d1c2632",
    secretAccessKey:"47f6b8bd3f8c7db4a6a51924b51294dcec1ae3ec54f0b8084d3e535e82461551",
    endpoint: "https://435ed2140535b09ada1284d216c793e4.r2.cloudflarestorage.com"
})
export async function downloadS3Folder(prefix: string) {
  console.log(`📥 Downloading from S3: ${prefix}`);
  
  // Add trailing slash if missing
  const normalizedPrefix = prefix.endsWith('/') ? prefix : prefix + '/';
  
  try {
    const { Contents } = await s3.listObjectsV2({
      Bucket: "dployr",
      Prefix: normalizedPrefix
    }).promise();

    if (!Contents || Contents.length === 0) {
      console.log("❌ No files found in S3 folder");
      return;
    }

    const downloadPromises = Contents.map(({ Key }) => {
      if (!Key) return Promise.resolve();
      
      // Skip folder markers
      if (Key.endsWith('/')) {
        console.log(`⏩ Skipping folder: ${Key}`);
        return Promise.resolve();
      }

      return new Promise<void>((resolve, reject) => {
        // Create correct local path in dist/output
        const relativePath = Key.replace(normalizedPrefix, "");
        const localPath = path.join(process.cwd(), "dist", "output", relativePath);
        const dirPath = path.dirname(localPath);

        // Create directories if needed
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
          console.log(`📁 Created directory: ${dirPath}`);
        }

        console.log(`⬇️ Downloading: ${Key} → ${localPath}`);
        
        const outputFile = fs.createWriteStream(localPath);
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
    await Promise.all(downloadPromises);
    console.log("🎉 All files downloaded to dist/output!");
  } catch (error) {
    console.error("🔥 Critical download error:", error);
  }
}
export function copyFinalDist(id: string) {
    const folderPath = path.join(__dirname, `output/${id}/dist`);
    const allFiles = getAllFiles(folderPath);
    allFiles.forEach(file => {
        uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
    })
}

const getAllFiles = (folderPath: string) => {
    let response: string[] = [];

    const allFilesAndFolders = fs.readdirSync(folderPath);allFilesAndFolders.forEach(file => {
        const fullFilePath = path.join(folderPath, file);
        if (fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath))
        } else {
            response.push(fullFilePath);
        }
    });
    return response;
}

const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "dployr",
        Key: fileName,
    }).promise();
    console.log(response);
}