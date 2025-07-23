import express from 'express';
import {S3} from 'aws-sdk';
const app = express();


const s3=new S3({
    accessKeyId:"",
    secretAccessKey:"",
    endpoint: ""
})

app.get('*', async(req, res) => {  // Use '*' instead of '/*'
    const host = req.hostname;
    console.log('Full hostname:', host);
    
    // Handle case where host doesn't have dots
    const parts = host.split('.');
    const id =parts[0];
    const filePath=req.path;

    const contents= await s3.getObject({
        Bucket:'dployr',
        Key:`dist/${id}${filePath}`
    }).promise();

    const type = filePath.endsWith("html")? "text/html":filePath.endsWith("css")?
    "text/css":"application/javascript"
    res.set("Content-Type",type);
    res.send(contents.Body);
});

app.listen(3001, () => {
    console.log('Server running on port 3001');
});