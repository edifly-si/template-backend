export const makeMonthlyReportStatePanelData=(send, receive)=>{
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

export const makeMonthlyReportStateAdminPanelData=(send, receive)=>{
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

const compileData=(data, obj, isSend=false)=>{
    const {char_count, message_count, addr, server_name, periodeDateStr} = obj;
    const telexAddress=server_name.toLowerCase()==='external'?'TypeB':(server_name.toLowerCase()==='email'?'Email':'EDIfly');
    if(!data[`${addr}`])data[`${addr}`]={address:{}, periode:{}};
    if(!data[`${addr}`].address[`${telexAddress}`])data[`${addr}`].address[`${telexAddress}`]={receive:0, send:0, msg_in:0, msg_out:0};
    if(!data[`${addr}`].periode[`${periodeDateStr}`])data[`${addr}`].periode[`${periodeDateStr}`]={char_edifly:0, char_typeb:0, char_email:0, 
        msg_edifly:0, msg_typeb:0, msg_email:0, rcv_char_edifly:0, rcv_char_typeb:0, rcv_char_email:0, 
        rcv_msg_edifly:0, rcv_msg_typeb:0, rcv_msg_email:0};
    if(isSend){
        data[`${addr}`].address[`${telexAddress}`].send+=char_count;
        data[`${addr}`].address[`${telexAddress}`].msg_out+=message_count;
    }
    else{
        data[`${addr}`].address[`${telexAddress}`].receive+=char_count;
        data[`${addr}`].address[`${telexAddress}`].msg_in+=message_count;
    }

    switch (telexAddress) {
        case 'TypeB':{
            if(isSend)
            {
                data[`${addr}`].periode[`${periodeDateStr}`].char_typeb+=char_count;
                data[`${addr}`].periode[`${periodeDateStr}`].msg_typeb+=message_count;                
            }
            else
            {
                data[`${addr}`].periode[`${periodeDateStr}`].rcv_char_typeb+=char_count;
                data[`${addr}`].periode[`${periodeDateStr}`].rcv_msg_typeb+=message_count;                
            }
            break;
        }
        
        case 'Email':{
            if(isSend){
                data[`${addr}`].periode[`${periodeDateStr}`].char_email+=char_count;
                data[`${addr}`].periode[`${periodeDateStr}`].msg_email+=message_count;                
            }
            else
            {
                data[`${addr}`].periode[`${periodeDateStr}`].rcv_char_email+=char_count;
                data[`${addr}`].periode[`${periodeDateStr}`].rcv_msg_email+=message_count;                
            }
            break;
        }

        default:{
            if(isSend){
                data[`${addr}`].periode[`${periodeDateStr}`].char_edifly+=char_count;
                data[`${addr}`].periode[`${periodeDateStr}`].msg_edifly+=message_count;                
            }
            else{
                data[`${addr}`].periode[`${periodeDateStr}`].rcv_char_edifly+=char_count;
                data[`${addr}`].periode[`${periodeDateStr}`].rcv_msg_edifly+=message_count;                
            }
            break;
        }
    }
}

const addrSorter=(a, b)=>{
    if(a.telexAddress==='EDIfly')return -1;
    if(b.telexAddress==='EDIfly')return 1;
    return 0;
}

export const makeMonthlyChartStateData=(send, receive)=>{
    const data={};
    const result=[];
    for (let iii = 0; iii < send.length; iii++) {
        const {origin:addr, to_server} = send[iii];
        compileData(data, {...send[iii], addr, server_name:to_server}, true);
    }
    for (let iii = 0; iii < receive.length; iii++) {
        const { dest:addr, from_server } = receive[iii];
        compileData(data, {...receive[iii], addr, server_name:from_server}, false);        
    }
    for (const key in data) {        
        if (Object.hasOwnProperty.call(data, key)) {
            const {periode, address} = data[key];
            const title= `Telex Address ${key}`;
            const addr=[];
            const dates=[];
            for (const k in address) {
                if (Object.hasOwnProperty.call(address, k)) {
                    const x = address[k];
                    addr.push({...x, telexAddress:k});
                }
            }
            for (const k in periode) {
                if (Object.hasOwnProperty.call(periode, k)) {
                    const x = periode[k];
                    dates.push({...x, date:k});
                }
            }
            result.push({title, data:{addr:addr.sort(addrSorter), periode:dates.sort((a,b)=>`${a.date}`.localeCompare(b.date))}});
        }
    }
    return result;
}

export const makeMonthlyChartAdminData=(send, receive)=>{
    const data={};
    const result=[];
    for (let iii = 0; iii < send.length; iii++) {
        const {from_server:addr, to_server} = send[iii];
        compileData(data, {...send[iii], addr, server_name:to_server}, true);        
    }
    for (let iii = 0; iii < receive.length; iii++) {
        const { to_server:addr, from_server} = receive[iii];
        compileData(data, {...receive[iii], server_name:from_server, addr}, false);
    }
    for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
            const {periode, address} = data[key];
            const title= `Server Address ${key}`;
            const addr=[];
            const dates=[];
            for (const k in address) {
                if (Object.hasOwnProperty.call(address, k)) {
                    const x = address[k];
                    addr.push({...x, telexAddress:k});
                }
            }
            for (const k2 in periode) {
                if (Object.hasOwnProperty.call(periode, k2)) {
                    const x = periode[k2];
                    dates.push({...x, date:k2});
                }
            }
            result.push({title, data:{addr:addr.sort(addrSorter), periode:dates.sort((a,b)=>`${a.date}`.localeCompare(b.date))}});
        }
    }
    return result;
}