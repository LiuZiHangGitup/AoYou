var Config = require('./../config.js')

var ylhCarSchema = new Config.mongoose.Schema({
    uid:{type:Number,default:0},
    car:{type:Array,default:[]}
})

// 易廉惠删除购物车
ylhCarSchema.statics.delYlhCar = function(params,callback){
	var _this = this;
	_this.model('YlhCars').findOne({uid:params.uid},function(err,doc){
		var soft = doc.car,softLength = doc.car.length,oldLength = params.data.length;
		for(let i = softLength - 1; i >= 0; i--){
			var value = soft[i]._id;
			if(params.data.indexOf(value) > -1){
				soft.splice(i,1);
				oldLength--;
				if(oldLength == 0){
					_this.model('YlhCars').updateOne({uid:params.uid},{car:soft},function(err,doc){
						callback({code:1,msg:'物品移出购物车成功'});
					})
				}
			}
		}
	})
}

// 易廉惠获取购物车
ylhCarSchema.statics.getYlhCar = function(params,callback){
	var _this = this;
	this.model('YlhCars').findOne({uid:params.uid},function(err,doc){
		if(!err&&!doc){
			callback({code:0,msg:'暂无购物车数据'});
			return;
		}else if(doc){
			var length = doc.car.length,oldDoc = doc;
			var soft = [];
			var index = 0
			if(doc.car.length == 0){
				callback({code:1,data:[]});
				return;
			}
			function fn(){
				_this.model('Zlhzs').findOne({_id:doc.car[index]._id},function(erra,doca){
					if(erra||doca == null){
                        callback({code:0,msg:'商品信息错误,或商品已下架。'});
                        return;
					}else{
						doca.num = oldDoc.car[index].num;
						soft.push(doca);
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

// 易廉惠添加购物车
ylhCarSchema.statics.addYlhCar = function(params,callback){
    var _this = this;
    var uid = params.uid;
    // 首先查询是否已存在此用户的购物车
    _this.model('YlhCars').findOne({uid:uid},function(erra,doca){
        // 未查询到此用户的购物车
        if(!erra&&!doca){
            _this.model('YlhCars').create({uid:uid,car:[params.data]},function(errb,docb){
                errb?callback({code:0,msg:'网络错误,添加购物车失败'}):callback({code:1,msg:'添加购物车成功'});
                return;
            })
        }else{
            var isIn = false;
			for(var i=0;i<doca.car.length;i++){
				if(doca.car[i]._id == params.data._id){
					isIn = true
					doca.car[i].num += params.data.num
				}
			}
			if(isIn){
				_this.model('YlhCars').updateOne({uid:params.uid},{car:doca.car},function(errc,docc){
					if(errc){
                        callback({code:0,msg:'网络错误,添加购物车失败'});
                        return;
                    }else{
                        callback({code:1,msg:'添加购物车成功'});
                        return;
                    }
				})
			}else{
				doca.car.push(params.data);
				_this.model('YlhCars').updateOne({uid:params.uid},{car:doca.car},function(errd,docd){
                    if(errd){
                        callback({code:0,msg:'网络错误,添加购物车失败'});
                        return;
                    }else{
                        callback({code:1,msg:'添加购物车成功'});
                        return;
                    }
				})
			}
        }
    })
}


var YlhCar = Config.db.model('YlhCars',ylhCarSchema,'ylhcar');

module.exports = YlhCar;