import {S3} from 'aws-sdk'
import fs from 'fs'
const s3=new S3({
    accessKeyId:"46dd8fdc70f8748dd0a2cf772d1c2632",
    secretAccessKey:"47f6b8bd3f8c7db4a6a51924b51294dcec1ae3ec54f0b8084d3e535e82461551",
    endpoint: "https://435ed2140535b09ada1284d216c793e4.r2.cloudflarestorage.com"
})

export const uploadFile = async(fileName:string,localFilePath:string)=>{
    const fileContent=fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body:fileContent,
        Bucket:"dployr",
        Key:fileName,
    }).promise();
}