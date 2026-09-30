import {SignJWT,jwtVerify} from 'jose';
const secret=new TextEncoder().encode(process.env.AUTH_SECRET||'dev-secret-change-me');
export async function createAdminToken(){return new SignJWT({role:'admin'}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('1d').sign(secret);}
export async function verifyAdminToken(token){try{const {payload}=await jwtVerify(token,secret);return payload?.role==='admin';}catch{return false;}}