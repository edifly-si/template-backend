import {decode} from '../library/signer';


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
        res.locals.udata={...uData};
        res.locals.token=aToken;
        const end=new Date().getTime();
        res.set("after-token-timestamps", end);
        res.set('token-time-ms',end - start);
        next();
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