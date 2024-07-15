let m =  require('mongoose')
let Schema = m.Schema
let sch = new m.Schema({
    application_id:{type: Schema.Types.ObjectId, autopopulate:{ select: '-secret -key' }, ref:'application'},
    method:String,
    path:String,
    name:String,
    query:[String], // 0: api_key, 1: basic auth, 2: generate token with time
    params:[String], 
    proxy_method:String,
    proxy_to:String,
    proxy_header:{type:Schema.Types.Mixed},
    resp_type:String, //json, xml, html, text
    timeout:Number,
    createdBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    createdAt:{type:Date, default:Date.now},
    deleted:{type:Number, default:0},
    deletedBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    deletedAt:{type:Date},
})

sch.index({application_id:1, path:1}, {unique:true});
sch.plugin(require('mongoose-autopopulate'));

module.exports = m.model('path',sch);