const router = require('koa-router')()
import { dySDK } from "@open-dy/node-server-sdk";
const db = dySDK.database();
router.prefix('/points')
const pointsActiveDB =  db.collection("points_actives");
const collection =  db.collection("points");


router.get('/daily-add', async function (ctx, next) {
  const openId = ctx.header['x-tt-openid'] ;
  const pointRes = await pointsActiveDB.where({
    openId: openId,
    type:  "daily",
  }).get();
  if(pointRes && pointRes.data[0]){
    const time = new Date(pointRes.data[0].time);
    const now = new Date();
    if(time.getFullYear() === now.getFullYear()  && time.getMonth() === now.getMonth() && time.getDate() === now.getDate()){
      // 今天已经签过到了
      ctx.body = {
        data: 'failed',
        success: false,
      }
      return ;
    }
  }
  await pointsActiveDB.add({
    openId,
    points:1,
    type: "daily",
    time: Date.now(), 
  })
  const res = await collection.where({ openId: openId }).get();
  if(res.data[0]){
    const points = res.data[0].points || 0;
    await collection.where({ openId: openId }).update({
      openId,
      points: points + 1,
      type: "daily",
      time: Date.now(), 
    })
  } else {
    await collection.add({
      openId,
      points: 1,
      type: "daily",
      time: Date.now(), 
    })
  }

//   const { userInfo } = await auth.getEndUserInfo();
//   console.log("userInfo", userInfo)
//   const uuid = userInfo.uuid;
//   ctx.body = await db.collection("goods").get();

  ctx.body = {
      data: 'success',
      success: true,
  }
})
router.get('/query-tody', async function (ctx, next) {
  const openId = ctx.header['x-tt-openid'] ;
  const pointRes = await pointsActiveDB.where({
    openId: openId,
    type: "daily",
  }).get();
  if(pointRes && pointRes.data[0]){
    const time = new Date(pointRes.data[0].time);
    const now = new Date();
    if(time.getFullYear() === now.getFullYear()  && time.getMonth() === now.getMonth() && time.getDate() === now.getDate()){
      // 今天已经签过到了
      ctx.body = {
        data: 'tody-has',
        success: false,
      }
      return ;
    }
  }
   ctx.body = {
      data: "tody-not",
      success: true,
  } 
})
router.get('/query', async function (ctx, next) {
    const openId = ctx.header['x-tt-openid'] ;

    const res = await  collection.where({
      openId
    }).get()
    let points = 0;
    if(res.data &&  res.data[0] && res.data[0].points){
        points = res.data[0].points;
    }
     ctx.body = {
        data: points,
        success: true,
    } 
})
module.exports = router