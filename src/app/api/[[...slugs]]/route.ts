import { redis } from '@/lib/redis'
import { Elysia, t } from 'elysia'
import { nanoid } from 'nanoid'
import { authMiddleware } from './auth'
import {z} from 'zod'
import roomId from '@/app/room/[roomId]/page'
import { timeStamp } from 'console'
import { Message, realtime } from '@/lib/realtime'
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
        .use(authMiddleware)
        .get("/ttl",async ({auth})=>{
          const ttl=await redis.ttl(`meta:${auth.roomId}`)
          return {ttl:ttl>0?ttl:0}
        },{query:z.object({roomId:z.string()})})
        
        .delete("/",async({auth})=>{
          
          await realtime.channel(auth.roomId).emit("chat.destroy",{ isDestroyed :true})
          await Promise.all([
             redis.del(auth.roomId),
             redis.del(`meta:${auth.roomId}`),
             redis.del(`messages:${auth.roomId}`),
          ])
          
        },{query:z.object({roomId:z.string()})})
const messages=new Elysia({prefix:"/messages"})
        .use(authMiddleware)
        .post(
          "/",
          async ({ body, auth }) => {
            const { sender, text } = body;
            const {roomId}=auth
            const roomExists =await redis.exists(`meta:${roomId}`)
            if(!roomExists)
                throw new Error("Room does not exist")
            const message:Message={
                id:nanoid(),
                sender,
                text,
                timeStamp:Date.now(),
                roomId,
            }
            await redis.rpush(`message:${roomId}`,{
              ...message,token:auth.token})
            await realtime.channel(roomId).emit("chat.message",message)
            const remaining=await redis.ttl(`meta:${roomId}`)
            await redis.expire(`message:${roomId}`,remaining)
            await redis.expire(`history:${roomId}`,remaining)
            await redis.expire(roomId,remaining)
          },
          {
            body: z.object({
              sender: z.string().max(100),
              text: z.string().max(100),
            }),
            query:z.object({roomId:z.string()})
          }
        )
        .get("/",async({auth})=>{
  const messagesRaw=await redis.lrange(`message:${auth.roomId}`,0,-1)
  const messages = messagesRaw.map((m) => {
    const parsed = typeof m === 'string' ? JSON.parse(m) : m;
    return {
      ...parsed,
      token: parsed.token === auth.token ? auth.token : undefined,
    };
  });
  return { messages };
},{query:z.object({roomId:z.string()})})
const app =new Elysia({prefix:"/api"}).use(rooms).use(messages)
        

export const GET = app.handle 
export const POST = app.handle 
export const DELETE=app.handle
export type App=typeof app