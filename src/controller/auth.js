import {createAuthController} from './utils';
import {refreshToken, decode} from '../library/signer';
import {Model} from '../model/users';

const rtr=createAuthController(Model, decode, refreshToken);

export default rtr;
