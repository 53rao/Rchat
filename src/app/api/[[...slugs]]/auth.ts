import roomId from "@/app/room/[roomId]/page";
import { redis } from "@/lib/redis";
import Elysia from "elysia";
class AuthError extends Error{
    constructor(message:string ){
        super(message)
        this.name="Auth Errror"
    }
}
export const authMiddleware=new Elysia({name:"auth"}).error({AuthError})
.onError(({code,set})=>{
    if(code=="AuthError"){
        set.status=401
        return {error:"Unauthroized"}
    }
})
.derive({as:"scoped"},async({query,cookie})=>{
    const roomId=query.roomId
    const token=cookie["x-auth-token"].value as string | undefined
    if(!roomId||!token){
        throw new AuthError("Missing roomid or token")
    }
    const connected=await redis.hget(`meta:${roomId}`,"connected") as string|null
    if(!connected?.includes(token)){
        throw new AuthError("Invalid tokeb")
    
    }   
return {auth:{roomId,token,connected}}
    
})

