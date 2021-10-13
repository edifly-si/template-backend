import USERSCH from '../schema/users';
import { signer } from '../library/signer';
import crypto from 'crypto';
import m from 'mongoose';
import {reqPaging} from './utils';
import { AppVersion } from '../appVersion';

const defaultUsername='admin';
const defaultLevel=0x1fff0;

const makeHashPassword=(username, password)=>{
    const salt=process.env.SALT || 'SADHUWHENDMSABVHSACJASLWQPR';
    var hash=crypto.createHmac('sha256', salt);
    hash.update(username);
    hash.update(password);
    return hash.digest('hex');
}

export const Login=async(username, password)=>{
    const hashed=makeHashPassword(username, password);
    // console.log(username, password);
    const uData=await USERSCH.findOne({username, password:hashed},'',{lean:true});
    if(!uData){
        throw new Error(`User ${username} Not Found or Wrong Password!`);
    }
    const {password:pwd, ...less}=uData;
    const level=less.level;
    const ver=AppVersion;
    return [signer({...less, level, be_version:ver}), uData];
}

export const getAll=async(level)=>{
    return await USERSCH.find({level:{$lte:level}}, '-password');
}

export const insert=async(data, uid)=>{
    const {password:pwd, username, ...less}=data;
    const password=makeHashPassword(username, pwd);
    const resp=await USERSCH.create({...less,  username, password, createdBy:m.Types.ObjectId(uid)});
    const {password:pwd2, ...result}=resp;
    if((data.level & 0x2)>0) await addUser(username, password);
    return result;
}

export const update=async(data, id)=>{
    const {password:pwd, username, ...less}=data;
    if(pwd!=='')
    {
        const password=makeHashPassword(username, pwd);
        const resp=await USERSCH.findOneAndUpdate({_id:m.Types.ObjectId(id)},{$set:{...less, password}});
        const {password:pwd2, ...result}=resp._doc;
        if((data.level & 0x2)>0) await addUser(username, password);
        return result;
    }
    const resp=await USERSCH.findOneAndUpdate({_id:m.Types.ObjectId(id)},{$set:{...less}});
    const {password:pwd2, ...result}=resp._doc;
    if((data.level & 0x2)>0) await addUser(username, pwd2);
    return result;
}

export const updateProfile=async(userId, body)=>{
    const {name, email, phone}=body;
    await USERSCH.updateOne({_id:m.Types.ObjectId(userId)},{$set:{name, email, phone}});
    const usr=await USERSCH.findOne({_id:m.Types.ObjectId(userId)}, '', {lean:true});    
    const { password, ...less }=usr;
    return signer(less);
}

export const changePassword=async(username, current, password)=>{
    const hashed=makeHashPassword(username, password);
    const currPass=makeHashPassword(username, current);

    const correct=await USERSCH.findOne({username, password:currPass});
    if(!correct)throw new Error('Wrong Current Password!');
    // console.log({hashed});
    return await USERSCH.updateOne({username}, {$set:{password:hashed}});
}

export const createUser=async(userData)=>{
    const {username, password, ...etc}=userData;
    const hashed=makeHashPassword(username, password);
    const resp=await USERSCH.create({...etc, username, password:hashed});
    const {password:pswd, ...less}=resp._id;
    return less;
}

export const createDefaultUser=async(password)=>{
    const exists=await USERSCH.findOne({username:defaultUsername});
    if(!!exists)throw new Error('User Default Exists!');
    return await createUser({ username:defaultUsername, password, name:'Super User', level:defaultLevel });    
}

export const paging=async(page, perPage, search, level)=>{
    const filter={
        level:{$lte:level}, 
        $or:[
            {username:new RegExp(search,'i')},
            {name:new RegExp(search,'i')},
        ]            
    };    
    return await reqPaging(USERSCH, page, perPage, filter);
}