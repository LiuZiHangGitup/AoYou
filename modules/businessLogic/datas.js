var Config = require('./../config.js');

var datasSchema = new Config.mongoose.Schema({
    name:{type:String,default:''},
    num:{type:Number,default:0},
    data:{type:Array,default:[]}
});



// 获取小倍壳轮播图
datasSchema.statics.findBeiKeBanner = function(params,callback){
    var _this = this;
    _this.model('datas').findOne({name:'小倍壳轮播图'},function(err,doc){
        console.log('doc.num:',doc.data)
        err?callback({code:0,msg:'网络错误'}):callback({code:1,data:doc.data});
    })
}

// 比较是否可卖出
datasSchema.statics.compareUpDown = function(params,callback){
    var _this = this;
    var price = params.price;
    _this.model('datas').findOne({name:'开盘价'},function(err,doc){
        if(err){
            callback({code:0,msg:'网络错误'});
            return;
        }else{  
            var upJia = (parseFloat(doc.num) + parseFloat(doc.num*10/100)).toFixed(2);
            var downJia = (parseFloat(doc.num) - parseFloat(doc.num*10/100)).toFixed(2);
            if(price > upJia){
                callback({code:0,msg:'最高不可超过'+upJia+''});
                return;
            }else if(price < downJia){
                callback({code:0,msg:'最低不能小于'+downJia+''});
                return;
            }else{
                callback({code:1});
                return;
            }
        }
    })
}

// 查询二次兑换比例
datasSchema.statics.findErCi = function(params,callback){
    this.model('datas').findOne({name:'二次兑换'},function(err,doc){
        err?callback({code:0,msg:'网络错误'}):callback({code:1,num:doc.num});
    })
}

// 查询开盘价
datasSchema.statics.findBeiKeJia = function(params,callback){
    var _this = this;
    _this.model("datas").findOne({name:'开盘价'},function(err,doc){
        if(err){
            callback({code:0,msg:'网络错误'});
            return;
        }else{
            var kaiPanJia = doc.num;
            var upJia = (parseFloat(doc.num) + parseFloat(doc.num*0.1)).toFixed(2);
            var downJia = (parseFloat(doc.num) - parseFloat(doc.num*0.1)).toFixed(2);
            _this.model('datas').findOne({name:'收盘价'},function(erra,doca){
                if(erra){
                    callback({code:0,msg:'网络错误'});
                    return;
                }else{
                    var showJia = doca.num;
                    callback({code:1,kaiPanJia:kaiPanJia,upJia:upJia,downJia:downJia,showJia:showJia});
                    return;
                }
            })
        }
    })
}
datasSchema.statics.findYlhFanXian = function(params,callback){
    this.model('datas').findOne({name:'易廉惠返现'},function(err,doc){
        err?callback({code:0,msg:'网络错误'}):callback({code:1,num:doc.num});
    })
}

// 改变小倍壳发行数量
datasSchema.statics.updateXiaoBeiKeNum = function(params,callback){
    this.model('datas').updateOne({name:'小倍壳数量'},{num:params.num},function(err,doc){
        err?callback({code:0}):callback({code:1})
    })
}

// 查询小倍壳发行数量
datasSchema.statics.findShuLiang = function(params,callback){ 
    this.model('datas').findOne({name:'小倍壳数量'},function(err,doc){
        err?callback({code:0,msg:'查询失败'}):callback({code:1,num:doc.num});
    })
}

// 查询小倍壳等级返佣
datasSchema.statics.findFanYong = function(params,callback){
    this.model('datas').findOne({name:'小倍壳返佣'},function(err,doc){
        err?callback({code:0,msg:'查询失败'}):callback({code:1,num:doc.num});
    })
}

// 修改小倍壳等级返佣
datasSchema.statics.upDatedatas = function(params,callback){
    this.model('datas').updateOne({name:params.name},{num:parseFloat(params.num)},function(err,doc){
        err?callback({code:0,msg:'修改失败'}):callback({code:1,msg:'修改成功'});
    })
}

module.exports = Config.db.model('datas',datasSchema,'datas');