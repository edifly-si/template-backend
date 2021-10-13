let m =  require('mongoose')
let Schema = m.Schema
let sch = new m.Schema({
    user_id:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    ip_address:String,    
    log:String,
    createdAt:{type:Date, default:Date.now},
    
})

sch.index({user_id:1});
sch.index({ip_address:1});
sch.plugin(require('mongoose-autopopulate'));

module.exports = m.model('activity_log',sch);