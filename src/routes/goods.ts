const router = require('koa-router')()
import { dySDK } from "@open-dy/node-server-sdk";
const db = dySDK.database();
const goodsDB = db.collection("home_goods");
router.prefix('/goods')

// const filterGoodsParams = (good)=>{
//   delete good.step_images
//   delete good.step_url
//   return good;
// }
router.get('/home-list', async function (ctx, next) {
  console.time("home-list")
  const res = await goodsDB.get();
  console.timeEnd("home-list")
  ctx.body = {
    data: res.data,
    success: true,
  }
})
router.get('/goods-list', async function (ctx, next) {
  const res = await goodsDB.get();
  ctx.body = {
    data: res.data,
    success: true,
  }
})
router.post('/detail', async function (ctx, next) {
  const { goods_id } = ctx.request.body;
  const res = await goodsDB.where({
    _id: goods_id
  }).get();
  if(!res || !res.data || !res.data[0]){
    ctx.body = {
      data: "不存在此商品",
      success: false,
    }
    return  
  }
  let data = res.data[0];
  ctx.body = {
    data: data,
    success: true,
  }
})

module.exports = router
