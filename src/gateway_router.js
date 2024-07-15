import {Router} from 'express';
import { ProcessRequest } from './library/gateway_processor';
import { getIpAddr } from './library/utils';
// import AuthController from './controller/auth';

const rtr=Router();

rtr.use('/',async(req, res)=>{
    const path = req.path;
    const body = req.body;
    const headers=req.headers;
    const method=req.method;
    const [,application_name, ...rest] = path.split('/');
    try {
        const [resp, resp_type] = await ProcessRequest(application_name, rest.join('/'), req.query, getIpAddr(req), headers || {}, body, method);        
        switch (`${resp_type}`.toLowerCase()) {
            case 'json':
                res.json(resp);
                break;
            case 'html':{
                res.contentType='text/html';
                res.end(resp);
                break
            }
            case 'xml':{
                res.contentType='application/xml';
                res.end(resp);
                break;
            }
            default:
                res.end(resp);
                break;
        }
    } catch (error) {
        res.json({error:403, message:error.message});
    }
});

export default rtr;