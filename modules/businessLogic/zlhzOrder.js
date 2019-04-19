const Config = require('./../config.js');

var zlhzOrderSchema = new Config.mongoose.Schema({
    // 购买者uid
    uid:{type:Number,default:0},
    // 项目归属者uid
    xmuid:{type:Number,default:0},
    // 订单图片
    orderimg:{type:String,default:''},
    // 购买时间
    buytime:{type:Number,default:0},
    // 项目名称
    xmname:{type:String,default:''},
    // 购买者姓名
    username:{type:String,default:''},
    // 购买者电话
    userphone:{type:Number,default:0},
    // 购买者地址
    address:{type:String,default:''},
    // 购买者备注
    msg:{type:String,default:''},
    // 订单状态
    stu:{type:Number,default:0}
});

// 修改单个订单状态
zlhzOrderSchema.statics.updateOnceOrder = function(req,callback){
    this.model('ZlhzOrders').updateOne({_id:req._id},{stu:parseInt(req.type)},function(err,doc){
        err?callback({code:0,msg:'修改订单状态失败'}):callback({code:1,msg:'修改订单状态成功'})
    })
}

// 删除单个订单
zlhzOrderSchema.statics.delOnceOrder = function(req,callback){
    this.model('ZlhzOrders').deleteOne({_id:req._id},function(err,doc){
        err?callback({code:0,msg:'删除失败'}):callback({code:1,msg:'删除成功'})
    })
}

// 生成项目订单
zlhzOrderSchema.statics.newOrder = function(params,callback){
    this.model('ZlhzOrders').create(params,function(err,doc){
        err?callback({code:0,msg:'网络错误，创建订单失败'}):callback({code:1,msg:'创建订单成功'})
    })
}

// 查詢所有订单
zlhzOrderSchema.statics.findAllOrder = function(req,callback){
    this.model('ZlhzOrders').find({},function(err,doc){
        err?callback({code:0,msg:'查询失败'}):callback({code:1,data:doc.reverse()})
    })
}


var ZlhzOrder = Config.db.model('ZlhzOrders',zlhzOrderSchema,'zlhzorders');
module.exports = ZlhzOrder;