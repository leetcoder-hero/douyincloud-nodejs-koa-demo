const router = require('koa-router')()
const tcb_app = require("../utils/tcb");
const { getPostBody } = require("../utils/index");
const db = tcb_app.database()
const _ = db.command
router.prefix('/orders')
const collection =  db.collection("orders");
router.get('/query', async function (ctx, next) {
  const user_id = ctx.user_id;
  const res = await collection.where({
    user_id: _.eq(user_id),
  }).get()
  if(!res || !res.data ){
    return
  }
  const orderList = res.data;
  const goods_ids = res.data.map(item => item.goods_id);
  const goodsRes = await db.collection("goods")
    .where({ _id: _.in(goods_ids) })
    .get();
  if(!goodsRes || !goodsRes.data ){
    return
  }
  const goodsList = goodsRes.data;
  const list = orderList.map(item => {
    const goods = goodsList.find(g => g._id === item.goods_id)
    return {
      ...item,
      title: goods.title,
      head_images: goods.head_images,
    }
  })
  ctx.body = {
    data: list,
    success: true,
  }
})
router.post('/pay', async function (ctx, next) {
  const user_id = ctx.user_id;
  try{
    const { goods_id } = getPostBody(ctx); 
    if(!goods_id){
      throw Error("请输入商品ID") 
    }
    //todo: 检查goods_id是否是这个用户创建的
    const time = Date.now();
    const good = await db.collection("goods").where({
      _id: _.eq(goods_id)
    }).get();
    if( !(good.data && good.data[0]) ){
      throw Error("未找到商品") 
    }
    const points = good.data[0].points;
    const pointsRes = await db.collection("points").where({
      user_id: _.eq(user_id)
    }).get();
    if( !(pointsRes.data && pointsRes.data[0]) ){
      throw Error("请先签到") 
    }
    const hasPoints = pointsRes.data[0].points;
    if(hasPoints - points <0){
      throw Error("积分不足") 
    }
    const pointsUpdate = await db.collection("points").where({ user_id: _.eq(user_id) })
    .update({
      points: _.inc(-points)
    });
    if(pointsUpdate.updated == 0){
      throw Error("积分不足") 
    }
    const res = await collection.add({
      user_id,
      create_time: time,
      goods_id,
      type: "buy",
    })
    if( !res.id ){ 
      throw Error("兑换失败") 
    }
    ctx.body = {
      data: "success",
      success: true,
    }
  }catch(err){
    ctx.body = {
      data: { err: err},
      success: false,
    } 
  }
  
})
module.exports = router
