import express from 'express';
import AppRouter from './router';
import moment from 'moment';
import fileUpload from 'express-fileupload';
import m from 'mongoose';
import path from 'path';
import {AppVersion} from './appVersion';
import {setEnv} from './library/apps';

const dotenv=require('dotenv');
const app=express();
dotenv.config();

m.connect(process.env?.MONGOURI,{ useNewUrlParser: true, useCreateIndex: true, useFindAndModify:false, 
    useUnifiedTopology: true });
if(process.env.DEV==='true')
{
    app.use('/',(req,res,next)=>{
        res.set("Access-Control-Allow-Origin",'*')
        res.set("Access-Control-Allow-Methods",'GET, POST, OPTIONS, HEAD')
        res.set("Access-Control-Allow-Headers","Authorization, Origin, X-Requested-With, Content-Type, usefirebaseauth, srawungtoken, Accept, Develop-by, bb-token, User-Agent, Content-Disposition")
        res.set("Access-Control-Expose-Headers",'*');
        if(req.method.toLowerCase()==='options'){
            res.end('OKE');
        }
        else
        {
            next();
        }
    });
}

app.use(express.static('static'));
app.use(express.static('attachments'));
app.use(express.json({limit:'2MB'}));
app.use(express.urlencoded({extended:true}));
app.use(fileUpload({limits:{fileSize:(process.env?.FILELIMIT||20) *1024*1024}}));

app.get('/',(req,res)=>{
    res.json({error:0, data:moment().unix()});
});

app.use(AppRouter);
app.use((req, res, next)=>{
    res.json({error:404, message:"Method Not Found!"});
})

const rootDir=path.join(__dirname,'../');
setEnv({...process.env, ROOTDIR:rootDir, AppVersion});
   
app.listen(process.env.PORT, process.env.IP, ()=>{
    console.log('Listened to ', process.env.IP, process.env.PORT);
});    
