// const envVar = require('./env.js');
const dotenv=require('dotenv');
dotenv.config();

module.exports = {
    apps : [{
      name   : process.env.NAME || "backend-apps",
      script : "npm",
      args   : "start",
      watch  : false,
      max_memory_restart: "2500M",
      out:"/dev/null"
    },
    {
      name: process?.env?.NAME || 'gateway-apps',
      script : "npm",
      args   : "run gateway",
      watch  : false,
      out:"/dev/null",  
      instances: parseInt(process?.env?.INSTANCE) || 1,
      exec_mode: "fork",
      watch: false,
      increment_var : 'APPID',
      env: {
          "APPID": 1,
          "NODE_ENV": "development"
      }
    }
  ]
  }
  