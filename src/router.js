import {Router} from 'express';
import AuthController from './controller/auth';
import ActivityLogsCtrl from './controller/activity_logs';
import SeederCtrl from './controller/seed';
import UserCtrls from './controller/users';
import { AuthMiddleware, CtrlHandler } from './controller/utils';
import { AppVersion, getUpdateLogs } from './appVersion';

const rtr=Router();

rtr.use('/auth', AuthController);

rtr.get('/api/v1/version', (req, res)=>{
    res.json({error:0, data:{version:AppVersion, history:getUpdateLogs()}});
});

rtr.get('/api/v1/server_map', async(req, res)=>{
    const map= await requestMapData();
    res.json(map);
})

rtr.use('/api/v1', AuthMiddleware);
rtr.use('/api/v1/users',UserCtrls);

rtr.use('/api/v1/activity_logs', ActivityLogsCtrl);

rtr.use('/seeder', SeederCtrl);

export default rtr;