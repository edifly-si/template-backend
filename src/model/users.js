import USERSCH from '../schema/users';
import BaseUser from './base_users';
import {signer} from '../library/signer';

const userModel=BaseUser(USERSCH, 'SALT', signer);
export const Model=userModel;
export const {Login, changePassword, createDefaultUser, createUser, insert, paging, update, updateProfile} = userModel;
