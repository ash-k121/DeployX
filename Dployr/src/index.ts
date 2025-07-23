//access key id
// 46dd8fdc70f8748dd0a2cf772d1c2632

//secret access key
// 47f6b8bd3f8c7db4a6a51924b51294dcec1ae3ec54f0b8084d3e535e82461551


//url
// https://435ed2140535b09ada1284d216c793e4.r2.cloudflarestorage.com

import express from 'express';//helps to create http server
import cors from "cors";
import {generate} from './utils'
import simpleGit from "simple-git";
import path from "path"
import { getAllFiles } from './file';
import { uploadFile } from './aws';
import {createClient} from "redis";
const publisher=createClient();
publisher.connect();

const subscriber=createClient();
subscriber.connect();
const app=express();
app.use(cors());
app.use(express.json()); 
app.listen(3000); //server listening at port 3000

app.post("/deploy",async(req,res)=>{
    const repoUrl=req.body.repoUrl;
    // console.log(repoUrl);
    const id =generate();
    await simpleGit().clone(repoUrl,path.join(__dirname,`output/${id}`));

    const files=getAllFiles(path.join(__dirname,`output/${id}`));
    
    files.forEach(async file=>{
        await uploadFile(file.slice(__dirname.length+1),file);
                                    //clean           //local
    })
    // console.log(files);

    publisher.lPush("build-queue",id); 
    publisher.hSet("status",id,"uploaded")


    res.json({
        id:id
    });
})

app.get("/status",async(req,res)=>{
    const id=req.query.id;
    const response =await subscriber.hGet("status",id  as string);
    res.json({
        status:response
    })
})