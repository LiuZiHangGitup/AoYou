const Config = require('./../config.js');

const Users = require('./../runtimes/users.js');

const UserInformation = require('./userInformation.js');

const _Logs = require('./../runtimes/logs.js');

var ziYuanQuanOrderSchema = new Config.mongoose.Schema({
    // 订单归属者
    uid:{type:Number,default:0},
    // 订单生成时间
    buytime:{type:Number,default:new Date().getTime()},
    // 订单小倍壳价格
    price:{type:Number,default:0},
    // 交易小倍壳数量
    num:{type:Number,default:0},
    // 是否匹配   1未匹配    2已匹配等待双方确认   3已完成
    ifpipei:{type:Number,default:1},
    // 匹配成功时间
    pipeitime:{type:Number,default:new Date().getTime()},
    // 买单或买单 1买单  2买单
    buyorsell:{type:Number,default:0},
    // 买家信息
    buyothorinformation:{type:Array,default:[]},
    // 卖家信息
    sellothorinformation:{type:Array,default:[]},
    // 订单总价
    allprice:{type:Number,default:0},
    // 匹配图片
    pipeiimg:{type:String,default:0},
    // 被匹配订单
    pipeiid:{type:String,default:''}
});

// 后台管理获取订单
ziYuanQuanOrderSchema.statics.findAdmOrder = function(params,callback){
    var _this = this;
    _this.model('ZiYuanQuanOrders').find(params).sort('-buytime').exec(function(err,doc){
        if(err){
            callback({code:0,msg:'网络错误'});
            return;
        }else{
            callback({code:1,data:doc});
        }
    })
}

