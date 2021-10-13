import jwt from 'jsonwebtoken';
import fs from 'fs';

const privateKey=fs.readFileSync('./key/private.pem');
const publicKey=fs.readFileSync('./key/public.pem');
const signerOptions= {expiresIn:'5h', audience:'HKNet', subject:'WebTelex', algorithm:'RS256'};

export const verifyToken=(aToken)=>{
    return jwt.verify(aToken, publicKey, signerOptions);
}

export const signer=(uData)=>{
    // console.log(uData);
    return jwt.sign(uData, privateKey, signerOptions);
}

export const decode=(aToken)=>{
    try {
        return verifyToken(aToken) && jwt.decode(aToken, {complete:false});       
    } catch (error) {
        return false;
    }
}

export const refreshToken=(aToken)=>{
    const {aud, exp, iat, sub, ...uData}=decode(aToken);
    return uData && signer(uData);
}