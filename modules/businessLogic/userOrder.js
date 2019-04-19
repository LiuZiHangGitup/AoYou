//商店相关
var Config = require('./../config.js');

var userJob = require('./userJobList.js');
var User = require('./../runtimes/users.js');
var Log = require('./../runtimes/logs.js');
var fs = require('fs');

var orderSchema = new Config.mongoose.Schema({
	// 是否可以二次兑换
	erci:{type:Boolean,default:false},
	// bosId
	bosuid:{type:String,default:''},
	// 收货人姓名
	username:{type:String,default:''},
	//商品ID
	goodId:{type:String,default:''},
	//商品图
	src:{type:String,default:''},
	//购买数量
	num:{type:Number,default:''},
	//购买用户
	uid:{type:Number,default:0},
	//购买时间
	time:{type:Number,default:Date.now()},
	//收货地址
	address:{type:String,default:''},
	//商品名称
	goodname:{type:String,default:''},
	//收货手机号
	phone:{type:Number,default:0},
	//备注
	msg:{type:String,default:''},
	//订单状态 0等待发货 1已发货 2已送达 3已完成 4订单异常
	stu:{type:Number,default:0},
	other:{type:Object,default:''}
})

// 商家查询个人订单
orderSchema.statics.findBosOrder = function(params,callback){
	var page = params.page;
	var pageValue = params.pageValue;
	this.model('Orders').find({bosuid:params.uid}).sort('-time').skip((page-1)*pageValue).limit(pageValue).exec(function(err,doc){
		err?callback({code:0,msg:'网络错误'}):callback({code:1,msg:'获取成功',data:doc});
	})
}

// 删除单个订单
orderSchema.statics.deleteOneOrder = function(params,callback){
	this.model('Orders').deleteOne({_id:params._id},function(err,doc){
		err?callback({code:0}):callback({code:1})
	})
}

// 查询要二次反比的订单
orderSchema.statics.findErCiFanBi = function(params,callback){
	this.model('Orders').findOne({_id:params._id},['goodId','num'],function(err,doc){
		err?callback({code:0,msg:'网络错误'}):callback({code:1,goodId:doc.goodId,num:doc.num});
	})
}

//新建用户订单
orderSchema.statics.newOrder = function(req,callback){
	this.model('Orders').create(req,function(err,doc){
		if(err){
			callback({code:0,msg:'数据异常'})
		}else{
			callback({code:1,msg:'购买成功'})
		}
	})
}


//获取自己的订单
orderSchema.statics.getOrder = function(req,callback){
	var data = [],_this = this,index = 0,soft=[];
	this.model('Orders').find({uid:req.uid}).sort('time').exec(function(err,doc){
		if(err){
			callback({code:-1})
		}else if(doc.length == 0){
			callback({code:0,msg:'暂无订单信息'});
		}else{
			data = doc
			mapOrder()
		}
	})
	function mapOrder(){
		if(index == data.length){
			callback({code:1,data:soft});
			return;
		}else{
			_this.model('Markets').findOne({_id:data[index].goodId},function(err,doc){
				data[index].other = doc;
				soft.push(data[index])
				index++;
				mapOrder()
			})
		}
	}
}




module.exports = Config.db.model('Orders',orderSchema);