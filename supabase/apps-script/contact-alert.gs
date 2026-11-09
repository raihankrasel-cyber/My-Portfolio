const ALERT_RECIPIENT = "raihan.k.rasel@gmail.com";
function doPost(event) {
 const expected=PropertiesService.getScriptProperties().getProperty("CONTACT_FORM_SHARED_SECRET");
 let payload;
 try { payload=JSON.parse(event.postData.contents||"{}"); } catch (_) { return respond({ok:false,error:"invalid_request"}); }
 if(!expected||payload.token!==expected) return respond({ok:false,error:"unauthorized"});
 const name=String(payload.name||"").trim().slice(0,100), email=String(payload.email||"").trim().slice(0,254), message=String(payload.message||"").trim().slice(0,5000);
 if(name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||message.length<10) return respond({ok:false,error:"invalid_submission"});
 MailApp.sendEmail({to:ALERT_RECIPIENT,subject:"New portfolio inquiry from "+name,body:"Name: "+name+"\nEmail: "+email+"\n\n"+message,replyTo:email,name:"Raihan's Portfolio"});
 return respond({ok:true});
}
function respond(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
