"use client"

import { useParams } from "next/navigation";
import { useRef, useState } from "react";

export default function roomId(){
    const params=useParams()
    const roomid=params.roomId
    const [cop,setcop]=useState("Copy")
    const copybutton=()=>{
        const url=window.location.href
        navigator.clipboard.writeText(url)
        setcop("Copied")
        setTimeout(()=>setcop("Copy"),2000)
    }
    const [timeRemaining,setTimeRemaining]=useState<number|null>(55)
    function formatTime(seconds:number){
        const mins=Math.floor(seconds/60)
        const secs=seconds%60
        return `${mins.toString()}-${secs.toString().padStart(2,"0")}`

    }
    const [input,setInput]=useState("")
    const inputref=useRef<HTMLInputElement>(null)
    return (
        <main className="flex flex-col h-screen max-h-screen overflow-hidden">
            <header className="border-b border-zinc-800 p-4 flex items-center bg-zinc-900/30 justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col ">
                        <span className="text-es text-zinc-500 uppercase">RoomId</span>
                        <div className="flex items-center gap-2 ">
                            <span className="font-bold text-green-500 ">{roomid}</span>
                            <button onClick={()=>copybutton()}  className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded text-zinc-400 hover:text-zinc-200 transition-color">{cop}</button>

                        </div>
                    </div>
                    <div className="h-8 w-px bg-zinc-800"/>
                    <div className="flex flex-col ">
                        <span className="text-xs text-zinc-500 uppercase">SelfDestruct</span>
                        <span className={`text-sm font-bold flex items-center gap-2 ${timeRemaining!=null&&timeRemaining<60?"text-red-500":"text-amber-500"}`}>{timeRemaining!=null?formatTime(timeRemaining):"--::--"}</span>
                    </div>
                </div>
                <button className="text-xs bg-zinc-800 hover:bg-red-600 px-3 py-1.5 rounded text-zinc-400 hover:text-white font-bold flex transition-all items-center group gap-2 disabled:opacity-50">
                    <span className="group-hover:animate-pulse">💣 </span>
                    DESTROY NOW </button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin"></div>
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
                            inputref.current?.focus()
                        }
                    }}
                    placeholder="Enter message"
                    className="w-full bg-black border border-zinc-800. focus:border-zinc-700 focus-outline-none transition-colors text-zinc-100 placeholder:text-zinc-700 py-3 pl-8 pr-4 text-sm"></input>

                </div>
                <button className="bg-zinc-800 text-zinc-400 px-6 text-sm font-bold transition-all  disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"> SEND</button>
                </div>
            </div>
        </main>
    )
}