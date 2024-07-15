import APPSCH from '../schema/application';
import PATSCH from '../schema/path';
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

const sendApi=async(application, path, body, query, method)=>{
    console.log(application, method, path);
    const selected_path=await PATSCH.findOne({application_id:application._id, method, path}, '', {lean:true});
    if(!selected_path){
        throw new Error("Method not Found (0404)");
    }
    const {proxy_method, proxy_to, proxy_header, timeout } = selected_path;
    const url=getUrlProxyFinal(proxy_to, query, body || {});
    console.log({url});
    const resp=await Axios.request({
        method:proxy_method, 
        data:body,
        headers:{...proxy_header, timeout:timeout || 10000, }, 
        url
    });
    return resp.data;
}

export const ProcessRequest=async(app_id, path, query, ips, headers, body, method)=>{
    const application=await getApplication(app_id);
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

    return await sendApi(application, path, body, query, method);
}