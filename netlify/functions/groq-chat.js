const OK=['capacitor://localhost','https://localhost','https://wavelord-artup.netlify.app'];
exports.handler=async(ev)=>{const o=ev.headers.origin||'';const h={'Access-Control-Allow-Origin':OK.includes(o)?o:OK[2],'Access-Control-Allow-Headers':'Content-Type','Content-Type':'application/json'};
 if(ev.httpMethod==='OPTIONS')return{statusCode:204,headers:h,body:''};
 try{const b=JSON.parse(ev.body||'{}');const msgs=b.messages||(b.message?[{role:'user',content:b.message}]:[]);
  if(!process.env.GROQ_API_KEY)return{statusCode:200,headers:h,body:JSON.stringify({reply:'Try a limited palette and block big shapes first.',fallback:true})};
  const sys='You are Wave Buddy, a friendly drawing coach inside ArtUp. General mode: answer any question. Max 4 lines. Never invent facts.';
  const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+process.env.GROQ_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:'openai/gpt-oss-120b',messages:[{role:'system',content:sys},...msgs.slice(-12)]})});
  const j=await r.json();return{statusCode:200,headers:h,body:JSON.stringify({reply:j.choices?.[0]?.message?.content||'Try blocking big shapes first.'})}}
 catch(e){return{statusCode:200,headers:h,body:JSON.stringify({reply:'Try blocking big shapes first.',fallback:true})}}};
