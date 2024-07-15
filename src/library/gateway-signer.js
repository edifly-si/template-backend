import fs from 'fs';
import BaseSigner from './base_signer';

const privateKey=fs.readFileSync('./key/private-gateway.pem');
const publicKey=fs.readFileSync('./key/public-gateway.pem');
const signerOptions= {expiresIn:'6h', audience:'HKNet', subject:'PIM-portal-imigrasi', algorithm:'RS256'};

const sign = BaseSigner(privateKey, publicKey, signerOptions);

export const {decode, refreshToken, signer, verifyToken} = sign;
