'use client'
import { useUsername } from "@/hooks/use-username";
import { client } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ANIMALS=["eagle","wolf","tiger","dino","lion","leopard"]
// These are constants so convention is to keep them in UPPER CASE
const STORAGE_KEY="chat_username"



export default function Home() {
 const userName=useUsername()
  const router=useRouter()
  const {mutate:createRoom}=useMutation({
  mutationFn: async()=>{
    const res=await client.room.create.post()
    if(res.status===200){
      router.push(`/room/${res.data?.roomId}`)
    }
    return res
    
  }
})
  return (
   <main className="flex items-center justify-center min-h-screen flex-col p-4">
    <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-green-500">PRIVATE CHAT</h1>
        <p className="text-zinc-500">A private self destructing chat room</p>
      </div>
      <div className="boder border-zinc-800 bg-zinc-800/50 p-6 backdrop-blur-md ">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="flex items-center text-zinc-500">
              Your Identity
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-zinc-900 border border-zinc-500 p-3 font-mono text-small text-zinc-400" >
                {userName}
              </div>
            </div>
          </div>
        </div>
        <button onClick={()=>createRoom()} className="w-full bg-zinc-100 text-black p-3 text-sm hover:bg-zinc-50 transition-colors mt-2 cursor-pointer disabled:opacity-50">CREATE SECURE ROOM</button>
      </div>
    </div>
   </main>
  );
}
