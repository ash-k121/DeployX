import { createClient } from "redis";
import { downloadS3Folder,copyFinalDist } from "./aws";
import { buildProject } from "./utils";
import fs from 'fs'
import path from 'path'
const subscriber = createClient();
subscriber.connect();

const publisher=createClient();
publisher.connect();
// await subscriber.connect();
async function main() {
  
  while (true) {
    const response = await subscriber.brPop('build-queue', 0); 
    console.log("Received:", response);   

    // @ts-ignore
    const id = response.element;
    
    // Create dist/output if it doesn't exist
    const distPath = path.join(process.cwd(), "dist", "output");
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath, { recursive: true });
    }
    
    await downloadS3Folder(`output/${id}`);
    await buildProject(id);
     copyFinalDist(id);

     publisher.hSet("status",id,"deployed");
  }
}
main()