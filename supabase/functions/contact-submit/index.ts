import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const allowedOrigins = new Set(["https://raihan-my-portfolio.vercel.app","https://my-portfolio-r8sxor9ma-raihan-5212.vercel.app","https://my-portfolio-git-main-raihan-5212.vercel.app"]);
const recentByIp = new Map<string, number[]>();
function keyValue(name: string): string {
 const value=Deno.env.get(name); if(!value) return "";
 try { const parsed=JSON.parse(value); return typeof parsed.default==="string" ? parsed.default : ""; } catch { return value; }
}
function headers(origin: string) { return {"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Headers":"apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json","Vary":"Origin"}; }
function reply(body: Record<string,unknown>,status:number,h:Record<string,string>) { return new Response(JSON.stringify(body),{status,headers:h}); }
Deno.serve(async (request:Request) => {
 const origin=request.headers.get("origin")??"", h=headers(allowedOrigins.has(origin)?origin:"null");
 if(request.method==="OPTIONS") return new Response(null,{status:allowedOrigins.has(origin)?204:403,headers:h});
 if(!allowedOrigins.has(origin)) return reply({error:"Origin is not allowed."},403,h);
 if(request.method!=="POST") return reply({error:"Method not allowed."},405,h);
 const expected=keyValue("SUPABASE_PUBLISHABLE_KEYS")||keyValue("SUPABASE_ANON_KEY");
 if(!expected||request.headers.get("apikey")!==expected) return reply({error:"Invalid client key."},401,h);
 if(Number(request.headers.get("content-length")??"0")>8000) return reply({error:"Request too large."},413,h);
 let payload:{name?:unknown;email?:unknown;message?:unknown;website?:unknown};
 try { payload=await request.json(); } catch { return reply({error:"Invalid request."},400,h); }
 if(typeof payload.website==="string"&&payload.website.trim()) return reply({ok:true},200,h);
 const name=typeof payload.name==="string"?payload.name.trim():"", email=typeof payload.email==="string"?payload.email.trim():"", message=typeof payload.message==="string"?payload.message.trim():"";
 if(name.length<2||name.length>100) return reply({error:"Enter a valid name."},400,h);
 if(email.length<3||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({error:"Enter a valid email address."},400,h);
 if(message.length<10||message.length>5000) return reply({error:"Enter a valid message."},400,h);
 const ip=request.headers.get("cf-connecting-ip")??request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()??"unknown", now=Date.now();
 const recent=(recentByIp.get(ip)??[]).filter(t=>now-t<600000);
 if(recent.length>=3) return reply({error:"Please wait before sending another message."},429,h);
 recent.push(now); if(recentByIp.size>5000) recentByIp.clear(); recentByIp.set(ip,recent);
 const projectUrl=Deno.env.get("SUPABASE_URL")??"", serviceKey=keyValue("SUPABASE_SERVICE_ROLE_KEY")||keyValue("SUPABASE_SECRET_KEYS");
 if(!projectUrl||!serviceKey) return reply({error:"Contact storage is not configured."},503,h);
 const supabase=createClient(projectUrl,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
 const {error}=await supabase.from("contact_submissions").insert({name,email,message});
 if(error){console.error("Contact submission could not be stored.",error.code??"unknown");return reply({error:"Your message could not be saved."},500,h);}
 let alertSent=false; const alertUrl=Deno.env.get("CONTACT_ALERT_WEBHOOK_URL"), alertSecret=Deno.env.get("CONTACT_ALERT_SHARED_SECRET");
 if(alertUrl&&alertSecret){try{const response=await fetch(alertUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:alertSecret,name,email,message})});const result=await response.json().catch(()=>({}));alertSent=response.ok&&result.ok===true;if(!alertSent)console.error("Contact alert was not accepted.",response.status);}catch{console.error("Contact alert request failed.");}}
 return reply({ok:true,alertSent},200,h);
});
