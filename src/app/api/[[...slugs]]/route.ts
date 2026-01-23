import { redis } from '@/lib/redis'
import { Elysia, t } from 'elysia'
import { nanoid } from 'nanoid'
const ROOM_TTL_SECONDS=600
const rooms=new Elysia({prefix:"/room"})
        .post("/create", async()=>{
            const roomId=nanoid()
            
            await redis.hset(`meta:${roomId}`,{
                connected:[],
                createdAt:Date.now()
            })
            await redis.expire(`meta:${roomId}`,ROOM_TTL_SECONDS)
            return {roomId}
        })
const app =new Elysia({prefix:"/api"}).use(rooms)
        

export const GET = app.handle 
export const POST = app.handle 
export type App=typeof app