// 获取用户人脉
ziYuanQuanOrderSchema.statics.findUserRenMai = function(params,callback){
    var _this = this;
    // 查询此用户已完成的所有订单
    _this.model('ZiYuanQuanOrders').find({uid:params.uid,ifpipei:3}).sort('-buytime').exec(function(erra,doca){
        if(erra){
            callback({code:0,msg:'网络错误'});
            return;
        }else{
            // 过滤订单  如果是买单获取卖家信息,如果是买单获取买家信息
            var uidArray = [];
            var firstArray = [];
            for(var i = 0; i < doca.length; i++){
                // 买单获取卖家信息
                if(doca[i].buyorsell == 1){
                    // 判断是否已添加了此用户的信息 为-1为未添加
                    if(uidArray.indexOf(doca[i].sellothorinformation[0].uid) == -1){
                        uidArray.push(doca[i].sellothorinformation[0].uid);
                        firstArray.push(doca[i].sellothorinformation[0]);
                    }
                    if(i == doca.length -1){
                        callback({code:1,data:firstArray});
                        return;
                    }
                // 卖单获取买家信息
                }else if(doca[i].buyorsell == 2){
                    // 判断是否已添加了此用户的信息 为-1为未添加
                    if(uidArray.indexOf(doca[i].buyothorinformation[0].uid) == -1){
                        uidArray.push(doca[i].buyothorinformation[0].uid);
                        firstArray.push(doca[i].buyothorinformation[0]);
                    }
                    if(i == doca.length -1){
                        callback({code:1,data:firstArray});
                        return;
                    }
                }
            }
        }
    })
}
// 卖家确认订单完成
ziYuanQuanOrderSchema.statics.goSuccessZyqOrder = function(params,callback){
    var _this = this;
    _this.model('ZiYuanQuanOrders').findOne({_id:params._id},function(erra,doca){
        if(erra){
            callback({code:0,msg:'网络错误'});
            return;
        }else{
            var addNum = parseFloat(doca.num);
            var pipeiid = doca.pipeiid;
            _this.model('ZiYuanQuanOrders').findOne({_id:pipeiid},function(errb,docb){
                if(errb){
                    callback({code:0,msg:'网络错误'});
                    return;
                }else{
                    var buyUid = docb.uid;
                    Users.findUserHaveBeiKe({uid:buyUid},function(xiaoBeiKeData){
                        if(xiaoBeiKeData.code == 1){
                            var newAddNum = parseFloat(xiaoBeiKeData.num) + addNum;
                            Users.reduceXiaoBeiKe({uid:buyUid,num:newAddNum},function(dataa){
                                if(dataa.code == 1){
                                    // 修改匹配订单参数
                                    _this.model('ZiYuanQuanOrders').updateOne({_id:params._id},{ifpipei:3},function(errc,docc){
                                        if(errc){
                                            callback({code:0,msg:'网络错误'});
                                            return;
                                        }else{
                                            _this.model('ZiYuanQuanOrders').updateOne({_id:pipeiid},{ifpipei:3},function(errd,docd){
                                                if(errd){
                                                    callback({code:0,msg:'网络错误'});
                                                    return;
                                                }else{
                                                    // 给卖家和买家生成日志
                                                    _Logs.addLog({uid:buyUid,type:2,msg:'【资源圈】订单已完成,增加'+addNum+'个小倍壳'},function(logData){
                                                        if(logData.code == 1){
                                                            _Logs.addLog({uid:params.uid,type:2,msg:'【资源圈】订单已完成'},function(logDataTwo){
                                                                if(logDataTwo.code == 1){
                                                                    callback({code:1,msg:'成功完成订单'})
                                                                }else{
                                                                    callback({code:0,msg:'日志生成错误'});
                                                                    return;
                                                                }
                                                            })
                                                        }else{
                                                            callback({code:0,msg:'日志生成错误'});
                                                            return;
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }else{
                                    callback({code:0,msg:'网络错误'});
                                    return;
                                }
                            })
                        }else{
                            callback({code:0,msg:'网络错误'});
                            return;
                        }
                    })
                }
            })
            // 增加购买者小倍壳数量
            
        }
    })
}

// 上传付款截图
ziYuanQuanOrderSchema.statics.uploadZyqOrders = function(params,callback){
    var _this = this;
    _this.model('ZiYuanQuanOrders').findOne({_id:params._id},function(err,doc){
        if(err){
            callback({code:0,msg:'网络错误'});
            return;
        }else{
            var othreId = doc.pipeiid;
            _this.model('ZiYuanQuanOrders').findOneAndUpdate({_id:params._id},{pipeiimg:params.imgUrl},function(onwerErr,onwerDoc){
                if(onwerErr){
                    callback({code:0,msg:'网络错误'});
                    return;
                }else{
                    onwerUid = onwerDoc.uid;
                    _this.model('ZiYuanQuanOrders').findOneAndUpdate({_id:othreId},{pipeiimg:params.imgUrl},function(otherErr,otherDoc){
                        if(otherErr){
                            callback({code:0,msg:'网络错误'});
                            return;
                        }else{
                            var othreUid = otherDoc.uid;
                            // 给双方生成日志
                            _Logs.addLog({uid:onwerUid,type:2,msg:'【资源圈】您已提交截图,等待对方确认。'},function(logData){
                                if(logData.code == 1){
                                    _Logs.addLog({uid:othreUid,type:2,msg:'【资源圈】已有截图上传,请尽快确认完成订单。'},function(logDataTwo){
                                        if(logDataTwo.code == 1){
                                            callback({code:1,msg:'上传成功'});
                                            return;
                                        }else{
                                            callback({code:0,msg:'生成日志错误'});
                                            return;
                                        }
                                    })
                                }else{
                                    callback({code:0,msg:'生成日志错误'});
                                    return;
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

// 查询待双方确认的订单信息
ziYuanQuanOrderSchema.statics.findDaiQueRenOrder = function(params,callback){
    var _this = this;
    _this.model('ZiYuanQuanOrders').findOne({_id:params._id},function(err,doc){
        if(err){
            callback({code:0,msg:'网络错误'});
            return;
        }else{
            if(params.qubie == 1){
                callback({code:1,data:doc.sellothorinformation[0],pipeiimg:doc.pipeiimg});
                return;
            }else if(params.qubie == 2){
                callback({code:1,data:doc.buyothorinformation[0],pipeiimg:doc.pipeiimg});
                return;
            }
        }
    })
}

// 获取用户所有订单
ziYuanQuanOrderSchema.statics.findUserAllOrders = function(params,callback){
    this.model('ZiYuanQuanOrders').find({uid:params.uid}).sort('-buytime').exec(function(err,doc){
        err?callback({code:0,msg:'网络错误'}):callback({code:1,data:doc});
    })
}

// 卖出功能
ziYuanQuanOrderSchema.statics.createOrderSell =  function(params,callback){
    var _this = this;
    var uid = params.uid;
    var num = parseFloat(params.num);
    var price = parseFloat(params.price);
    var allNum = (num*1.3).toFixed(2);
    var surplusNum = 0;
    // 首先判断小倍壳数量是否充足
    Users.findUserHaveBeiKe({uid:uid},function(xiaoBeiKeNumData){
        if(xiaoBeiKeNumData.code == 1){
            if(xiaoBeiKeNumData.num >= allNum){
                // 计算出用户剩余小倍壳数
                surplusNum = (parseFloat(xiaoBeiKeNumData.num.toFixed(2)) - parseFloat(allNum)).toFixed(2);
                // 小倍壳数量充足  生成订单初始参数
                // 查询卖出者的所有信息
                UserInformation.findOneUser({uid:uid},function(userInformationData){
                    if(userInformationData.code == 0){
                        callback({code:0,msg:userInformationData.msg});
                        return;
                    }else{
                        var orderData = {
                            uid:uid,
                            buytime: new Date().getTime(),
                            price:price,
                            num:num,
                            ifpipei:1,
                            pipeitime:0,
                            buyorsell:2,
                            buyothorinformation:[],
                            sellothorinformation:[{
                                uid:userInformationData.data.uid,
                                wx:userInformationData.data.wx,
                                yinhangka:userInformationData.data.yinhangka,
                                phone:userInformationData.data.phone,
                                shenfenzheng:userInformationData.data.shenfenzheng,
                                name:userInformationData.data.name,
                                zhifubao:userInformationData.data.zhifubao,
                                nickname:userInformationData.data.nickname
                            }],
                            allprice:(price*num).toFixed(2),
                            pipeiimg:'',
                            pipeiid:''
                        }
                        // 查询是否有同价格，同数量，未匹配的买单进行匹配
                        _this.model('ZiYuanQuanOrders').find({ifpipei:1,num:num,price:price,buyorsell:1}).sort('-buytime').exec(function(ziYuanQuanOrderErr,ziYuanQuanOrderDoc){
                            if(ziYuanQuanOrderErr){
                                callback({code:0,msg:'网络错误'});
                                return;
                            }else if(ziYuanQuanOrderDoc == undefined || ziYuanQuanOrderDoc == null || ziYuanQuanOrderDoc == [] || ziYuanQuanOrderDoc.length == 0){
                                // 未找到可匹配订单
                                _this.model('ZiYuanQuanOrders').create(orderData,function(erra,doca){
                                    if(erra){
                                        callback({code:0,msg:'网络错误'})
                                        return;
                                    }else{
                                        // 扣除该用户一定贝壳数量
                                        Users.reduceXiaoBeiKe({uid:uid,num:surplusNum},function(reduceXiaoBeiKeData){
                                            if(reduceXiaoBeiKeData.code == 1){
                                                // 生成用户日志
                                                _Logs.addLog({uid:uid,type:2,msg:'【资源圈】卖出'+num+'小倍壳,扣除小倍壳'+allNum+''},function(logData){
                                                    if(logData.code == 1){
                                                        callback({code:1,msg:'卖出成功,等待订单匹配'});
                                                    }else{
                                                        callback({code:0,msg:'网络错误'});
                                                        return;
                                                    }
                                                })
                                            }else{
                                                callback({code:0,msg:'网络错误'});
                                                return;
                                            }
                                        })
                                    }
                                })
                            }else{ 
                                // 找到了可匹配订单  1.修改订单参数  2.创建新订单
                                orderData.ifpipei = 2;
                                orderData.pipeitime = new Date().getTime();
                                orderData.buyothorinformation = ziYuanQuanOrderDoc[0].buyothorinformation[0];
                                orderData.pipeiid = ziYuanQuanOrderDoc[0]._id;
                                _this.model('ZiYuanQuanOrders').create(orderData,function(erra,doca){
                                    if(erra){
                                        callback({code:0,msg:'网络错误'})
                                        return;
                                    }else{
                                        // 扣除该用户一定贝壳数量
                                        Users.reduceXiaoBeiKe({uid:uid,num:surplusNum},function(reduceXiaoBeiKeData){
                                            if(reduceXiaoBeiKeData.code == 1){
                                                // 生成用户日志
                                                _Logs.addLog({uid:uid,type:2,msg:'【资源圈】卖出'+num+'小倍壳,扣除小倍壳'+allNum+''},function(logData){
                                                    if(logData.code == 1){
                                                        // 修改被匹配订单参数
                                                        _this.model('ZiYuanQuanOrders').updateOne({_id:ziYuanQuanOrderDoc[0]._id},{sellothorinformation:orderData.sellothorinformation,ifpipei:2,pipeitime:new Date().getTime(),pipeiid:doca._id},function(piPeiShuJuErr,piPeiShuJuDoc){
                                                            if(piPeiShuJuErr){
                                                                callback({code:0,msg:'网络错误'});
                                                                return;
                                                            }else{
                                                                // 给被匹配者生成日志
                                                                _Logs.addLog({uid:ziYuanQuanOrderDoc[0].buyothorinformation[0].uid,type:2,msg:'【资源圈】您所买入的订单已匹配,请尽快处理'},function(logDataTwo){
                                                                    if(logDataTwo.code == 1){
                                                                        callback({code:1,msg:'卖出成功,订单匹配成功'});
                                                                    }else{
                                                                        callback({code:0,msg:'网络错误'});
                                                                        return;
                                                                    }
                                                                }) 
                                                            }
                                                        })
                                                    }else{
                                                        callback({code:0,msg:'网络错误'});
                                                        return;
                                                    }
                                                })
                                            }else{
                                                callback({code:0,msg:'网络错误'});
                                                return;
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }else{
                callback({code:0,msg:'小倍壳数量不足，请先进行购买'});
                return;
            }
        }else{
            callback({code:0,msg:'网络错误'});
            return;
        }
    })
}


// 买入功能
ziYuanQuanOrderSchema.statics.createOrderBuy = function(params,callback){
    var _this = this;
    var uid = params.uid;
    var num = parseFloat(params.num);
    var price = parseFloat(params.price);
    // 查询购买者的所有信息
    UserInformation.findOneUser({uid:uid},function(userInformationData){
        if(userInformationData.code == 0){
            callback({code:0,msg:userInformationData.msg});
            return;
        }else{
            // 创建订单初始必须参数
            var orderData = {
                uid:uid,
                buytime: new Date().getTime(),
                price:price,
                num:num,
                ifpipei:1,
                pipeitime:0,
                buyorsell:1,
                buyothorinformation:[{
                    uid:userInformationData.data.uid,
                    wx:userInformationData.data.wx,
                    yinhangka:userInformationData.data.yinhangka,
                    phone:userInformationData.data.phone,
                    shenfenzheng:userInformationData.data.shenfenzheng,
                    name:userInformationData.data.name,
                    zhifubao:userInformationData.data.zhifubao,
                    nickname:userInformationData.data.nickname
                }],
                sellothorinformation:[],
                allprice:(price*num).toFixed(2),
                pipeiimg:'',
                pipeiid:''
            }
            // 查询是否有同价格，同数量，未匹配的卖单进行匹配
            _this.model('ZiYuanQuanOrders').find({ifpipei:1,num:num,price:price,buyorsell:2}).sort('-buytime').exec(function(err,doc){
                if(err){
                    callback({code:0,msg:'网络错误'});
                    return;
                }else if(doc == null || doc == undefined || doc == [] || doc.length == 0){
                    // 没有找到可匹配订单  直接创建新订单
                    _this.model('ZiYuanQuanOrders').create(orderData,function(erra,doca){
                        if(erra){
                            callback({code:0,msg:'网络错误'});
                            return;
                        }else{
                            // 生成用户日志
                            _Logs.addLog({uid:uid,type:2,msg:'【资源圈】买入'+num+'小倍壳成功,等待订单匹配'},function(logData){
                                if(logData.code == 1){
                                    callback({code:1,msg:'买入成功,等待订单匹配'});
                                }else{
                                    callback({code:0,msg:'网络错误'});
                                    return;
                                }
                            })
                        }
                        return;
                    })
                }else{
                    // 找到了可匹配订单  1.修改订单参数  2.创建新订单
                    orderData.ifpipei = 2;
                    orderData.sellothorinformation = doc[0].sellothorinformation;
                    orderData.pipeitime = new Date().getTime();
                    orderData.pipeiid = doc[0]._id;
                    _this.model('ZiYuanQuanOrders').create(orderData,function(errb,docb){
                        if(errb){
                            callback({code:0,msg:'网络错误'});
                            return;
                        }else{
                            // 生成购买者日志
                            _Logs.addLog({uid:uid,type:2,msg:'【资源圈】买入'+num+'小倍壳,订单匹配成功请尽快处理。'},function(logData){
                                if(logData.code == 1){
                                    // 给被匹配的卖单匹配数据
                                    _this.model('ZiYuanQuanOrders').updateOne({_id:doc[0]._id},{buyothorinformation:orderData.buyothorinformation,ifpipei:2,pipeitime:new Date().getTime(),pipeiid:docb._id},function(piPeiShuJuErr,piPeiShuJuDoc){
                                        if(piPeiShuJuErr){
                                            callback({code:0,msg:'网络错误'});
                                            return;
                                        }else{
                                            // 给被匹配成功的玩家生成日志
                                            _Logs.addLog({uid:doc[0].sellothorinformation[0].uid,type:2,msg:'【资源圈】您的卖出订单匹配成功,请尽快处理'},function(logDataTwo){
                                                if(logDataTwo.code == 1){
                                                    callback({code:2,msg:'买入成功,订单匹配成功'});
                                                    return;
                                                }else{
                                                    callback({code:0,msg:'网络错误'});
                                                    return;
                                                }
                                            })
                                        }
                                    })
                                }else{
                                    callback({code:0,msg:'网络错误'});
                                    return;
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}




var ziYuanQuanOrder = Config.db.model('ZiYuanQuanOrders',ziYuanQuanOrderSchema,'ziyuanquanorders');
module.exports = ziYuanQuanOrder;