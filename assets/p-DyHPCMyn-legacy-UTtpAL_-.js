System.register(["./index-legacy-B8JI_gbD.js","./p-DNDUsygf-legacy-D29y7Gwb.js"],function(e,t){"use strict";var n,r,s,o,i;return{setters:[e=>{n=e.r,r=e.a,s=e.w},e=>{o=e.f,i=e.s}],execute:function(){
/*!
             * (C) Ionic http://ionicframework.com - MIT License
             */
e("startStatusTap",()=>{const e=window;e.addEventListener("statusTap",()=>{n(()=>{const t=e.innerWidth,n=e.innerHeight,a=document.elementFromPoint(t/2,n/2);if(!a)return;const c=o(a);c&&new Promise(e=>r(c,e)).then(()=>{s(async()=>{c.style.setProperty("--overflow","hidden"),await i(c,300),c.style.removeProperty("--overflow")})})})})})}}});
