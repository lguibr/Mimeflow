if(!self.define){let e,s={};const n=(n,i)=>(n=new URL(n+".js",i).href,s[n]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=s,document.head.appendChild(e)}else e=n,importScripts(n),s()})).then((()=>{let e=s[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(i,a)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let c={};const r=e=>n(e,t),o={module:{uri:t},exports:c,require:r};s[t]=Promise.all(i.map((e=>o[e]||r(e)))).then((e=>(a(...e),c)))}}define(["./workbox-039eedb6"],(function(e){"use strict";importScripts(),e.enable(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/static/OodnWxyXF-TO8IwyTOgNE/_buildManifest.js",revision:"2ec694eb52ae4f523f265a46bae4d768"},{url:"/_next/static/OodnWxyXF-TO8IwyTOgNE/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/23-ce26af4ccc4fbed9.js",revision:"OodnWxyXF-TO8IwyTOgNE"},{url:"/_next/static/chunks/279.edd306515843e3f6.js",revision:"edd306515843e3f6"},{url:"/_next/static/chunks/403.7d5a7d284edc4b49.js",revision:"7d5a7d284edc4b49"},{url:"/_next/static/chunks/453.472b977ca3482066.js",revision:"472b977ca3482066"},{url:"/_next/static/chunks/45495e7f.e2c0b0d65e08a9af.js",revision:"e2c0b0d65e08a9af"},{url:"/_next/static/chunks/514.a7222524769d7af7.js",revision:"a7222524769d7af7"},{url:"/_next/static/chunks/538.f139755b92c61b4d.js",revision:"f139755b92c61b4d"},{url:"/_next/static/chunks/563.8784db84a5942891.js",revision:"8784db84a5942891"},{url:"/_next/static/chunks/596-153db2f8aba6eb8d.js",revision:"OodnWxyXF-TO8IwyTOgNE"},{url:"/_next/static/chunks/7.1e8eb99da08fb6ca.js",revision:"1e8eb99da08fb6ca"},{url:"/_next/static/chunks/702-5cef9dcc94c4a1e7.js",revision:"OodnWxyXF-TO8IwyTOgNE"},{url:"/_next/static/chunks/746.90faa30030e1404b.js",revision:"90faa30030e1404b"},{url:"/_next/static/chunks/768.a0565ceb3914f64e.js",revision:"a0565ceb3914f64e"},{url:"/_next/static/chunks/798-1e3a1798fcb8abfe.js",revision:"OodnWxyXF-TO8IwyTOgNE"},{url:"/_next/static/chunks/915.fec83899423be5da.js",revision:"fec83899423be5da"},{url:"/_next/static/chunks/932.203fd2fa00d298d9.js",revision:"203fd2fa00d298d9"},{url:"/_next/static/chunks/967.9996f0198a222c58.js",revision:"9996f0198a222c58"},{url:"/_next/static/chunks/app/_not-found/page-5118bedce3957217.js",revision:"OodnWxyXF-TO8IwyTOgNE"},{url:"/_next/static/chunks/app/layout-6a54c195263da4fa.js",revision:"OodnWxyXF-TO8IwyTOgNE"},{url:"/_next/static/chunks/app/page-3e938e36da1571d1.js",revision:"OodnWxyXF-TO8IwyTOgNE"},{url:"/_next/static/chunks/app/score/page-94ce7a8f4b38864f.js",revision:"OodnWxyXF-TO8IwyTOgNE"},{url:"/_next/static/chunks/app/tracking/page-a462bcef97214dc5.js",revision:"OodnWxyXF-TO8IwyTOgNE"},{url:"/_next/static/chunks/b4fff3dd.e21bbb42231fc190.js",revision:"e21bbb42231fc190"},{url:"/_next/static/chunks/ca377847.38fc848991f22a2a.js",revision:"38fc848991f22a2a"},{url:"/_next/static/chunks/fd9d1056-9970ff6139dfdef8.js",revision:"OodnWxyXF-TO8IwyTOgNE"},{url:"/_next/static/chunks/ff716bb2.1f26415942db411f.js",revision:"1f26415942db411f"},{url:"/_next/static/chunks/framework-f66176bb897dc684.js",revision:"OodnWxyXF-TO8IwyTOgNE"},{url:"/_next/static/chunks/main-2e39b155eb947424.js",revision:"OodnWxyXF-TO8IwyTOgNE"},{url:"/_next/static/chunks/main-app-b1aa37aefab05992.js",revision:"OodnWxyXF-TO8IwyTOgNE"},{url:"/_next/static/chunks/pages/_app-6a626577ffa902a4.js",revision:"OodnWxyXF-TO8IwyTOgNE"},{url:"/_next/static/chunks/pages/_error-1be831200e60c5c0.js",revision:"OodnWxyXF-TO8IwyTOgNE"},{url:"/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js",revision:"79330112775102f91e1010318bae2bd3"},{url:"/_next/static/chunks/webpack-645b83fbac936065.js",revision:"OodnWxyXF-TO8IwyTOgNE"},{url:"/android-chrome-192x192.png",revision:"fa446dd227292e30b921c7ebb2199293"},{url:"/android-chrome-512x512.png",revision:"17f9ccb4102e27d4313820bdf66c6766"},{url:"/apple-touch-icon.png",revision:"dc0ef45ad19445bad1d7415ff54ee4eb"},{url:"/favicon-16x16.png",revision:"826efd4e3ecff152a9bbcf6a63bf8793"},{url:"/favicon-32x32.png",revision:"d51e8d8c258b74c6128e258b5555f789"},{url:"/favicon.ico",revision:"24fb5872e1380131faadf47e2b376d57"},{url:"/manifest.json",revision:"9b2a3e8b4a66db669584a9efa32c3f5e"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:n,state:i})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https?.*/,new e.NetworkFirst({cacheName:"offlineCache",plugins:[new e.ExpirationPlugin({maxEntries:200})]}),"GET"),e.registerRoute(/^http?.*/,new e.NetworkFirst({cacheName:"offlineCache",plugins:[new e.ExpirationPlugin({maxEntries:200})]}),"GET")}));
