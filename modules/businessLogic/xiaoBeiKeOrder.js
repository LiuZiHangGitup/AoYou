var Config = require('./../config.js');

var xiaoBeiKeOrderSchema = Config.mongoose.Schema({
    uid:{type:Number,default:0},
    time:{type:Number,default:0},
    ifbuy:{type:Boolean,default:false},
    state:{type:Boolean,default:false},
    price:{type:Number,default:0},
    buynum:{type:Number,default:0}
});

// 制作后台管理k线图所需数据
xiaoBeiKeOrderSchema.statics.adminShowKXianTu = function(params,callback){
    this.model('XiaoBeiKeOrders').find({state:true}).sort({time:-1}).exec(function(err,doc){
        if(err){
            callback({code:0,msg:'网络错误'});
            return;
        }else{
            // 获取到后10条数据 首先获取增高数据
            var oldDoc = doc.reverse();
            var time = [];
            var KJia = [0];
            var ShangJia = [];
            var DiJia = [];
            var NowJia = 0;
            var index = 0;
            var pushJia = function(){
                if(index >= oldDoc.length){
                    callback({code:1,time:time,ShangJia:ShangJia,DiJia:DiJia,KJia:KJia});
                    return;
                }else{
                    time.push(oldDoc[index].time);
                    new Promise(function(resolve,reject){
                        if(index == 0){
                            ShangJia.push(oldDoc[index].price);
                            DiJia.push(0);
                            NowJia = (parseFloat(KJia[index]) + parseFloat(ShangJia[index]) - DiJia[index]).toFixed(2);
                            KJia.push(NowJia);
                            resolve();
                        }else{
                            var cha = oldDoc[index-1].price - oldDoc[index].price;
                            console.log("cha:",String(cha).indexOf('-'))
                            // 首先判断是升价还是降价
                            if(String(cha).indexOf('-') == -1){
                                // 降价处理
                                ShangJia.push(0);
                                DiJia.push(oldDoc[index].price);
                                NowJia = (parseFloat(KJia[index]) + parseFloat(ShangJia[index]) - DiJia[index]).toFixed(2);
                                if(index == oldDoc.length - 1){

                                }else{
                                    KJia.push(NowJia);
                                }
                                resolve();
                            }else if(String(cha).indexOf('-') == 0){
                                // 涨价处理
                                DiJia.push(0);
                                ShangJia.push(oldDoc[index].price);
                                NowJia = (parseFloat(KJia[index]) + parseFloat(ShangJia[index]) - DiJia[index]).toFixed(2);
                                if(index == oldDoc.length - 1){
                                    
                                }else{
                                    KJia.push(NowJia);
                                }
                                resolve();
                            }
                        }
                    }).then(function(){
                        index++;
                        pushJia();
                    })
                }
            }
            pushJia();
        }
    })
}

// 制作k线图所需数据
xiaoBeiKeOrderSchema.statics.showKXianTu = function(params,callback){
    this.model('XiaoBeiKeOrders').find({state:true}).sort({time:-1}).limit(10).exec(function(err,doc){
        if(err){
            callback({code:0,msg:'网络错误'});
            return;
        }else{
            // 获取到后10条数据 首先获取增高数据
            var oldDoc = doc.reverse();
            var time = [];
            var KJia = [0];
            var ShangJia = [];
            var DiJia = [];
            var NowJia = 0;
            var index = 0;
            var pushJia = function(){
                if(index >= oldDoc.length){
                    callback({code:1,time:time,ShangJia:ShangJia,DiJia:DiJia,KJia:KJia});
                    return;
                }else{
                    time.push(oldDoc[index].time);
                    new Promise(function(resolve,reject){
                        if(index == 0){
                            ShangJia.push(oldDoc[index].price);
                            DiJia.push(0);
                            NowJia = (parseFloat(KJia[index]) + parseFloat(ShangJia[index]) - DiJia[index]).toFixed(2);
                            KJia.push(NowJia);
                            resolve();
                        }else{
                            var cha = oldDoc[index-1].price - oldDoc[index].price;
                            console.log("cha:",String(cha).indexOf('-'))
                            // 首先判断是升价还是降价
                            if(String(cha).indexOf('-') == -1){
                                // 降价处理
                                ShangJia.push(0);
                                DiJia.push(oldDoc[index].price);
                                NowJia = (parseFloat(KJia[index]) + parseFloat(ShangJia[index]) - DiJia[index]).toFixed(2);
                                if(index == oldDoc.length - 1){

                                }else{
                                    KJia.push(NowJia);
                                }
                                resolve();
                            }else if(String(cha).indexOf('-') == 0){
                                // 涨价处理
                                DiJia.push(0);
                                ShangJia.push(oldDoc[index].price);
                                NowJia = (parseFloat(KJia[index]) + parseFloat(ShangJia[index]) - DiJia[index]).toFixed(2);
                                if(index == oldDoc.length - 1){
                                    
                                }else{
                                    KJia.push(NowJia);
                                }
                                resolve();
                            }
                        }
                    }).then(function(){
                        index++;
                        pushJia();
                    })
                }
            }
            pushJia();
        }
    })
}

// 更改被购买的订单的订单状态
xiaoBeiKeOrderSchema.statics.updateOrderState = function(params,callback){
    this.model('XiaoBeiKeOrders').updateOne({_id:params._id},{state:true},function(err,doc){
        err?callback({code:0,msg:'网络错误'}):callback({code:1,msg:'修改成功'});
    })
}

// 查询购买此订单所需要的积分
xiaoBeiKeOrderSchema.statics.scoreIfCanBuy = function(params,callback){
    this.model('XiaoBeiKeOrders').findOne({_id:params._id},function(err,doc){
        if(err){
            callback({code:0,msg:'网络错误'});
            return;
        }else{
            var price = (doc.price*doc.buynum).toFixed(2);
            callback({code:1,price:price,num:doc.buynum,uid:doc.uid});
            return;
        }
    })
}

// 通过_id查询此订单是否已被购买
xiaoBeiKeOrderSchema.statics.findIdIfBuy = function(params,callback){
    this.model('XiaoBeiKeOrders').findOne({_id:params._id},['state'],function(err,doc){
        if(err){
            callback({code:0,msg:'网络错误'});
            return;
        }else if(doc.state == true){
            callback({code:2,msg:'已被购买'});
            return;
        }else{
            callback({code:1,msg:'可以购买'});
        }
    })
}

// 查询所有未卖出订单
xiaoBeiKeOrderSchema.statics.findAllPutOrder = function(params,callback){
    this.model('XiaoBeiKeOrders').find({ifbuy:false,state:false},function(err,doc){ 
        err?callback({code:0,msg:'网络错误'}):callback({code:1,data:doc});
    })
}

xiaoBeiKeOrderSchema.statics.createOneOrder = function(params,callback){
    this.model('XiaoBeiKeOrders').create(params,function(err,doc){
        err?callback({code:0,msg:'创建订单失败'}):callback({code:1,msg:'创建订单成功'});
    })
}



module.exports = Config.db.model('XiaoBeiKeOrders',xiaoBeiKeOrderSchema,'xiaobeikeorder');