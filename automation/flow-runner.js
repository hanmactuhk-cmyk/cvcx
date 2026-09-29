const {BrowserWindow,session}=require('electron');
const fs=require('fs'),path=require('path');
class FlowRunner{
 constructor({dataDir,emit}){this.dataDir=dataDir;this.emit=emit;this.stopFlag=false;this.jobs=[];}
 async wait(ms){return new Promise(r=>setTimeout(r,ms))}
 send(type,data){this.emit(type,data)}
 async pageFor(profile){
   const ses=session.fromPartition('persist:flow_'+profile.id);
   const bw=new BrowserWindow({show:true,width:1250,height:850,title:'Flow - '+profile.name,webPreferences:{partition:'persist:flow_'+profile.id,contextIsolation:true,nodeIntegration:false}});
   await bw.loadURL('https://flow.google.com/'); return {bw,ses};
 }
 async eval(bw,js){return bw.webContents.executeJavaScript(js,true)}
 async checkAccount(id){
   const profile=require('./profile-manager').ProfileManager;
   // Lightweight probe in a visible Flow window; no passwords are read/stored.
   const pm=new profile(this.dataDir),p=pm.get(id);if(!p)throw Error('Không tìm thấy tài khoản');
   const {bw}=await this.pageFor(p); await this.wait(5000);
   const info=await this.eval(bw,`(()=>{const a=document.querySelector('a[aria-label^="Tài khoản Google:"]'); const txt=document.body.innerText||''; return {email:a?.innerText||a?.getAttribute('aria-label')||'',text:txt.slice(0,12000)}})()`);
   const email=(info.email.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)||[])[0]||'';
   const m=info.text.match(/(\d+)\s*tín dụng Google Flow/i); const credits=m?Number(m[1]):null;
   pm.update(id,{email,credits,lastChecked:new Date().toISOString()}); this.send('profile:update',pm.get(id)); return pm.get(id);
 }
 async run(opts){
   if(this.jobs.length)throw Error('Đang có phiên chạy');this.stopFlag=false;
   const pm=new (require('./profile-manager').ProfileManager)(this.dataDir),p=pm.get(opts.profileId);if(!p)throw Error('Chưa chọn tài khoản');
   const prompts=opts.prompts||[]; this.jobs=prompts.map((prompt,i)=>({i,prompt,status:'queued'}));
   const {bw}=await this.pageFor(p); await this.wait(5000);
   for(let i=0;i<this.jobs.length;i++){
     if(this.stopFlag)break; const j=this.jobs[i];j.status='running';this.send('job:update',{...j});
     try{
       await this.eval(bw,`(()=>{const e=document.querySelector('div[contenteditable="true"].ProseMirror'); if(!e)throw new Error('Không tìm thấy ô prompt'); e.focus(); e.innerHTML=''; e.textContent=${JSON.stringify(j.prompt)}; e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:${JSON.stringify(j.prompt)}})); return true})()`);
       await this.wait(500);
       await this.eval(bw,`(()=>{const b=document.querySelector('button[type="submit"][aria-label="Bắt đầu tạo"]'); if(!b)throw new Error('Không tìm thấy nút Generate'); if(b.disabled)throw new Error('Nút Generate đang bị khóa'); b.click(); return true})()`);
       j.status='generated';this.send('job:update',{...j});
       // We intentionally do not guess completion selectors. Wait and report for manual validation in this first build.
       await this.wait(opts.waitMs||15000);
       j.status='waiting-download';this.send('job:update',{...j});
     }catch(e){j.status='error';j.error=e.message;this.send('job:update',{...j});}
   }
   this.jobs=[];this.send('run:done',{});return true;
 }
 stop(){this.stopFlag=true;return true}
}
module.exports={FlowRunner};
