import LOGSCH from '../schema/activity_log';

export const CreateRandomString=(len=8)=>{
    const dict='056789QWERTYUIOPqwertyopasdfghjklzxcvbnmASDFGHJKLZXCVBNM1234';
    let result='';
    for (let iii = 0; iii < len; iii++) {
        const charAt=Math.floor(Math.random() * 1000) % dict.length;
        result=dict[charAt]+result;
    }
    return result;
}

const parseIps=(ips)=>{
    console.log({ips});
    if(Array.isArray(ips))
    {
       return ips.length>0?ips[ips.length-1]:false;
    } 
    if(!ips)return false;
    if(typeof ips==='string')
    {
        const [ip_address]=ips.split(',');
        return ip_address;
    }
    return ips;
}

const getIpAddr=(req)=>{
    const {headers, ip, hostname, ips}=req;
    return parseIps(headers['x-forwarded-for']) || parseIps(ips) || ip || hostname;
}

export const createLog = async(user_id, log, req)=>{
    const ip_address=getIpAddr(req);
    return await LOGSCH.create({user_id, ip_address, log});
}
