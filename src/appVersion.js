import numeral from 'numeral';

export const Version=0;
export const MajorVersion=0;
export const MinorVersion=0;
export const buildNumber=0;
export const AppVersion=`${Version}.${MajorVersion}.${MinorVersion}.${numeral(buildNumber).format('0000')}`;

export const UpdateHistory=[
    
]

export const getUpdateLogs=()=>{
    if(UpdateHistory.length<5)return UpdateHistory;
    const up=[];
    for (let uuu = 0; uuu < 5; uuu++) {
        const u = UpdateHistory[uuu];
        up.push(u);
    }
    return up;
}