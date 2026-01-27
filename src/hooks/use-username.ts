import { useState,useEffect } from "react";
import { nanoid } from "nanoid";

const ANIMALS=["eagle","wolf","tiger","dino","lion","leopard"]
// These are constants so convention is to keep them in UPPER CASE
const STORAGE_KEY="chat_username"
const generateUsername=()=>{
  const word=ANIMALS[Math.floor(Math.random()*ANIMALS.length)]
  return `Anonymous-${word}-${nanoid(5)}`
}
export const useUsername=()=>{
    
    const [userName,setuserName]=useState("Dummy");
      useEffect(()=>{
        const main=()=>{
          const stored=localStorage.getItem(STORAGE_KEY)
          if(stored){
            setuserName(stored)
            return 
          }
          const gen=generateUsername()
          localStorage.setItem(STORAGE_KEY,gen)
          setuserName(gen)
        }
        main()
      },[])
      return userName;
}