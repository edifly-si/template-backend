import {Router} from 'express';
import { CtrlHandler } from './utils';
import SCHEMA from '../schema/activity_log';
import {createModel} from '../model/utils';

const rtr=Router();

const {insert, update, reqPaging}=createModel(SCHEMA);

rtr.get('/',(req, res)=>{
    CtrlHandler(req, res, async(body)=>{
        const {perPage, page, search, search2}=req.query;
        const {_id}=res.locals.udata;
        let filter={};
        if(search!==''){            
            const regex=new RegExp(search,'i');
            filter={
                logs:regex,
            }
        }        
        return await reqPaging(SCHEMA, page, perPage, {...filter, user_id:_id}, {_id:-1});        
    });
});

rtr.get('/all',(req, res)=>{
    CtrlHandler(req, res, async(body)=>{
        const {perPage, page, search, search2}=req.query;
        const {_id, level}=res.locals.udata;
        if((level & 0xff0)===0)throw new Error('Error Privileges');
        let filter={};
        if(search!==''){            
            const regex=new RegExp(search,'i');
            filter={
                logs:regex,
            }
        }        
        return await reqPaging(SCHEMA, page, perPage, {...filter}, {_id:-1});        
    })
})

export default rtr;