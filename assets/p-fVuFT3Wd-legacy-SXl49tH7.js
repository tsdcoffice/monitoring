System.register(["./index-legacy-BeCofhqn.js","./p-Cl0B-RWe-legacy-CDKgQtvk.js"],function(e,t){"use strict";var n,r,s;return{setters:[e=>{n=e.i,r=e.c},e=>{s=e.createGesture}],execute:function(){
/*!
             * (C) Ionic http://ionicframework.com - MIT License
             */
e("createSwipeBackGesture",(e,t,c,i,o)=>{const a=e.ownerDocument.defaultView;let u=n(e);const l=e=>u?-e.deltaX:e.deltaX;return s({el:e,gestureName:"goback-swipe",gesturePriority:101,threshold:10,canStart:r=>(u=n(e),(e=>{const{startX:t}=e;return u?t>=a.innerWidth-50:t<=50})(r)&&t()),onStart:c,onMove:e=>{const t=l(e)/a.innerWidth;i(t)},onEnd:e=>{const t=l(e),n=a.innerWidth,s=t/n,c=(e=>u?-e.velocityX:e.velocityX)(e),i=c>=0&&(c>.2||t>n/2),d=(i?1-s:s)*n;let h=0;if(d>5){const e=d/Math.abs(c);h=Math.min(e,540)}o(i,s<=0?.01:r(0,s,.9999),h)}})})}}});
