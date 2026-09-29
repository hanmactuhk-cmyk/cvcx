const {app,BrowserWindow,BrowserView,ipcMain,session,dialog,shell}=require('electron');
const path=require('path'),fs=require('fs');
const {FlowRunner}=require('./automation/flow-runner');
const {ProfileManager}=require('./automation/profile-manager');

const DATA=path.join(app.getPath('userData'),'flow-data');
let win, manager, runner;
function ensure(){fs.mkdirSync(DATA,{recursive:true});}
function createWindow(){
  win=new BrowserWindow({width:1450,height:900,minWidth:1100,minHeight:700,backgroundColor:'#0b1020',webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false}});
  win.loadFile(path.join(__dirname,'renderer','index.html'));
}
app.whenReady().then(()=>{ensure();manager=new ProfileManager(DATA);runner=new FlowRunner({dataDir:DATA,emit:(e,d)=>win?.webContents.send(e,d)});createWindow();});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});

ipcMain.handle('profiles:list',()=>manager.list());
ipcMain.handle('profiles:add',async()=>{
  const p=manager.create();
  const bw=new BrowserWindow({width:1200,height:850,title:'Đăng nhập Google / Flow - '+p.name,webPreferences:{partition:'persist:flow_'+p.id,contextIsolation:true,nodeIntegration:false}});
  bw.on('closed',()=>{}); bw.loadURL('https://accounts.google.com/');
  return p;
});
ipcMain.handle('profiles:open',async(_,id)=>{const p=manager.get(id);if(!p)throw Error('Không tìm thấy tài khoản'); const bw=new BrowserWindow({width:1200,height:850,title:p.name,webPreferences:{partition:'persist:flow_'+p.id,contextIsolation:true,nodeIntegration:false}}); await bw.loadURL('https://flow.google.com/'); return true;});
ipcMain.handle('profiles:delete',(_,id)=>manager.remove(id));
ipcMain.handle('profiles:rename',(_,id,name)=>manager.rename(id,name));
ipcMain.handle('profiles:check',async(_,id)=>runner.checkAccount(id));
ipcMain.handle('flow:run',async(_,opts)=>runner.run(opts));
ipcMain.handle('flow:stop',()=>runner.stop());
ipcMain.handle('dialog:open',async()=>{const r=await dialog.showOpenDialog(win,{properties:['openFile'],filters:[{name:'Prompt',extensions:['txt','csv','xlsx']} ]});return r.canceled?null:r.filePaths[0]});
ipcMain.handle('shell:open',(_,u)=>shell.openExternal(u));
