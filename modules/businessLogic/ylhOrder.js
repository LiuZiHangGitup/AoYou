const Config = require('./../config.js');
const Zlhzs = require('./zlhz.js')

var ylhOrderSchema = new Config.mongoose.Schema({
    // 购买用户uid
    uid:{type:Number,default:0},
    // 购买商品图片
    src:{type:String,default:''},
    // 商品id
    goodid:{type:String,default:''},
    // 购买时间
    buytime:{type:Number,default:0},
    // 购买数量
    num:{type:Number,default:0},
    // 订单状态 1待处理  2已发货 3已送达 4已完成 5状态错误
    state:{type:Number,default:1},
    // 商品名称
    goodname:{type:String,default:''},
    // 商品信息
    other:{type:Object,default:''},
    // 用户姓名
    username:{type:String,default:''},
    // 用户手机
    phone:{type:Number,default:0},
    // 用户地址
    address:{type:String,default:''},
    // 订单详细信息
    msg:{type:String,default:''}
})

// 生成订单
ylhOrderSchema.statics.newOrder = function(params,callback){
      this.model('YlhOrders').create(params,function(err,doc){
            err?callback({code:0,msg:'网络错误'}):callback({code:1,msg:'创建成功'});
      })
}

// app获取订单
ylhOrderSchema.statics.findAppYlhOrder = function(params,callback){
    var _this = this,soft = [],index = 0;
    this.model('YlhOrders').find({uid:params.uid}).sort('-buytime').exec(function(err,doc){
		if(err){
            callback({code:-1});
            return;
		}else if(doc.length == 0){
            callback({code:0,msg:'暂无订单信息'});
            return;
		}else{
			data = doc;
			mapOrder();
		}
      })
	function mapOrder(){
		if(index == data.length){
			callback({code:1,data:soft});
			return;
		}else{
                  Zlhzs.findOneZlhz({_id:data[index].goodid},function(zlhzData){
                        if(zlhzData.code == 1){
                              data[index].other = zlhzData.data;
                              soft.push(data[index])
                              index++;
                              mapOrder();
                        }else{
                              callback({code:0,msg:'网络错误'});
                              return;
                        }
                  })
		}
	}
}



var YlhOrder = Config.db.model('YlhOrders',ylhOrderSchema,'ylhorder');
module.exports = YlhOrder;