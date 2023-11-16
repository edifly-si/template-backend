import FRCSCH from '../schema/flight_record';
import LOGSCH from '../schema/flight_record_logs';
import { SELFAIRPORT, addAirline, addAirport, addAcreg } from './apps';
import moment from 'moment';
import numeral from 'numeral';

const FNUMCACHE={};

const updateAirport=async(apt)=>{
    const {iata_code:code, icao_code, name, position, timezone}=apt;    
    return await addAirport(code, icao_code, name, position?.region?.city, position?.country?.code, position?.country?.name, 
        timezone?.name, timezone?.offset, position?.latitude, position?.longitude);
}

const addLog=async(frid, logs)=>{
    const {_id, flight_number, flight_date_str} = frid;
    return await LOGSCH.create({flight_record_id:_id, flight_number, flight_date_str, logs});
}

export const normalizeFlightNumber=(fnumber)=>{
    const carrier=fnumber.substr(0,2);
    const number=fnumber.substr(2);    
    if(!!parseInt(number))
    {
        return carrier+numeral(number).format('0000');
    }
    return fnumber;
}

const addCache=(fnumber)=>{
    const flight_number=normalizeFlightNumber(fnumber);
    if(!FNUMCACHE[flight_number])FNUMCACHE[flight_number]=true;        
    return true;
}

