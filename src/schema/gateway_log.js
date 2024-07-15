let m =  require('mongoose')
let Schema = m.Schema
let sch = new m.Schema({
    application_id:{type: Schema.Types.ObjectId, autopopulate:{ select: '-secret -key' }, ref:'application'},
    path_id:{type: Schema.Types.ObjectId, autopopulate:true, ref:'path'},
    request:String,
    response:String,
    api_time:Number,
    request_length:Number,
    response_length:Number,
    calculated:{type:Boolean, default:false},
    createdBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    createdAt:{type:Date, default:Date.now},
    deleted:{type:Number, default:0},
    deletedBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    deletedAt:{type:Date},
})

sch.index({application_id:1},{unique:true})
sch.plugin(require('mongoose-autopopulate'))

module.exports = m.model('gateway_log',sch);