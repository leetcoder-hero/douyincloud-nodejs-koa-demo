import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from '@koa/router'
import Redis from 'ioredis';
import mongoose from 'mongoose';
import assert from "assert";
import { dySDK } from "@open-dy/node-server-sdk";
const db = dySDK.database();
const todosCollection = db.collection("todos");

// 初始化各服务的连接 redis, mongo
async function initService() {
    // const {REDIS_ADDRESS, REDIS_USERNAME, REDIS_PASSWORD, MONGO_ADDRESS, MONGO_USERNAME, MONGO_PASSWORD} = process.env;
    // const [ REDIS_HOST, REDIS_PORT] = REDIS_ADDRESS.split(':');
    // const redis = new Redis({
    //     port: parseInt(REDIS_PORT, 10),
    //     host: REDIS_HOST,
    //     username: REDIS_USERNAME,
    //     password: REDIS_PASSWORD,
    //     db: 0,
    // });

    // assert(await redis.echo('echo') === 'echo', `redis echo error`);

    // const mongoUrl = `mongodb://${MONGO_USERNAME}:${encodeURIComponent(MONGO_PASSWORD)}@${MONGO_ADDRESS}`;
    // await mongoose.connect(mongoUrl);    

    // return {
    //     redis,
    //     mongoose,
    // }
}

initService().then(async () => {

    const app = new Koa();

    const router = new Router();
    router.get('/', async ctx => {
        const openid = ctx.header['X-TT-OPENID'];
        const res = await  db.collection("couple").add({
            "meal": openid,
           }
        )


        ctx.body = openid;
    }).get('/api/get_data_from_redis', async(ctx) => {
        ctx.body = {
            success: true,
            data: 123,
        }
    }).post('/api/set_data_to_redis', async(ctx) => {
        ctx.body = {
            success: true,
            data: 123,
        }
    }).get('/api/get_data_from_mongodb', async(ctx) => {
        ctx.body = {
            success: true,
            data: 123,
        }
    }).post('/api/set_data_to_mongodb', async(ctx) => {
        const name = ctx.query.name as string;
        ctx.body = {
            success: true,
            data: 123,
        }
    });

    app.use(bodyParser());
    app.use(router.routes());

    const PORT = 8000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

}).catch((error: string) => console.log("Init service  error: ", error));