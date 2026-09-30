import {NextResponse} from 'next/server';import {connectDB} from '../../../lib/db';import Submission from '../../../lib/model';import {eventYear,eventMonth,isSelectableMonth} from '../../../lib/constants';

const GU_MONTH_FULL=['જાન્યુઆરી','ફેબ્રુઆરી','માર્ચ','એપ્રિલ','મે','જૂન','જુલાઈ','ઓગસ્ટ','સપ્ટેમ્બર','ઓક્ટોબર','નવેમ્બર','ડિસેમ્બર'];
const MONTHS_LABEL=`${GU_MONTH_FULL[eventMonth]} ${eventYear}`;
const allowed=v=>{const d=new Date(v);return !isNaN(d)&&isSelectableMonth(d.getFullYear(),d.getMonth());};

export async function POST(req){try{const body=await req.json();if(body.fromDate&&body.toDate){const from=new Date(body.fromDate),to=new Date(body.toDate);if(!allowed(body.fromDate)||!allowed(body.toDate)){return NextResponse.json({error:`સેવાની તારીખ ફક્ત ${MONTHS_LABEL} માટે જ સાધ્ય છે.`},{status:400});}const diffDays=Math.round((to-from)/(1000*60*60*24));if(diffDays<4){return NextResponse.json({error:'સેવાનો સમયગાળો ઓછામાં ઓછો ૫ દિવસ હોવો જ જોઈએ.'},{status:400});}}await connectDB();const doc=await Submission.create(body);return NextResponse.json({ok:true,id:doc._id});}catch(e){return NextResponse.json({error:e.message||'Unable to save form'},{status:400});}}
