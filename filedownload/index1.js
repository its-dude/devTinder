const express = require('express');
const app = express();

const fs = require('fs');
const path = require('path');

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'index.html'));
})

app.get('/download',(req,res)=>{
    const filepath = path.join(__dirname,'lorem_5mb.txt');

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition','attachment; filename="lorem_repeated.txt"');

    const rs = fs.createReadStream(filepath);
    rs.pipe(res);
})

app.listen(3000,()=>{
    console.log("server is listening to port 3000");
})