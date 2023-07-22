const router = require('koa-router')()
const tcb_app = require("../utils/tcb");
const { getPostBody } = require("../utils/index");
const { nanoid }  = require("nanoid");
const db = tcb_app.database()
const _ = db.command
router.prefix('/codes')
const collection =  db.collection("redeem-code");
async function pushOrders({user_id, goods_id}){
  const time = Date.now();
  await db.collection("orders").add({
    user_id: user_id,
    goods_id: goods_id,
    order_time: time,
    type: "code"
  })
}
router.post('/create', async function (ctx, next) {
  const  { goods_id } = getPostBody(ctx); 
  if(!goods_id){ return }
  const user_id = ctx.user_id;
  //todo: 检查goods_id是否是这个用户创建的
  const time = Date.now();
  const code_id = nanoid(8);
  try{
    const res = await collection.add({
      code_id,
      create_user_id: user_id,
      create_time: time,
      goods_id,
    })
    ctx.body = {
      data: {
        code: code_id
      },
      success: true,
    }
  } catch(err){
    ctx.body = {
      data: "failed",
      success: false,
    }
  }
})
router.post('/query', async function (ctx, next) {
  const user_id = ctx.user_id;
  const  { goods_id } = getPostBody(ctx); 
  if(!goods_id){ return }
  const res = await collection.where({
    create_user_id: _.eq(user_id),
    goods_id: _.eq(goods_id)
  }).get();
  if( !(res.data && res.data[0]) ){
    ctx.body = {
      data:  [],
      success: false,
    }
    return 
  }
  ctx.body = {
    data: res.data.map(item => {
      const {code_id, goods_id, create_time, receive_user_id} = item;
      return {
        code_id: code_id,
        goods_id: goods_id,
        create_time: create_time,
        has_received: !!receive_user_id,
      }
    }),
    success: true,
  }

})
router.post('/receive', async function (ctx, next) {
    const user_id = ctx.user_id;
    try{
      const  { code_id } = getPostBody(ctx); 
      if(!code_id){ 
        throw Error("请输入兑换码")
      }
      const goods_res = await collection.where({
          code_id: _.eq(code_id),
      }).get();
      if( !(goods_res.data && goods_res.data[0]) ){
        throw Error("商品未找到")
      }
      const {receive_user_id, goods_id, create_time} = goods_res.data[0];
      if(receive_user_id){
        throw Error("兑换码已使用")
      }
      const time = Date.now();
      if(create_time - time > 24 * 3600 * 1000){
        const res = await collection.where({ code_id: _.eq(code_id) })
        .update({
          expired: true
        });
        throw Error("兑换码超过24小时, 已经过期")
      }

      const res = await collection.where({ code_id: _.eq(code_id) })
      .update({
        receive_user_id: user_id,
        receive_time: time,
      });
      if(res.updated !== 1){
        throw Error("领取失败，原因：未知")
      }
      await pushOrders({user_id, goods_id})
      ctx.body = {
        data: { msg: "领取成功",  goods_id},
        success: true,
      } 
      
    } catch(err){
      ctx.body = {
        data: { err: err.message},
        success: false,
      } 
    }
})
module.exports = router