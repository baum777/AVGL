const $=s=>document.querySelector(s);
const state={locale:localStorage.getItem("avgl.locale")||(navigator.language||"en").toLowerCase().startsWith("de")?"de":"en",scanStrategy:"full",accessMode:"public",repo:"",ir:null,inventory:null,activeFile:null,chat:[],github:{connected:false,user:null,repositories:[]},workspace:{selected:[]}};
