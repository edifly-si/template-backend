export const makeDailyReportStatePanelData=(send, receive)=>{
    const data={};
    const result=[];
    for (let iii = 0; iii < send.length; iii++) {
        const {char_count, message_count, origin:addr} = send[iii];
        if(!data[`${addr}`])data[`${addr}`]={ send:{char_count:0, message_count:0}, receive:{char_count:0, message_count:0} };
        data[`${addr}`].send.char_count+=char_count;
        data[`${addr}`].send.message_count+=message_count;
    }
    for (let iii = 0; iii < receive.length; iii++) {
        const {char_count, message_count, dest:addr} = receive[iii];
        if(!data[`${addr}`])data[`${addr}`]={ send:{char_count:0, message_count:0}, receive:{char_count:0, message_count:0} };
        data[`${addr}`].receive.char_count+=char_count;
        data[`${addr}`].receive.message_count+=message_count;
    }
    for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
            const r = data[key];
            result.push({telexAddr:key, ...r});
        }
    }
    return result;
}

export const makeDailyReportStateAdminPanelData=(send, receive)=>{
    const data={};
    const result=[];
    for (let iii = 0; iii < send.length; iii++) {
        const {char_count, message_count, from_server:addr} = send[iii];
        if(!data[`${addr}`])data[`${addr}`]={ send:{char_count:0, message_count:0}, receive:{char_count:0, message_count:0} };
        data[`${addr}`].send.char_count+=char_count;
        data[`${addr}`].send.message_count+=message_count;
    }
    for (let iii = 0; iii < receive.length; iii++) {
        const {char_count, message_count, to_server:addr} = receive[iii];
        if(!data[`${addr}`])data[`${addr}`]={ send:{char_count:0, message_count:0}, receive:{char_count:0, message_count:0} };
        data[`${addr}`].receive.char_count+=char_count;
        data[`${addr}`].receive.message_count+=message_count;
    }
    for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
            const r = data[key];
            result.push({telexAddr:key, ...r});
        }
    }
    return result;
}

const addrSorter=(a, b)=>{
    if(a.telexAddress==='EDIfly')return -1;
    if(b.telexAddress==='EDIfly')return 1;
    return 0;
}

const compileData=(data, obj, isSend=false)=>{
    const {char_count, message_count, addr, server_name} = obj;
    const telexAddress=server_name.toLowerCase()==='external'?'TypeB':(server_name.toLowerCase()==='email'?'Email':'EDIfly');
    if(!data[`${addr}`])data[`${addr}`]={};
    if(!data[`${addr}`][`${telexAddress}`])data[`${addr}`][`${telexAddress}`]={receive:0, send:0, msg_in:0, msg_out:0};

    if(isSend)
    {
        data[`${addr}`][`${telexAddress}`].send+=char_count;
        data[`${addr}`][`${telexAddress}`].msg_out+=message_count;
    }
    else
    {
        data[`${addr}`][`${telexAddress}`].receive+=char_count;
        data[`${addr}`][`${telexAddress}`].msg_in+=message_count;
    }
}

export const makeDailyChartStateData=(send, receive)=>{
    const data={};
    const result=[];
    for (let iii = 0; iii < send.length; iii++) {
        const {origin:addr, to_server} = send[iii];
        compileData(data, {...send[iii], addr, server_name:to_server}, true)
    }
    for (let iii = 0; iii < receive.length; iii++) {
        const {dest:addr, from_server} = receive[iii];
        compileData(data, {...send[iii], addr, server_name:from_server}, false)        
    }
    for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
            const r = data[key];
            const title= `Telex Address ${key}`;
            const cData=[];
            for (const k in r) {
                if (Object.hasOwnProperty.call(r, k)) {
                    const x = r[k];
                    cData.push({...x, telexAddress:k});
                }
            }
            result.push({title, data:cData.sort(addrSorter)});
        }
    }
    return result;
}

export const makeDailyChartAdminData=(send, receive)=>{
    const data={};
    const result=[];
    for (let iii = 0; iii < send.length; iii++) {
        const { from_server:addr, to_server} = send[iii];
        compileData(data, {...send[iii], addr, server_name:to_server}, true);        
    }
    for (let iii = 0; iii < receive.length; iii++) {
        const {to_server:addr, from_server} = receive[iii];
        compileData(data, {...receive[iii], addr, server_name:from_server}, false);        
    }
    for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
            console.log(data[key], key);
            const r = data[key];
            const title= `Server Address ${key}`;
            const cData=[];
            for (const k in r) {
                if (Object.hasOwnProperty.call(r, k)) {
                    const x = r[k];
                    cData.push({...x, telexAddress:k});
                }
            }
            result.push({title, data:cData.sort(addrSorter)});
        }
    }
    return result;
}