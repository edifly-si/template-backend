import {Router} from 'express';
import { CtrlHandler } from './utils';
import APPSCH from '../schema/application';
import { is_ipaddr_valid } from '../library/utils';
import {signer} from '../library/gateway-signer';

const rtr=Router();

rtr.post('/login', (req, res)=>{
    CtrlHandler(req, res, async(body)=>{
        const {secret, key} = body;
        const exists=await APPSCH.findOne({secret, key}, '', {lean:true});
        if(!exists){
            throw new Error("Application not found!");
        }
        switch (exists.auth) {
            case 2:{
                if(!is_ipaddr_valid(exists.whitelist_ip, req)){
                    throw new Error("Forbidden access");
                }
                const {_id, application_id, name} =  exists;
                const udata={_id, application_id, name};
                return signer(udata);
            }
                
            default:
                throw new Error("invalid auth method");
        }
    })
})

export default rtr;