import {Router} from 'express';
import { CtrlHandler } from './utils';
import { saveFlights } from '../library/fradar'
const rtr=Router();

rtr.use('/', (req, res, next)=>{
    // middleware here to filter ip or something else
    next();
})

rtr.get('/save',(req, res)=>{
    CtrlHandler(req, res, async(body)=>{
        return 'OKE';
    })
});

rtr.post('/save',(req, res)=>{
    CtrlHandler(req, res, async(body)=>{
        return await saveFlights(body);
    })
});

export default rtr;