const processSch=async(selfAptId, schedule, selfAirport, isArrival=false)=>{
    const {from:origin, to:dest, flight_number:fnum, flight_date:flight_date_str, airline, aircraft, status, sta, std, eta, etd, ata, atd} = schedule;
    const airline_id=await addAirline(airline?.code?.iata, airline?.code?.icao, airline?.name);
    const org=isArrival?await updateAirport(origin):selfAptId;
    const des=isArrival?selfAptId:await updateAirport(dest);
    addCache(fnum)
    const flight_number=normalizeFlightNumber(fnum);
    
    const oCode=isArrival?origin?.iata_code:selfAirport?.iata_code;
    const dCode=isArrival?selfAirport?.iata_code:dest?.iata_code;

    const oriOffset=isArrival?origin?.timezone?.offset:selfAirport?.timezone?.offset;
    const desOffset=isArrival?selfAirport?.timezone?.offset:dest?.timezone?.offset;

    const regis=aircraft?.registration && `${aircraft.registration}`.replace('-','');
    const acReg=!regis?undefined:await addAcreg(airline_id, regis, aircraft?.model?.code, aircraft?.model?.text, aircraft?.country?.alpha2);

    const localSta=moment.unix(sta+desOffset).utc().format('HH:mm');
    const localStd=moment.unix(std+oriOffset).utc().format('HH:mm');

    const localEta=eta>0?moment.unix(eta+desOffset).utc().format('HH:mm'):'-';
    const localEtd=etd>0?moment.unix(etd+oriOffset).utc().format('HH:mm'):'-';

    const localAta=ata>0?moment.unix(ata+desOffset).utc().format('HH:mm'):'-';
    const localAtd=atd>0?moment.unix(atd+oriOffset).utc().format('HH:mm'):'-';

    const carrier=airline?.code?.iata;
    const flight_time=sta-std;
    const flight_record_id=`${flight_number}_${oCode}${dCode}_${flight_date_str}`;
    const utc_flight_date_str=moment.unix(sta).utc().format('DD-MMM-YYYY');
    // console.log({flight_record_id});
    const exists=await FRCSCH.findOne({flight_record_id});
    if(!exists)
    {
        const obj={ carrier, number:flight_number.substr(2), flight_number, flight_record_id,
            flight_date_str, actype:aircraft?.model?.text, aircraft_registration_id:acReg, airline_id, origin:org, dest:des, localStd, localSta, 
            unixStd:std, unixSta:sta, acreg:regis, localEta, localEtd, unixEtd:etd, unixEta:eta, flightTime:flight_time, status, localAta, localAtd, 
            unixAta:ata, unixAtd:atd, utc_flight_date_str
        };
        let log=`Schedule Created`;
        if(!!regis){
            log+=` With ACReg = ${regis}`;
            obj.acregUpdatedAt=new Date();
        }
        if(eta>0){
            obj.etaUpdatedAt=new Date();
            log+=` With ETA ${localEta}`;
        }
        else if(etd>0){
            obj.etdUpdatedAt=new Date();
            log+=` With ETD ${localEtd}`;
        }

        if(ata>0){
            obj.ataUpdatedAt=new Date();
            log+=` With ATA ${localAta}`;
        }
        else if(atd>0){
            obj.atdUpdatedAt=new Date();
            log+=` With ATD ${localAtd}`;
        }
        const frid=await FRCSCH.create(obj);
        await addLog({_id:frid._id, flight_number, flight_date_str}, log);
        return frid;
    }
    const logObj={_id:exists._id, flight_number, flight_date_str};
    if(!!eta){
        if(exists.unixEta!==eta){
            exists.etaUpdatedAt=new Date();
            await addLog(logObj, `Update ETA => ${localEta}`);
        }
        exists.unixEta=eta;
        exists.localEta=localEta;
    }
    if(!!ata){
        if(exists.unixAta!==ata){
            exists.ataUpdatedAt=new Date();
            await addLog(logObj, `Update ATA => ${localAta}`);
        }
        exists.unixAta=ata;
        exists.localAta=localAta;
    }
    if(!!atd){
        if(exists.unixAtd!==atd){
            exists.atdUpdatedAt=new Date();
            await addLog(logObj, `Update ATD => ${localAtd}`);
        }
        exists.unixAtd=atd;
        exists.localAtd=localAtd;
    }
    if(!!etd){
        if(exists.unixEtd!==etd){
            exists.etdUpdatedAt=new Date();
            await addLog(logObj, `Update ETD => ${localEtd}`);
        }
        exists.unixEtd=etd;
        exists.localEtd=localEtd;
    }
    if(!!std)exists.unixStd=std;
    if(!!sta)exists.unixSta=sta;
    if(exists.unixStd!==std){
        exists.stdUpdatedAt=new Date();
        await addLog(logObj, `Update STD => ${localStd}`);
    }
    if(exists.unixSta!==sta){
        exists.staUpdatedAt=new Date();
        await addLog(logObj, `Update STA => ${localSta}`);
    }
    exists.localStd=localStd;
    exists.localSta=localSta;
    if(!!acReg)
    {
        if(exists.acreg!==regis){
            exists.acregUpdatedAt=new Date();
            await addLog(logObj, `Update AC Registration => ${regis}`);
        }
        exists.actype=aircraft?.model?.text;
        exists.acreg=regis;
        exists.aircraft_registration_id=acReg;
    }
    if(exists.status!==status){
        await addLog(logObj, `Update Status => ${status}`);
        exists.statusUpdatedAt=new Date();
        exists.status=status;
    }
    exists.save();
    return exists;        
}

export const flightNumberExists=(fnumber)=>{
    const flight_number=normalizeFlightNumber(fnumber);
    return FNUMCACHE[flight_number];
}

export const saveFlights=async(body)=>{
    const {selfAirport, arrivals, departures}=body;
    
    if (SELFAIRPORT?.code.toUpperCase().trim()!==selfAirport.iata_code.toUpperCase())return false;   
    
    for (let iii = 0; iii < arrivals.length; iii++) {
        const sch=arrivals[iii];
        // console.log({sch});
        await processSch(SELFAIRPORT._id, sch, selfAirport, true);       
    }
    for (let iii = 0; iii < departures.length; iii++) {
        const sch=departures[iii];
        // console.log({sch});
        await processSch(SELFAIRPORT._id, sch, selfAirport, false);       
    }
    return true;
}

export const firstLoadCache=async()=>{
    const dt=moment().subtract(7,'days');
    const fnums=await FRCSCH.find({createdAt:{$gt:dt.toDate()}}, 'flight_number', {lean:true});
    for (let iii = 0; iii < fnums.length; iii++) {
        const {flight_number} = fnums[iii];
        addCache(flight_number);
    }
    return FNUMCACHE;
}
