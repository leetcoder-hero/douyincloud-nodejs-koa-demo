const router = require('koa-router')()
const tcb_app = require("../utils/tcb");
const db = tcb_app.database()
const _ = db.command
router.prefix('/points')
const collection =  db.collection("points");
router.get('/add', async function (ctx, next) {
  const user_id = ctx.user_id;
  const pointRes = await collection.where({
    user_id: _.eq(user_id),
    type: _.eq( "daily"),
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
  const res = await collection.add({
    user_id,
    points:1,
    type: "daily",
    time: Date.now(), 
  })
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
  const user_id = ctx.user_id;
  const pointRes = await collection.where({
    user_id: _.eq(user_id),
    type: _.eq( "daily"),
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
    const user_id = ctx.user_id;

    const res = await  collection.where({
        user_id
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