import APPSCH from '../schema/application';
import PATSCH from '../schema/path';
import PACSCH from '../schema/packets';
import LOGSCH from '../schema/gateway_log';
import { is_ipaddr_valid } from './utils';
import {signer, verifyToken} from './gateway-signer';
import Axios from 'axios';
/**
 * 
 * @param {String} app_name 
 * @returns {Promise}
 */
const getApplication=async(app_id)=>{
    return await APPSCH.findOne({application_id:app_id}, '', {lean:true});
}

export const addPacketLog=async(packet, req, resp, code=200, headers={}, ips=[])=>{
    let ip_address=typeof ips ==='string'?[ips]:ips;
    const obj={...packet, request_length:`${req}`.length, response_length:`${resp}`.length, resp_code:code, ip_address};
    const packet_id=await PACSCH.create(obj);
    await LOGSCH.create({packet_id:packet_id._id, request:req, response:resp, headers});
}

const checkQry=(url, query)=>{
    const regx = new RegExp('({query.([a-zA-Z]{1,20})})','gi');
    const txts=url.split(regx);
    let link=url;
    for (let iii = 0; iii < txts.length; iii++) {
        const txt = txts[iii];
        console.log(txt);
        if(txt.indexOf('{query.')>=0){
            let [,v]=txt.split('{query.');
            if(!v)continue;
            [v]=v.split('}');
            const val=query[v] || "";
            link=link.split(txt).join(val);
        }
    }
    console.log(link);
    return link;
}

const checkBody=(url, body)=>{
    const regx = new RegExp('({body.([a-zA-Z]{1,20})})','gi');
    const txts=url.split(regx);
    let link=url;
    for (let iii = 0; iii < txts.length; iii++) {
        const txt = txts[iii];
        if(txt.indexOf('{body.')>=0){
            let [,v]=txt.split('{body.');
            if(!v)continue;
            [v]=v.split('}');
            const val=body[v] || "";
            link=link.split(txt).join(val);
        }
    }
    return link;
}

const getUrlProxyFinal=(url, query, body)=>{
    let link=checkQry(url, query);
    link=checkBody(link, body);
    return link;
}

const sendApi=async(application, path, body, query, method, req_headers, ips)=>{
    console.log(application, method, path);
    let start=(new Date()).getTime();
    const selected_path=await PATSCH.findOne({application_id:application._id, method, path}, '', {lean:true});
    if(!selected_path){
        throw new Error("Method not Found (0404)");
    }
    const {proxy_method, proxy_to, proxy_header, timeout } = selected_path;
    const url=getUrlProxyFinal(proxy_to, query, body || {});
    console.log({url});
    try {
        const resp=await Axios.request({
            method:proxy_method, 
            data:body,
            headers:{...proxy_header, timeout:timeout || 10000, }, 
            url,
            validateStatus:(status)=>true
        });
        let stop=(new Date()).getTime();
        await addPacketLog({start_time:start, stop_time:stop, api_time:stop - start}, JSON.stringify(body), JSON.stringify(resp.data), resp.status, req_headers, ips);
        return resp.data;        
    } catch (error) {
        console.log(error);
        let stop=(new Date()).getTime();
        await addPacketLog({start_time:start, stop_time:stop, api_time:stop - start}, JSON.stringify(body), JSON.stringify(error.message), 500, req_headers, ips);        
    }
}

export const ProcessRequest=async(app_id, path, query, ips, headers, body, method)=>{
    const application=await getApplication(app_id);
    let aHeaders=headers;
    if(!application){
        throw new Error("Forbidden Access (0010)")
    }
    if(!is_ipaddr_valid(application.whitelist_ip, ips)){
        throw new Error("Forbidden Access (0011)");
    }
    const {secret, key} = application;
    switch (application.auth) {        
        case 0:{
            if(headers['api-key']!==secret){
                throw new Error("Forbidden Access (0012)");
            }
            break;
        }
            
        case 1:{
            const b64auth = (headers['authorization'] || '').split(' ')[1] || '';
            const [username, password] = Buffer.from(b64auth, 'base64').toString().split(':');
            if(secret!==username || key!==password){
                throw new Error("Forbidden Access (0012)");
            }
            break;
        }
        
        case 2:{
            if(path==='auth/login'){
                const {username, password} = body;             
                if(secret!==username || password!==key){
                    throw new Error("Access Denied!");
                }
                const {name, application_id, _id} = application;
                return signer({name, application_id, _id});
            }
            const access_token=headers['access-token'];
            if(!access_token){
                throw new Error("Forbidden Access (0013)");
            }
            if(!verifyToken(access_token)){
                throw new Error("Forbidden Access (0012)");
            }
            break;
        }
        
        default:
            throw new Error("Forbidden Access (0013)");
    }

    const proxyResp=await sendApi(application, path, body, query, method, aHeaders, ips);
    return [proxyResp, application.resp_type || 'json'];
}