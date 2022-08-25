import {decode} from '../library/signer';
import {Router} from 'express';
import m from 'mongoose';
import {createModel} from '../model/utils';
import {getEnv} from '../library/apps';
import moment from 'moment';
import { CreateRandomString } from '../library/utils';

export const AuthMiddleware=(req, res, next)=>{

    const authHeader=process.env.AUTHHEADER || 'srawung-token';
    const aToken=req.headers[authHeader] || req.query?.token;
    // console.log(authHeader, aToken, req.headers);
    if(!aToken)
    { 
        res.json({error:403, message:"Forbidden!"});
    }
    else
    {
        const start=new Date().getTime();
        res.set("before-token-timestamps", start);
        const uData=decode(aToken);
        if(!uData)
        {
            res.json({error:401, message:'Auth Token Invalid or Expired!'});
        }
        else{
            res.locals.udata={...uData};
            res.locals.token=aToken;
            const end=new Date().getTime();
            res.set("after-token-timestamps", end);
            res.set('token-time-ms',end - start);
            next();
        }
    }
}

export const CtrlHandler=async(req, res, callback)=>{
    let jres = {
        error:0,
        data:[],
        message:'',
        stack:{},
        errorName:''
    }
    const start=new Date().getTime();
    res.set("before-exec-timestamps", start);
    try {
        jres.data = await callback(req.body)
    } catch (error) {
        jres.error=500;
        jres.message=error.message;
        jres.stack = error.stack;
        jres.errorName = error.name;
        console.error(error);
    }
    if(jres.data!==undefined){
        const end=new Date().getTime();
        res.set("after-exec-timestamps", end);
        res.set('execution-time-ms',end - start);
        res.json(jres);
    }
}
/**
 * 
 * @param {m.Model} schema 
 * @param {Number} level 
 * @param {Array} defSearch 
 * @param {Function} beforeSaveData 
 * @param {Object} sort 
 * @param {Function} beforeRead 
 * @param {String} projector
 * @param {Function} afterSave
 * @returns {Router}
 */
export const createCrudController=( schema, level=0, defSearch=[], beforeSaveData=false, sort={_id:-1}, beforeRead=false, projector='', afterSave=false)=>{
    const rtr=Router();
    const {insert, reqPaging, update} = createModel(schema);
    rtr.get('/', (req, res)=>{
        CtrlHandler(req, res, async(body)=>{
            const {search, search2, page, perPage } = req.query;
            let filter={};
            if(!!beforeRead && typeof beforeRead==='function'){
                beforeRead(search, search2, filter)
            }else{
                if(!!search){
                    const o=[];
                    const r=new RegExp(search,'i');
                    for (let iii = 0; iii < defSearch.length; iii++) {
                        const f = defSearch[iii];
                        o.push({[f]:r});
                    }
                    filter={...filter, $or:o};
                }else if(!!search2){
                    const f=JSON.parse(search2);
                    filter={...filter, ...f};
                }
            }
            return await reqPaging(schema, page, perPage, filter, sort, projector)
        })
    })

    rtr.post('/', (req, res)=>{
        CtrlHandler(req, res, async(body)=>{
            const {level:lvl, _id:uid} = res.locals.udata;
            let data=body;
            if(!!beforeSaveData && typeof beforeSaveData==='function'){
                data =await beforeSaveData(data, level, uid, req);
            }
            if(level===0 || ((level&lvl)>0)){
                console.log({data});
                const {_id} = data;
                if(!!_id){
                    const saved = await update(data, _id);
                    if(!!afterSave && typeof afterSave ==='function'){
                        afterSave(saved)
                    }
                    return saved;
                }
                const saved = await insert(data, uid);
                if(!!afterSave && typeof afterSave ==='function'){
                    afterSave(saved)
                }
                return saved;
            }
            throw new Error('Error Privileges!');
        })
    })
    return rtr;
}

export const generateUniqueName=()=>{
    return `${moment().unix()}_${CreateRandomString(10)}`;
}

export const createFile=(file)=>{
    const {name} = file;
    const frag = name.split('.');
    const ext=frag.pop();
    const nm = frag.join('.')
    const dir=getEnv("imagesPath", "../static");
    const filename=generateUniqueName()+'_'+nm + '.'+ext;
    file.mv(dir+'/'+filename);
    return filename;
}

/**
 *  
 * @param {m.Model} schema 
 * @param {String} type 
 * @param {Array} columns 
 * @param {Function} getReport 
 * @returns {Router}
 */
export const createReportCtrl = (schema, type='daily', columns=[], getReport=false)=>{
    const rtr=Router();
    const header=columns.map(({title})=>title);
    const fields=columns.map(({title, ...rest})=>({...rest}));
    if(type==='daily'){
        rtr.get('/:first_date/:last_date',(req, res)=>{
            CtrlHandler(req, res, async(body)=>{
                const {first_date, last_date} = req.params;
                if(typeof getReport==='function'){
                    const data=getReport(schema, req, res, first_date, last_date);
                    return {data, header, fields};
                }
                throw new Error("Report callback function not found!");
            })
        })
    }
    else {
        rtr.get('/:month', (req, res)=>{
            CtrlHandler(req, res, async(body)=>{
                const {month} = req.params;
                if(typeof getReport==='function'){
                    const data=getReport(schema, req, res, month);
                    return {data, header, fields};
                }
                throw new Error("Report callback function not found!");
            });
        })
    }

    return rtr;
}

/**
 * 
 * @param {any} model 
 * @param {any} decoder 
 * @param {any} refreshToken 
 * @returns {Router}
 */
export const createAuthController=(model, decoder, refreshToken)=>{
    const { changePassword, createDefaultUser, Login, updateProfile } = model;
    const rtr=Router();

    rtr.post('/login', (req, res)=>{
        CtrlHandler(req, res, async(body)=>{
            const {username, password}=body;
            try {
                const [token, udata]=await Login(username, password);
                createLog(udata._id, `Login Success For User ${username}`, req);
                return token;
            } catch (error) {
                createLog(undefined, `Login Failed For User ${username}`, req);
                throw error;
            }        
        });
    });
    
    rtr.use('/logout', AuthMiddleware(decoder));
    rtr.use('/refreshToken', AuthMiddleware(decoder));
    rtr.use('/profile', AuthMiddleware(decoder));
    rtr.use('/changePassword', AuthMiddleware(decoder));
    rtr.use('/me', AuthMiddleware(decoder));
    
    rtr.get('/logout', (req, res)=>{
        CtrlHandler(req, res, async(body)=>{
            const {_id:user_id, username}=res.locals.udata;
            createLog(user_id, `${username} Logout`, req);
            return true;
        });
    });
    
    rtr.get('/refreshToken', (req, res)=>{
        CtrlHandler(req, res, async(body)=>{
            return refreshToken(res.locals.token);
        });
    });
    
    rtr.get('/me', (req, res)=>{
        CtrlHandler(req, res, async(body)=>{
            return res.locals.udata;
        });
    });
    
    
    rtr.post('/profile', (req, res)=>{
        CtrlHandler(req, res, async(body)=>{
            // console.log(body);
            const {_id, username}=res.locals.udata;
            createLog(_id, `Update Profile for ${username}`, req);
            return await updateProfile(_id, body);
        });
    });
    
    rtr.post('/changePassword', (req, res)=>{
        CtrlHandler(req, res, async(body)=>{
            const {username}=res.locals.udata;
            const {password, current}=body;
            await changePassword(username, current, password);
            createLog(_id, `Change password for ${username}`, req);
            return password;
        });
    });

    return rtr;
}
