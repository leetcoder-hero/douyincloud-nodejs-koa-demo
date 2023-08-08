const router = require('koa-router')()
import { dySDK } from "@open-dy/node-server-sdk";
const db = dySDK.database();
router.prefix('/orders')
const collection =  db.collection("orders");
// router.get('/query', async function (ctx, next) {
//   const openId = ctx.header['x-tt-openid'] ;
//   const res = await collection.where({
//     openId: openId,
//   }).get()
//   if(!res || !res.data ){
//     return
//   }
//   const orderList = res.data;
//   const goods_ids = res.data.map(item => item.goods_id);
//   const goodsRes = await db.collection("goods")
//     .where({ _id: _.in(goods_ids) })
//     .get();
//   if(!goodsRes || !goodsRes.data ){
//     return
//   }
//   const goodsList = goodsRes.data;
//   const list = orderList.map(item => {
//     const goods = goodsList.find(g => g._id === item.goods_id)
//     return {
//       ...item,
//       title: goods.title,
//       head_images: goods.head_images,
//     }
//   })
//   ctx.body = {
//     data: list,
//     success: true,
//   }
// });
router.post('/point-pay', async function (ctx, next) {
  const openId = ctx.header['x-tt-openid'] ;
  try{
    const {goods_id} = ctx.request.body;
    if(!goods_id){
      throw Error("请输入商品ID") 
    }
    //todo: 检查goods_id是否是这个用户创建的
    const time = Date.now();
    const good = await db.collection("goods").doc(goods_id).get();
    if( !(good.data && good.data[0]) ){
      throw Error("未找到商品") 
    }
    const goods_point = good.data[0].point;
    const pointsRes = await db.collection("points").where({
      openId: openId
    }).get();
    if( !(pointsRes.data && pointsRes.data[0]) ){
      throw Error("积分不足") 
    }
    const hasPoints = pointsRes.data[0].points;
    console.log("hasPoints", hasPoints, typeof hasPoints)
    console.log("goods_points", goods_point,  typeof goods_point)
    if(typeof hasPoints !=='number' || typeof goods_point !== "number"){
      throw Error("积分不足") 
    }
    const res_point = Number(hasPoints - goods_point);
    if(res_point <0){
      throw Error("积分不足") 
    }
    console.log(await db.collection("points").where({ openId: openId }).get());
    const pointsUpdate = await db.collection("points").where({ openId: openId })
    .update({
      points: res_point
    });
    console.log("pointsUpdate", pointsUpdate)
    if(pointsUpdate.updated == 0){
      throw Error("积分不足") 
    }
    const res = await collection.add({
      openId,
      create_time: time,
      goods_id,
      type: "point-buy",
    })
    if( !res.id ){ 
      throw Error("兑换失败") 
    }
    ctx.body = {
      data: "success",
      success: true,
    }
  }catch(err){
    console.log("err",err)
    ctx.body = {
      data: { err: err.toString()},
      success: false,
    } 
  }
  
})
module.exports = router
