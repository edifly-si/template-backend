let m =  require('mongoose')
let Schema = m.Schema
let sch = new m.Schema({
    application_id:String,
    name:String,
    auth:Number, // 0: api_key, 1: basic auth, 2: generate token with time
    secret:String, 
    key:String,
    whitelist_ip:[String],
    createdBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    createdAt:{type:Date, default:Date.now},
    deleted:{type:Number, default:0},
    deletedBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    deletedAt:{type:Date},
})

sch.index({application_id:1},{unique:true})
sch.plugin(require('mongoose-autopopulate'))

module.exports = m.model('application',sch);