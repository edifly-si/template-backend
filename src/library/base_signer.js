import jwt from 'jsonwebtoken';
// import fs from 'fs';

export default (privateKey, publicKey, signerOptions) => {
    const verifyToken=(aToken)=>{
        return jwt.verify(aToken, publicKey, signerOptions);
    }

    const signer=(uData)=>{
        // console.log(uData);
        return jwt.sign(uData, privateKey, signerOptions);
    }

    const decode=(aToken)=>{
        try {
            return verifyToken(aToken) && jwt.decode(aToken, {complete:false});       
        } catch (error) {
            return false;
        }
    }

    const refreshToken=(aToken)=>{
        const {aud, exp, iat, sub, ...uData}=decode(aToken);
        return uData && signer(uData);
    }

    return { verifyToken, signer, decode, refreshToken }
}
