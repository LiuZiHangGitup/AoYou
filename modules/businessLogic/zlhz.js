const Config = require('./../config.js');

var zlhzSchema = new Config.mongoose.Schema({
    // 项目名称
    name:{type:String,default:''},
    // 项目价格
    price:{type:Number,default:0},
    // 所属商家
    uid:{type:String,default:''},
    // 项目库存
    num:{type:Number,default:0},
    // 购买次数
    buycount:{type:Number,default:0},
    // 前台是否显示此项目
    ifshow:{type:Boolean,default:true},
    // 缩略图路径
    src:{type:String,default:''},
    // 项目详情图片数组
    srcArray:{type:Array,default:[]},
    // 项目介绍
    msg:{type:String,default:'暂无介绍'},
    // 一级返佣
    oncecom:{type:Number,default:0},
    // 二级返佣
    secondcom:{type:Number,default:0},
    // 商家比例
    business:{type:Number,default:0},
    // 项目机构返佣
    mechanismcom:{type:Number,default:0},
    // 项目所属机构
    xmname:{type:String,default:0},
    // 区别
    qubie:{type:Number,default:2},
    // 上传时间
    createtime:{type:Number,default:new Date().getTime()}
});

// 根据项目_id获取项目参数
zlhzSchema.statics.findOneZlhz = function(params,callback){
    this.model('Zlhzs').findOne({_id:params._id},function(err,doc){
        err?callback({code:0,msg:'网络错误'}):callback({code:1,data:doc});
    })
}

// 根据商品id和商品num计算购买商品所需总钱数
zlhzSchema.statics.findYlhPrice = function(params,callback){
    var allPrice = 0,index = 0,goodList = params.goodList,goodLength = params.goodList.length,_this = this;
    findAllPrice();
    function findAllPrice(){
        if(index == goodLength){
            callback({code:1,price:allPrice});
            return;
        }else{
            _this.model('Zlhzs').findOne({_id:goodList[index]._id},['price'],function(err,doc){
                if(err){
                    callback({code:0,msg:'网络错误'});
                    return;
                }else{
                    var num = parseFloat(goodList[index].num);
                    var thisGoodPrice = doc.price*num;
                    allPrice = (parseFloat(allPrice) + parseFloat(thisGoodPrice)).toFixed(2);
                    index++;
                    findAllPrice();
                }
            })
        }
    }
}

// 获取商品总条数
zlhzSchema.statics.findZlhzCount = function(params,callback){
    if(params.houtai == true){
        this.model('Zlhzs').find({ifshow:true},function(err,doc){
            err?callback({code:0,msg:'网络错误'}):callback({data:{code:1,count:doc.length+8}});
        })
    }else{
        this.model('Zlhzs').find({qubie:params.qubie,ifshow:true},function(err,doc){
            err?callback({code:0,msg:'网络错误'}):callback({code:1,count:doc.length});
        })
    }
}

// 修改单个项目参数
zlhzSchema.statics.changeXm = function(req,callback){
    this.model('Zlhzs').findOne({_id:req._id},['name','oncecom','secondcom','price','uid','business','buycount','msg'],function(err,doc){
        if(err){
            callback({code:0,msg:'此项目已丢失或网络错误'});
        }else{
            doc.name = req.name;
            doc.oncecom = req.oncecom;
            doc.secondcom = req.secondcom;
            doc.price = req.price;
            doc.uid = req.uid;
            doc.business = req.business;
            doc.buycount = req.buycount;
            doc.msg = req.msg;
            doc.mechanismcom = req.mechanismcom;
            doc.xmname = req.xmname;
            doc.qubie = req.qubie;
            doc.save(function(erra,doca){
                erra?callback({code:0,msg:'修改失败'}):callback({code:1,msg:'修改成功'})
            })
        }
    })
}

// 增加单个项目购买次数
zlhzSchema.statics.addXmCount = function(req,callback){
    var _this = this;
    // 首先查询
    _this.model('Zlhzs').findOne({_id:req.id},['buycount'],function(err,doc){
        if(err){
            callback({code:0,msg:'网络错误'})
            return;
        }else{
            // 开始修改
            doc.buycount++;
            doc.save(function(erra,doca){
                erra?callback({code:0,msg:'修改单个项目购买量失败'}):callback({code:1,msg:'修改成功'})
            })
        }
    })
}

// 下架单个项目
zlhzSchema.statics.delXm = function(req,callback){
    this.model('Zlhzs').updateOne({_id:req.id},{ifshow:false},function(err,doc){
        err?callback({code:0,msg:'网络错误，下架失败'}):callback({code:1,msg:'下架成功'})
    })
}

zlhzSchema.statics.newXm = function(req,callback){
    var params = {
        name:req.name,
        uid:parseFloat(req.uid),
        price:parseFloat(req.price),
        num:parseFloat(req.num),
        buycount:parseFloat(req.buycount),
        msg:req.msg,
        src:req.src,
        srcArray:req.srcArray,
        ifshow:true,
        oncecom:parseFloat(req.onceCom),
        secondcom:parseFloat(req.secondCom),
        business:parseFloat(req.business),
        mechanismcom:parseFloat(req.mechanismcom),
        xmname:String(req.xmname),
        qubie:parseFloat(req.qubie),
        createtime:new Date().getTime()
    }
    this.model('Zlhzs').create(params,function(err,doc){
        console.log("err:",err)
        err?callback({code:0,msg:'上传失败'}):callback({code:1,msg:'上传成功'})
    })
}

zlhzSchema.statics.findAllCanShowXm = function(req,callback){
    var quBie = req.quBie;
    if(req.houtai == true){
        var pageValue = req.pageValue;
        this.model('Zlhzs').find({ifshow:true}).sort('-createtime').skip((req.page-1)*pageValue).limit(pageValue).exec(function(err,doc){
            err?callback({code:0,msg:'查询失败'}):callback({code:1,msg:'查询成功',data:doc});
        })
        return;
    }else{
        var pageValue = req.pageValue;
        this.model('Zlhzs').find({ifshow:true,qubie:quBie}).sort('-createtime').skip((req.page-1)*pageValue).limit(pageValue).exec(function(err,doc){
            err?callback({code:0,msg:'查询失败'}):callback({code:1,msg:'查询成功',data:doc});
        })
        return;
    }
}

var Zlhz = Config.db.model('Zlhzs',zlhzSchema,'zlhzs');
module.exports = Zlhz;