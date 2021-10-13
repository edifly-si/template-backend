let envData={};

export const setEnv=(env)=>{
    envData={...env};
}

export const getEnv=(name, defaultValue)=>{
    return envData[name] || defaultValue;
}