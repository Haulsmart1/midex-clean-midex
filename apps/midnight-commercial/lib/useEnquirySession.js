import {useEffect,useState} from 'react';
import supabase from './supabaseClient';
// This hook establishes a draft's browser owner only. Stored enquiries are
// authorised independently on the server for each operations request.
export function useEnquirySession(){
 const [state,setState]=useState({data:null,status:'loading',error:false});
 useEffect(()=>{
  let mounted=true,generation=0;
  const check=async(session,version)=>{
   if(!mounted||version!==generation)return;
   if(!session?.access_token){setState({data:null,status:'unauthenticated',error:false});return;}
   let timer;
   try{
    const result=await Promise.race([supabase.auth.getUser(session.access_token),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Session check timed out')),5000);})]);
    if(!mounted||version!==generation)return;
    if(result.error||!result.data?.user?.id)throw Error('Session unavailable');
    setState({data:{user:{id:result.data.user.id}},status:'authenticated',error:false});
   }catch{if(mounted&&version===generation)setState({data:null,status:'loading',error:true});}
   finally{clearTimeout(timer);}
  };
  const initialVersion=generation;
  supabase.auth.getSession().then(result=>{if(mounted&&generation===initialVersion){const version=++generation;if(result.error)setState({data:null,status:'loading',error:true});else check(result.data?.session,version);}}).catch(()=>{if(mounted&&generation===initialVersion)setState({data:null,status:'loading',error:true});});
  const {data}=supabase.auth.onAuthStateChange((_event,session)=>{
   const version=++generation;setState({data:null,status:'loading',error:false});
   // Never await provider methods inside the SDK's auth-lock callback.
   setTimeout(()=>check(session,version),0);
  });
  return()=>{mounted=false;generation++;data.subscription.unsubscribe();};
 },[]);
 return state;
}
