"use client"

import { useUsername } from "@/hooks/use-username";
import { client } from "@/lib/client";
import { useMutation, useQuery } from "@tanstack/react-query";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useRealtime } from "@/lib/realtime-client";
import { useRouter } from "next/navigation";

export default function roomId(){
    const router=useRouter()
    const username=useUsername()
    const params=useParams()
const { roomId } = params as { roomId: string };
    const [cop,setcop]=useState("Copy")
    const copybutton=()=>{
        const url=window.location.href
        navigator.clipboard.writeText(url)
        setcop("Copied")
        setTimeout(()=>setcop("Copy"),2000)
    }
    const [timeRemaining,setTimeRemaining]=useState<number|null>(5)
    function formatTime(seconds:number){
        const mins=Math.floor(seconds/60)
        const secs=seconds%60
        return `${mins.toString()}-${secs.toString().padStart(2,"0")}`

    }
    const {mutate:sendMessage,isPending}=useMutation({
        
        mutationFn:async({text}:{text:string})=>{
            await client.messages.post({sender:username,text},{query:{ roomId } })
             setInput("");
        }
       
        
    })
    const {mutate:destroyroom}=useMutation({
        mutationFn:async()=>{
            await client.room.delete(null,{query:{roomId}})
        }
    })

    const {data:messages,refetch}=useQuery({
        queryKey:["messages",roomId],
        queryFn:async()=>{
            const res=await client.messages.get({
                query:{roomId}
            })
            console.log("Oh it does run ")
            return res.data 
            
            
        }
    })
    useRealtime({
        channels:[roomId],
        events:["chat.message","chat.destroy"],
        onData:({event})=>{
            if(event=="chat.message"){
                refetch()
            }
            if(event==="chat.destroy"){
                router.push("/?destroyed=true")
            }
        }
    })

    const {data:ttlData}=useQuery({
        queryKey:["ttl",roomId],
        queryFn:async()=>{
            const res=await client.room.ttl.get({
                query:{roomId}
            })
            return res.data
        }
    })
    useEffect(()=>{
        if(ttlData?.ttl!==undefined)
            setTimeRemaining(ttlData.ttl)
    },[ttlData])
    useEffect(()=>{
        if(timeRemaining===null||timeRemaining<0)
                return 
        if(timeRemaining===0)
            router.push("/?destroyed=true")
        const interval=setInterval(()=>{
            setTimeRemaining((prev)=>{
                if(prev===null||prev<=1){
                    clearInterval(interval)
                    return 0
                }
                return prev-1
            })
        },1000)
        return ()=>clearInterval(interval)
    },[timeRemaining,router])

    const [input,setInput]=useState("")
    const inputref=useRef<HTMLInputElement>(null)
    return (
        <main className="flex flex-col h-screen max-h-screen overflow-hidden">
            <header className="border-b border-zinc-800 p-4 flex items-center bg-zinc-900/30 justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col ">
                        <span className="text-es text-zinc-500 uppercase">RoomId</span>
                        <div className="flex items-center gap-2 ">
                            <span className="font-bold text-green-500 ">{roomId}</span>
                            <button onClick={()=>copybutton()}  className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded text-zinc-400 hover:text-zinc-200 transition-color">{cop}</button>

                        </div>
                    </div>
                    <div className="h-8 w-px bg-zinc-800"/>
                    <div className="flex flex-col ">
                        <span className="text-xs text-zinc-500 uppercase" onClick={()=>destroyroom()}>SelfDestruct</span>
                        <span className={`text-sm font-bold flex items-center gap-2 ${timeRemaining!=null&&timeRemaining<60?"text-red-500":"text-amber-500"}`}>{timeRemaining!=null?formatTime(timeRemaining):"--::--"}</span>
                    </div>
                </div>
                <button onClick={()=>destroyroom()} className="text-xs bg-zinc-800 hover:bg-red-600 px-3 py-1.5 rounded text-zinc-400 hover:text-white font-bold flex transition-all items-center group gap-2 disabled:opacity-50">
                    <span className="group-hover:animate-pulse">💣 </span>
                    DESTROY NOW </button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {messages?.messages.length===0&&(
                    <div className="flex items-center justify-center h-full">
                        <p className="font-mono text-zinc-600 text-sm">No messages Yet</p>
                    </div>
                )}
                {messages?.messages.map((msg)=>(
                    <div key={msg.id} className="flex flex-col items-start">
                        <div className="max-w-[80%] group">
                            <div className="flex items-baseline gap-3  mb-1">
                                <span className={`font-bold text-xs ${msg.sender===username?"text-green-100":"text-green-500"}`}>
                                    {msg.sender===username?"YOU":msg.sender}
                                </span>
                                <span className="text-[10px] text-zinc-500">{msg.timeStamp}</span>
                            </div>
                            <p className="text-sm text-zinc-300 leading-relaxed break-all">
                                {msg.text}
                            </p>
                        </div>

                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
                <div className="flex gap-4">  
                <div className="flex-1 relative group">
                    <span className=" absolute left-4 top-1/2 -translate-y-1/2 text-green-500 animate-pulse">{">"}</span>
                    <input type="text" 
                    autoFocus
                    ref={inputref}
                    value={input}
                    onChange={(e)=>setInput(e.target.value)}
                    onKeyDown={(e)=>{
                        if(e.key==="Enter"&&input.trim()){
                            sendMessage({text:input})
                            inputref.current?.focus()
                        }
                    }}
                    placeholder="Enter message"
                    className="w-full bg-black border border-zinc-800. focus:border-zinc-700 focus-outline-none transition-colors text-zinc-100 placeholder:text-zinc-700 py-3 pl-8 pr-4 text-sm"></input>

                </div>
                <button className="bg-zinc-800 text-zinc-400 px-6 text-sm font-bold transition-all  disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                onClick={()=>{
                    inputref.current?.focus()
                    sendMessage({text:input})
                    inputref.current?.focus()
                }}
                disabled={!input.trim()||isPending}>
                        SEND</button>
                </div>
            </div>
        </main>
    )
}