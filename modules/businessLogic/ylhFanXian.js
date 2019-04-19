const Config = require('./../config.js');

var ylhFanXianSchema = new Config.mongoose.Schema({
    uid:{type:Number,default:0},
    allday:{type:Number,default:0},
    lasttime:{type:Number,default:0},
    haveday:{type:Number,default:0},
    allprice:{type:Number,default:0}
})

// 增加已返现天数
ylhFanXianSchema.statics.addHaveDay = function(params,callback){
    var newTime = new Date().getTime();
    this.model('YlhFanXian').updateOne({_id:params._id},{haveday:params.haveday,lasttime:newTime},function(err,doc){
        err?callback({code:0,msg:'网络错误'}):callback({code:1,msg:'增加天数成功'});
    })
}

// 查询当前用户的所有返现记录
ylhFanXianSchema.statics.findUserAllFanXian = function(params,callback){
    this.model('YlhFanXian').find({uid:params.uid},function(err,doc){
        err?callback({code:0,msg:'网络错误'}):callback({code:1,data:doc});
    })
}

// 创建一条新的返现记录
ylhFanXianSchema.statics.newFanXian = function(params,callback){
    this.model('YlhFanXian').create(params,function(err,doc){
        console.log(err)
        err?callback({code:0,msg:'网络错误'}):callback({code:1,msg:'创建返现订单成功'});
    })
}

var YlhFanXian = Config.db.model('YlhFanXian',ylhFanXianSchema,'ylhfanxian');
module.exports = YlhFanXian;