import express from 'express';
import AppRouter from './gateway_router';
import moment from 'moment';
import m from 'mongoose';

const dotenv=require('dotenv');
const app=express();
dotenv.config();

m.connect(process.env?.MONGOURI,{ useNewUrlParser: true, useCreateIndex: true, useFindAndModify:false, 
    useUnifiedTopology: true });

app.use(express.json({limit:'10MB'}));
app.use(express.urlencoded({extended:true}));

app.get('/',(req,res)=>{
    res.json({error:0, data:moment().unix()});
});

app.use(AppRouter);

const port=parseInt(process.env.PORTGATEWAY) + parseInt(process.env.APPID);

app.listen(port, process.env.IP, ()=>{
    console.log('Listened to ', process.env.IP, port);
});