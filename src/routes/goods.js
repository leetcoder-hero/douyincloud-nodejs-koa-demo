const router = require('koa-router')()
const tcb_app = require("../utils/tcb");
const {getPostBody} = require("../utils/index");
const db = tcb_app.database()
const _ = db.command
router.prefix('/goods')
const collection =  db.collection("goods");
const filterGoodsParams = (good)=>{
  delete good.step_images
  delete good.step_url
  return good;
}
router.get('/list', async function (ctx, next) {
  const res = await collection.get();
  ctx.body = {
    data: res.data,
    success: true,
  }
})
router.post('/detail', async function (ctx, next) {
  const user_id = ctx.user_id;
  const { goods_id } = getPostBody(ctx); 

  const res = await collection.where({
    _id: _.eq(goods_id)
  }).get();
  if(!res || !res.data || !res.data[0]){
    ctx.body = {
      data: "不存在此商品",
      success: false,
    }
    return  
  }
  let data = res.data[0];
  if(user_id === data.author_id){
    data.isAuthor = true; 
    ctx.body = {
      data: data,
      success: true,
    }
    return 
  } 
  const orderRes = await db.collection("orders").where({
    goods_id: _.eq(goods_id),
    user_id: _.eq(user_id)
  }).get();
  const show = data.points === 0;
  if(orderRes && orderRes.data && orderRes.data[0]){
    data.isBuyer = true; 
  } else if(!show){
    data = filterGoodsParams(data);
  }
  ctx.body = {
    data: data,
    success: true,
  }
})
router.get('/created-list', async function (ctx, next) {
  const user_id = ctx.user_id;
  const res = await collection.where({
    author_id: _.eq(user_id)
  }).get();
  console.log("user_id", user_id)
  ctx.body = {
    data: res.data,
    success: true,
  }
})
router.post('/add', async function (ctx, next) {
  
})
router.post('/delete', async function (ctx, next) {
 
})
module.exports = router
