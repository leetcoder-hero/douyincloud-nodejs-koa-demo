const router = require('koa-router')()
import { dySDK } from "@open-dy/node-server-sdk";
const db = dySDK.database();
const usersDB = db.collection("users");

router.prefix('/users')
router.get('/openId', async function (ctx, next) {
  ctx.body = {
    data: ctx.header['x-tt-openid'],
    success: true,
  }
})

router.get('/get-info', async function (ctx, next) {
  const openId = ctx.header['x-tt-openid'] ;
  console.log("header",ctx.header )
  if(!openId){
    console.log("未传入openId");
    ctx.body = {
      data: null,
      success: false,
    }
    return 
  }
  const res = await usersDB.where({ openId: openId }).get();
  console.log("res", res)
  ctx.body = {
    data: res.data[0],
    success: true,
  }
})
router.post('/set-info', async function (ctx, next) {
  const openId = ctx.header['x-tt-openid'];
  const {nickName, avatarUrl, gender, city, province} = ctx.request.body;
  try {
    const res = await usersDB.add({
      openId,
      nickName, avatarUrl, gender, city, province
    })
    ctx.body = {
      data: {
        openId,
      },
      success: true,
    }
    console.log("res", res)
  } catch (error) {
    ctx.body = {
      data: {
        openId,
      },
      success: false,
    }
    console.log("err", error)
  }
})

module.exports = router
