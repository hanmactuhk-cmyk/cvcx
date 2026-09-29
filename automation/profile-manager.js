const fs=require('fs'),path=require('path'),crypto=require('crypto');
class ProfileManager{
 constructor(dir){this.file=path.join(dir,'profiles.json');if(!fs.existsSync(this.file))fs.writeFileSync(this.file,'[]');}
 data(){try{return JSON.parse(fs.readFileSync(this.file,'utf8'))}catch{return[]}}
 save(a){fs.writeFileSync(this.file,JSON.stringify(a,null,2))}
 list(){return this.data()}
 create(){const a=this.data(), n=a.length+1;const p={id:crypto.randomUUID(),name:'Tài khoản '+n,email:'',createdAt:new Date().toISOString()};a.push(p);this.save(a);return p}
 get(id){return this.data().find(x=>x.id===id)}
 rename(id,name){const a=this.data(),p=a.find(x=>x.id===id);if(!p)throw Error('Không tìm thấy');p.name=name.trim()||p.name;this.save(a);return p}
 remove(id){this.save(this.data().filter(x=>x.id!==id));return true}
 update(id,patch){const a=this.data(),p=a.find(x=>x.id===id);if(!p)return null;Object.assign(p,patch);this.save(a);return p}
}
module.exports={ProfileManager};
