import {Router} from 'express';
import {AuthMiddleware, CtrlHandler} from './utils';
import {refreshToken} from '../library/signer';
import {createLog} from '../library/utils';
import { changePassword, createDefaultUser, Login, updateProfile } from '../model/users';

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

rtr.post('/createDefaultUser', (req, res)=>{
    CtrlHandler(req, res, async(body)=>{
        const {password}=body;
        return await createDefaultUser(password);
    });
});

rtr.use('/logout', AuthMiddleware);
rtr.use('/refreshToken', AuthMiddleware);
rtr.use('/profile', AuthMiddleware);
rtr.use('/changePassword', AuthMiddleware);
rtr.use('/me', AuthMiddleware);

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
        const resp=await changePassword(username, current, password);
        createLog(_id, `Change password for ${username}`, req);
        return password;
    });
});

export default rtr;