import fs from 'fs';
import path from 'path';

export const getAllFiles=(folderPath:string)=>{
    let response:string []=[];

    const allFiles=fs.readdirSync(folderPath);allFiles.forEach(file=>{
        const fullfilePath=path.join(folderPath,file);
        if(fs.statSync(fullfilePath).isDirectory()){
            response=response.concat(getAllFiles(fullfilePath));
        }else{
            response.push(fullfilePath);
        }
    });
    return response;

}