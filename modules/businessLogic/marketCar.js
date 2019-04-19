//商店相关
var Config = require('./../config.js')

var userJob = require('./userJobList.js')
var User = require('./../runtimes/users.js')
var Log = require('./../runtimes/logs.js')

var Order = require('./userOrder.js')

var marketcarSchema = new Config.mongoose.Schema({
	//用户id
	uid:{type:Number,default:0},
	data:{type:Array,default:[]}
})

//添加购物车 {uid:'',data:{//商品}}
marketcarSchema.statics.addCar = function(req,callback){
	var _this = this;
	this.model('Marketcars').findOne({uid:req.uid},function(err,doc){
		if(!err&&!doc){
			_this.model('Marketcars').create({uid:req.uid,data:[req.data]},function(){
				callback({code:1,msg:'添加购物车成功'});
				return;
			})
		}else{
			var isIn = false
			for(var i=0;i<doc.data.length;i++){
				if(doc.data[i]._id == req.data._id){
					isIn = true
					doc.data[i].num += req.data.num
				}
			}
			if(isIn){
				_this.model('Marketcars').updateOne({uid:req.uid},{data:doc.data},function(){
					callback({code:1,msg:'添加购物车成功'})
				})
			}else{
				doc.data.push(req.data)
				_this.model('Marketcars').updateOne({uid:req.uid},{data:doc.data},function(){
					callback({code:1,msg:'添加购物车成功'})
				})
				// doc.save(function(err,doc){
				// 	callback({code:1,msg:'添加购物车成功'})
				// })
			}
		}
	})
}

// 查询购物车商品名称  数量价格


//减去购物车 {uid:0,data:{_id,num}}
marketcarSchema.statics.cutCar = function(req,callback){
	var _this = this;

	this.model('Marketcars').findOne({uid:req.uid},function(err,doc){
		if(doc){
			for(var i=0;i<doc.data.length;i++){
				if(doc.data[i]._id == req.data._id){
					doc.data[i].num -= req.data.num
					if(doc.data[i].num == 0){
						doc.data.splice(i,1)
					}
					_this.model('Marketcars').updateOne({uid:req.uid},{data:doc.data},function(err,doc){
						callback({code:1,msg:'移出购物车成功'})
					})
					// doc.save(function(){
					// 	callback({code:1,msg:'移出购物车成功'})
					// })
				}
			}
		}
	})
}

//直接清空一件物品 {uid,data:[_id,_id]}
marketcarSchema.statics.delCar = function(params,callback){
	var _this = this;
	this.model('Marketcars').findOne({uid:params.uid},function(err,doc){
		var soft = doc.data,softLegth = soft.length,oldLength = params.data.length;
		for(let i = softLegth - 1;i >= 0; i--){
			let value = soft[i]._id;
			if(params.data.indexOf(value) > -1){
				soft.splice(i,1);
				oldLength--;
				if(oldLength == 0){
					_this.model('Marketcars').updateOne({uid:params.uid},{data:soft},function(err,doc){
						callback({code:1,msg:'物品移出购物车成功'});
						return;
					})
				}
			}
		}
	})
}


//获取购物车 {uid:0}
marketcarSchema.statics.getCar = function(req,callback){
	var _this = this;
	this.model('Marketcars').findOne({uid:req.uid},function(err,doc){
		if(!err&&!doc){
			callback({code:0,msg:'暂无购物车数据'});
			return;
		}else if(doc){
			var length = doc.data.length,oldDoc = doc;
			var soft = [];
			var index = 0; 
			if(doc.data.length == 0){
				callback({code:1,data:[]});
				return;
			}
			function fn(){
				_this.model('Markets').findOne({_id:doc.data[index]._id},function(err,doc){
					if(err||doc == null){
						callback({code:0,msg:'商品信息错误,或商品已下架。'});
					}else{
						doc.num = oldDoc.data[index].num;
						soft.push(doc);
						index++;
						if(index == length){
							callback({code:1,data:soft.reverse()});
							return;
						}else{
							fn();
						}
					}
				})
			}
			fn();
		}else{
			callback({code:0,msg:'购物车获取失败'});
			return;
		}
	})
}

var MarketCar = Config.db.model('Marketcars',marketcarSchema);

module.exports = MarketCar