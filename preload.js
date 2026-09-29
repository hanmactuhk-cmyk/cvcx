const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('api',{
 listProfiles:()=>ipcRenderer.invoke('profiles:list'), addProfile:()=>ipcRenderer.invoke('profiles:add'), openProfile:id=>ipcRenderer.invoke('profiles:open',id), deleteProfile:id=>ipcRenderer.invoke('profiles:delete',id), renameProfile:(id,n)=>ipcRenderer.invoke('profiles:rename',id,n), checkProfile:id=>ipcRenderer.invoke('profiles:check',id), run:o=>ipcRenderer.invoke('flow:run',o), stop:()=>ipcRenderer.invoke('flow:stop'), openFile:()=>ipcRenderer.invoke('dialog:open'), on:(ev,fn)=>ipcRenderer.on(ev,(_,d)=>fn(d))
});
