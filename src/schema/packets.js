let m =  require('mongoose')
let Schema = m.Schema
let sch = new m.Schema({
    application_id:{type: Schema.Types.ObjectId, autopopulate:{ select: '-secret -key' }, ref:'application'},
    path_id:{type: Schema.Types.ObjectId, autopopulate:true, ref:'path'},
    api_time:Number,
    request_length:Number,
    response_length:Number,
    calculated:{type:Boolean, default:false},
    start_time:Number,
    stop_time:Number,
    resp_code:Number,
    ip_address:[String],
    createdAt:{type:Date, default:Date.now},
})

sch.plugin(require('mongoose-autopopulate'))

module.exports = m.model('packet',sch);