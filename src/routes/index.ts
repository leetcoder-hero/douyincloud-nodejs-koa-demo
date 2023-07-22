import Router from '@koa/router'
const router = new Router();
router.get('/', async ctx => {
    const openid = ctx.header['x-tt-openid'];
    console.log("openid",openid)
    ctx.body = openid;
})
module.exports = router;
