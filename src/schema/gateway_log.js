let m =  require('mongoose')
let Schema = m.Schema
let sch = new m.Schema({
    packet_id:{type: Schema.Types.ObjectId, autopopulate:true, ref:'packet'},
    request:String,
    response:String,
    headers:{type:Schema.Types.Mixed},
    createdAt:{type:Date, default:Date.now},
})

sch.plugin(require('mongoose-autopopulate'))

module.exports = m.model('gateway_log',sch);