(()=>{var e={};e.id=662,e.ids=[662],e.modules={846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},9121:e=>{"use strict";e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3873:e=>{"use strict";e.exports=require("path")},6602:(e,s,t)=>{"use strict";t.r(s),t.d(s,{GlobalError:()=>i.a,__next_app__:()=>u,pages:()=>c,routeModule:()=>p,tree:()=>d});var r=t(260),a=t(8203),n=t(5155),i=t.n(n),l=t(7292),o={};for(let e in l)0>["default","tree","pages","GlobalError","__next_app__","routeModule"].indexOf(e)&&(o[e]=()=>l[e]);t.d(s,o);let d=["",{children:["settings",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(t.bind(t,6153)),"/home/runner/work/knyh/knyh/src/app/settings/page.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(t.bind(t,1354)),"/home/runner/work/knyh/knyh/src/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(t.t.bind(t,9937,23)),"next/dist/client/components/not-found-error"],forbidden:[()=>Promise.resolve().then(t.t.bind(t,9116,23)),"next/dist/client/components/forbidden-error"],unauthorized:[()=>Promise.resolve().then(t.t.bind(t,1485,23)),"next/dist/client/components/unauthorized-error"]}],c=["/home/runner/work/knyh/knyh/src/app/settings/page.tsx"],u={require:t,loadChunk:()=>Promise.resolve()},p=new r.AppPageRouteModule({definition:{kind:a.RouteKind.APP_PAGE,page:"/settings/page",pathname:"/settings",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},4899:(e,s,t)=>{Promise.resolve().then(t.bind(t,6153))},5147:(e,s,t)=>{Promise.resolve().then(t.bind(t,1960))},1960:(e,s,t)=>{"use strict";t.r(s),t.d(s,{default:()=>S});var r=t(5512),a=t(8009),n=t(3371),i=t(2628),l=t(1412),o=t(9952),d=t(6004),c=t(3024),u=t(6582),p=t(8762),h=t(830),m="Switch",[f,x]=(0,d.A)(m),[g,j]=f(m),b=a.forwardRef((e,s)=>{let{__scopeSwitch:t,name:n,checked:i,defaultChecked:d,required:u,disabled:p,value:m="on",onCheckedChange:f,form:x,...j}=e,[b,v]=a.useState(null),y=(0,o.s)(s,e=>v(e)),w=a.useRef(!1),C=!b||x||!!b.closest("form"),[z=!1,A]=(0,c.i)({prop:i,defaultProp:d,onChange:f});return(0,r.jsxs)(g,{scope:t,checked:z,disabled:p,children:[(0,r.jsx)(h.sG.button,{type:"button",role:"switch","aria-checked":z,"aria-required":u,"data-state":N(z),"data-disabled":p?"":void 0,disabled:p,value:m,...j,ref:y,onClick:(0,l.m)(e.onClick,e=>{A(e=>!e),C&&(w.current=e.isPropagationStopped(),w.current||e.stopPropagation())})}),C&&(0,r.jsx)(k,{control:b,bubbles:!w.current,name:n,value:m,checked:z,required:u,disabled:p,form:x,style:{transform:"translateX(-100%)"}})]})});b.displayName=m;var v="SwitchThumb",y=a.forwardRef((e,s)=>{let{__scopeSwitch:t,...a}=e,n=j(v,t);return(0,r.jsx)(h.sG.span,{"data-state":N(n.checked),"data-disabled":n.disabled?"":void 0,...a,ref:s})});y.displayName=v;var k=e=>{let{control:s,checked:t,bubbles:n=!0,...i}=e,l=a.useRef(null),o=(0,u.Z)(t),d=(0,p.X)(s);return a.useEffect(()=>{let e=l.current,s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"checked").set;if(o!==t&&s){let r=new Event("click",{bubbles:n});s.call(e,t),e.dispatchEvent(r)}},[o,t,n]),(0,r.jsx)("input",{type:"checkbox","aria-hidden":!0,defaultChecked:t,...i,tabIndex:-1,ref:l,style:{...e.style,...d,position:"absolute",pointerEvents:"none",opacity:0,margin:0}})};function N(e){return e?"checked":"unchecked"}var w=t(4195);let C=a.forwardRef(({className:e,...s},t)=>(0,r.jsx)(b,{className:(0,w.cn)("peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",e),...s,ref:t,children:(0,r.jsx)(y,{className:(0,w.cn)("pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0")})}));C.displayName=b.displayName;var z=t(4991),A=t(5730),P=t(840),R=t(2542);function S(){let{toggleSidebar:e}=(0,P.cL)(),{theme:s,setTheme:t}=(0,n.D)(),[l,o]=(0,a.useState)(!1),[d,c]=(0,a.useState)("dark"===s);return l?(0,r.jsxs)("div",{className:"flex w-full",children:[(0,r.jsx)(z.V,{onSidebarToggle:e,customTopbarContent:(0,r.jsx)("div",{className:"flex items-center gap-2",children:(0,r.jsx)("span",{className:"mr-4 font-bold ",children:"Settings"})})}),(0,r.jsx)(A.G,{path:"/settings"}),(0,r.jsx)("main",{className:"w-full mt-16 mx-auto",children:(0,r.jsx)(R.M,{children:(0,r.jsxs)("div",{className:"flex items-center justify-between border p-3 rounded-md",children:[(0,r.jsx)(i.J,{htmlFor:"darkModeSwitch",className:"font-bold",children:"Dark mode"}),(0,r.jsx)(C,{id:"darkModeSwitch",checked:d,onCheckedChange:()=>{t(d?"light":"dark"),c(!d)}})]})})})]}):null}},5730:(e,s,t)=>{"use strict";t.d(s,{G:()=>k});var r=t(5512),a=t(8531),n=t.n(a),i=t(840),l=t(9635);let o=l.bL,d=l.R6,c=l.Ke;var u=t(9400),p=t(143),h=t(9903),m=t(1910),f=t(197),x=t(8790),g=t(1255),j=t(2554),b=t(6967),v=t(5439);let y=[{displayName:"Recipes",icon:(0,r.jsx)(p.A,{}),href:"/"},{displayName:"Tags",icon:(0,r.jsx)(h.A,{}),subItems:Object.values(v.P).map(({displayName:e})=>({displayName:e,href:"#"}))},{displayName:"Shopping List",icon:(0,r.jsx)(m.A,{}),href:"/shopping-list"},{displayName:"Archive",icon:(0,r.jsx)(f.A,{}),href:"/archive"},{displayName:"Settings",icon:(0,r.jsx)(x.A,{}),href:"/settings"}];function k({path:e}){let{isMobile:s,setOpenMobile:t}=(0,i.cL)();return(0,r.jsxs)(i.Bx,{children:[s&&(0,r.jsx)(i.Gh,{className:"p-3",children:(0,r.jsxs)("div",{className:"flex justify-between items-center",children:[(0,r.jsx)(n(),{className:"text-2xl font-bold focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-2 focus:ring-offset-background focus:rounded-md",href:"/",onClick:()=>t(!1),children:"KONYHA"}),(0,r.jsx)(u.$,{variant:"ghost",size:"icon",onClick:()=>t(!1),children:(0,r.jsx)(g.A,{})})]})}),(0,r.jsx)(i.Yv,{className:s?"":"mt-16",children:(0,r.jsxs)(i.Cn,{children:[(0,r.jsx)("div",{className:"mb-4",children:(0,r.jsx)(u.$,{variant:"default",className:"font-bold py-4 px-3",asChild:!0,children:(0,r.jsxs)(n(),{href:"/create",onClick:()=>t(!1),children:[(0,r.jsx)(j.A,{}),(0,r.jsx)("span",{children:"Add Recipe"})]})})}),(0,r.jsx)(i.rQ,{children:(0,r.jsx)(i.wZ,{children:y.map(s=>s.subItems?(0,r.jsx)(o,{asChild:!0,defaultOpen:!0,className:"group/collapsible",children:(0,r.jsxs)(i.FX,{children:[(0,r.jsx)(d,{asChild:!0,children:(0,r.jsxs)(i.Uj,{children:[s.icon,(0,r.jsx)("span",{children:s.displayName}),(0,r.jsx)(b.A,{className:"ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"})]})}),(0,r.jsx)(c,{children:(0,r.jsx)(i.q9,{children:s.subItems.map(e=>(0,r.jsx)(i.Fg,{children:(0,r.jsx)(i.Cp,{asChild:!0,children:(0,r.jsx)(n(),{href:e.href,onClick:()=>t(!1),children:(0,r.jsx)("span",{children:e.displayName})})})},e.displayName))})})]})},s.displayName):(0,r.jsx)(i.FX,{children:(0,r.jsx)(i.Uj,{asChild:!0,isActive:e===s.href,children:(0,r.jsxs)(n(),{href:s.href,onClick:()=>t(!1),children:[s.icon,(0,r.jsx)("span",{children:s.displayName})]})})},s.href))})})]})})]})}},7170:(e,s,t)=>{"use strict";t.d(s,{K:()=>i});var r=t(5512),a=t(9400),n=t(3271);function i({icon:e,tooltip:s,variant:t="ghost",onClick:i,size:l="normal",isActive:o=!1}){return(0,r.jsx)(n.Bc,{children:(0,r.jsxs)(n.m_,{children:[(0,r.jsx)(n.k$,{asChild:!0,children:(0,r.jsx)(a.$,{variant:t,size:"icon",className:`${"small"===l?"h-8 w-8":""} ${o?"bg-accent text-accent-foreground":""}`,onClick:i,children:e})}),(0,r.jsx)(n.ZI,{children:(0,r.jsx)("p",{children:s})})]})})}},2542:(e,s,t)=>{"use strict";t.d(s,{M:()=>n});var r=t(5512);let a={list:"max-w-2xl",grid:"sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl-grid-cols-6 max-w-7xl"};function n({title:e,variant:s="list",children:t}){return(0,r.jsxs)("div",{className:`gap-3 p-3 w-full mx-auto grid grid-cols-1 ${a[s]}`,children:[e&&(0,r.jsx)("h1",{className:"col-span-full scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",children:e}),t]})}},4991:(e,s,t)=>{"use strict";t.d(s,{V:()=>g});var r=t(5512),a=t(8009),n=t(8531),i=t.n(n),l=t(8320),o=t(5120),d=t(9400),c=t(8076),u=t(4195);let p=a.forwardRef(({className:e,...s},t)=>(0,r.jsx)(c.bL,{ref:t,className:(0,u.cn)("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",e),...s}));p.displayName=c.bL.displayName;let h=a.forwardRef(({className:e,...s},t)=>(0,r.jsx)(c._V,{ref:t,className:(0,u.cn)("aspect-square h-full w-full",e),...s}));h.displayName=c._V.displayName;let m=a.forwardRef(({className:e,...s},t)=>(0,r.jsx)(c.H4,{ref:t,className:(0,u.cn)("flex h-full w-full items-center justify-center rounded-full bg-muted",e),...s}));m.displayName=c.H4.displayName;var f=t(4577),x=t(7170);function g({onSidebarToggle:e=()=>{},customTopbarContent:s=(0,r.jsx)(r.Fragment,{})}){let[t,n]=(0,a.useState)(!1);return(0,r.jsxs)("nav",{className:"fixed top-0 right-0 w-full z-50 flex items-center p-2 border-b bg-background gap-2",children:[(0,r.jsx)(x.K,{icon:(0,r.jsx)(l.A,{}),tooltip:"Toggle Sidebar",size:"normal",onClick:e}),(0,r.jsx)(i(),{className:"hidden sm:block text-2xl font-bold mx-12 focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-2 focus:ring-offset-background focus:rounded-md",href:"/",children:"KONYHA"}),s,(0,r.jsxs)(f.AM,{open:t,onOpenChange:e=>{n(e)},children:[(0,r.jsx)(f.Wv,{asChild:!0,children:(0,r.jsx)(d.$,{variant:"ghost",size:"icon",className:"ml-auto mr-1 cursor-pointer rounded-full",children:(0,r.jsxs)(p,{children:[(0,r.jsx)(h,{src:"",alt:"SB"}),(0,r.jsx)(m,{children:"SB"})]})})}),(0,r.jsxs)(f.hl,{className:"w-80 mx-2 flex flex-col gap-3 font-bold",children:[(0,r.jsx)("span",{children:"Logged in as Balazs"}),(0,r.jsxs)(d.$,{className:"font-bold",children:[(0,r.jsx)(o.A,{})," Sign Out"]})]})]})]})}},2628:(e,s,t)=>{"use strict";t.d(s,{J:()=>d});var r=t(5512),a=t(8009),n=t(2405),i=t(1643),l=t(4195);let o=(0,i.F)("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"),d=a.forwardRef(({className:e,...s},t)=>(0,r.jsx)(n.b,{ref:t,className:(0,l.cn)(o(),e),...s}));d.displayName=n.b.displayName},4577:(e,s,t)=>{"use strict";t.d(s,{AM:()=>l,Wv:()=>o,hl:()=>d});var r=t(5512),a=t(8009),n=t(3490),i=t(4195);let l=n.bL,o=n.l9,d=a.forwardRef(({className:e,align:s="center",sideOffset:t=4,...a},l)=>(0,r.jsx)(n.ZL,{children:(0,r.jsx)(n.UC,{ref:l,align:s,sideOffset:t,className:(0,i.cn)("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",e),...a})}));d.displayName=n.UC.displayName},5439:(e,s,t)=>{"use strict";t.d(s,{P:()=>r,s:()=>a});let r={magyar:{displayName:"magyar",id:"0"},alaprecept:{displayName:"alaprecept",id:"1"},főzelék:{displayName:"főzel\xe9k",id:"2"},desszert:{displayName:"desszert",id:"3"},tészta:{displayName:"t\xe9szta",id:"4"},olasz:{displayName:"olasz",id:"5"},leves:{displayName:"leves",id:"6"}},a=[{id:"1",title:"Palacsinta alaprecept",tags:[r.alaprecept,r.magyar,r.desszert]},{id:"2",title:"Soml\xf3i galuska",tags:[r.desszert,r.magyar]},{id:"3",title:"Krumplifőzel\xe9k",tags:[r["főzel\xe9k"],r.magyar]},{id:"4",title:"Kocsonya",tags:[r.magyar]},{id:"5",title:"Bety\xe1rleves",tags:[r.magyar,r.leves]},{id:"6",title:"Fas\xedrt",tags:[r.magyar]},{id:"7",title:"Carbonara",tags:[r.olasz,r["t\xe9szta"]]},{id:"8",title:"Lecs\xf3",tags:[r.magyar]},{id:"9",title:"Rizott\xf3",tags:[r.olasz]}]},6153:(e,s,t)=>{"use strict";t.r(s),t.d(s,{default:()=>r});let r=(0,t(6760).registerClientReference)(function(){throw Error("Attempted to call the default export of \"/home/runner/work/knyh/knyh/src/app/settings/page.tsx\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/home/runner/work/knyh/knyh/src/app/settings/page.tsx","default")},6582:(e,s,t)=>{"use strict";t.d(s,{Z:()=>a});var r=t(8009);function a(e){let s=r.useRef({value:e,previous:e});return r.useMemo(()=>(s.current.value!==e&&(s.current.previous=s.current.value,s.current.value=e),s.current.previous),[e])}}};var s=require("../../webpack-runtime.js");s.C(e);var t=e=>s(s.s=e),r=s.X(0,[751,768,358],()=>t(6602));module.exports=r})();