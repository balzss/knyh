(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[662],{2101:(e,t,s)=>{Promise.resolve().then(s.bind(s,1449))},1449:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>T});var a=s(5155),r=s(2115),l=s(7113),n=s(8986),i=s(3610),d=s(8068),o=s(8166),c=s(1488),m=s(858),u=s(7510),h=s(3360),f="Switch",[p,x]=(0,o.A)(f),[g,b]=p(f),y=r.forwardRef((e,t)=>{let{__scopeSwitch:s,name:l,checked:n,defaultChecked:o,required:m,disabled:u,value:f="on",onCheckedChange:p,form:x,...b}=e,[y,j]=r.useState(null),v=(0,d.s)(t,e=>j(e)),w=r.useRef(!1),C=!y||x||!!y.closest("form"),[S=!1,z]=(0,c.i)({prop:n,defaultProp:o,onChange:p});return(0,a.jsxs)(g,{scope:s,checked:S,disabled:u,children:[(0,a.jsx)(h.sG.button,{type:"button",role:"switch","aria-checked":S,"aria-required":m,"data-state":k(S),"data-disabled":u?"":void 0,disabled:u,value:f,...b,ref:v,onClick:(0,i.m)(e.onClick,e=>{z(e=>!e),C&&(w.current=e.isPropagationStopped(),w.current||e.stopPropagation())})}),C&&(0,a.jsx)(N,{control:y,bubbles:!w.current,name:l,value:f,checked:S,required:m,disabled:u,form:x,style:{transform:"translateX(-100%)"}})]})});y.displayName=f;var j="SwitchThumb",v=r.forwardRef((e,t)=>{let{__scopeSwitch:s,...r}=e,l=b(j,s);return(0,a.jsx)(h.sG.span,{"data-state":k(l.checked),"data-disabled":l.disabled?"":void 0,...r,ref:t})});v.displayName=j;var N=e=>{let{control:t,checked:s,bubbles:l=!0,...n}=e,i=r.useRef(null),d=(0,m.Z)(s),o=(0,u.X)(t);return r.useEffect(()=>{let e=i.current,t=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"checked").set;if(d!==s&&t){let a=new Event("click",{bubbles:l});t.call(e,s),e.dispatchEvent(a)}},[d,s,l]),(0,a.jsx)("input",{type:"checkbox","aria-hidden":!0,defaultChecked:s,...n,tabIndex:-1,ref:i,style:{...e.style,...o,position:"absolute",pointerEvents:"none",opacity:0,margin:0}})};function k(e){return e?"checked":"unchecked"}var w=s(1567);let C=r.forwardRef((e,t)=>{let{className:s,...r}=e;return(0,a.jsx)(y,{className:(0,w.cn)("peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",s),...r,ref:t,children:(0,a.jsx)(v,{className:(0,w.cn)("pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0")})})});C.displayName=y.displayName;var S=s(639),z=s(1161),A=s(2458),E=s(1460);function T(){let{toggleSidebar:e}=(0,A.cL)(),{theme:t,setTheme:s}=(0,l.D)(),[i,d]=(0,r.useState)(!1),[o,c]=(0,r.useState)("dark"===t);return((0,r.useEffect)(()=>{d(!0)},[]),i)?(0,a.jsxs)("div",{className:"flex w-full",children:[(0,a.jsx)(S.V,{onSidebarToggle:e,customTopbarContent:(0,a.jsx)("div",{className:"flex items-center gap-2",children:(0,a.jsx)("span",{className:"mr-4 font-bold ",children:"Settings"})})}),(0,a.jsx)(z.G,{path:"/settings"}),(0,a.jsx)("main",{className:"w-full mt-16 mx-auto",children:(0,a.jsx)(E.M,{children:(0,a.jsxs)("div",{className:"flex items-center justify-between border p-3 rounded-md",children:[(0,a.jsx)(n.J,{htmlFor:"darkModeSwitch",className:"font-bold",children:"Dark mode"}),(0,a.jsx)(C,{id:"darkModeSwitch",checked:o,onCheckedChange:()=>{s(o?"light":"dark"),c(!o)}})]})})})]}):null}},1161:(e,t,s)=>{"use strict";s.d(t,{G:()=>N});var a=s(5155),r=s(8173),l=s.n(r),n=s(2458),i=s(8369);let d=i.bL,o=i.R6,c=i.Ke;var m=s(3312),u=s(1983),h=s(6293),f=s(3100),p=s(8131),x=s(3474),g=s(689),b=s(4628),y=s(5325),j=s(9291);let v=[{displayName:"Recipes",icon:(0,a.jsx)(u.A,{}),href:"/"},{displayName:"Tags",icon:(0,a.jsx)(h.A,{}),subItems:Object.values(j.P).map(e=>{let{displayName:t}=e;return{displayName:t,href:"#"}})},{displayName:"Shopping List",icon:(0,a.jsx)(f.A,{}),href:"/shopping-list"},{displayName:"Archive",icon:(0,a.jsx)(p.A,{}),href:"/archive"},{displayName:"Settings",icon:(0,a.jsx)(x.A,{}),href:"/settings"}];function N(e){let{path:t}=e,{isMobile:s,setOpenMobile:r}=(0,n.cL)();return(0,a.jsxs)(n.Bx,{children:[s&&(0,a.jsx)(n.Gh,{className:"p-3",children:(0,a.jsxs)("div",{className:"flex justify-between items-center",children:[(0,a.jsx)(l(),{className:"text-2xl font-bold focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-2 focus:ring-offset-background focus:rounded-md",href:"/",onClick:()=>r(!1),children:"KONYHA"}),(0,a.jsx)(m.$,{variant:"ghost",size:"icon",onClick:()=>r(!1),children:(0,a.jsx)(g.A,{})})]})}),(0,a.jsx)(n.Yv,{className:s?"":"mt-16",children:(0,a.jsxs)(n.Cn,{children:[(0,a.jsx)("div",{className:"mb-4",children:(0,a.jsx)(m.$,{variant:"default",className:"font-bold py-4 px-3",asChild:!0,children:(0,a.jsxs)(l(),{href:"/create",onClick:()=>r(!1),children:[(0,a.jsx)(b.A,{}),(0,a.jsx)("span",{children:"Add Recipe"})]})})}),(0,a.jsx)(n.rQ,{children:(0,a.jsx)(n.wZ,{children:v.map(e=>e.subItems?(0,a.jsx)(d,{asChild:!0,defaultOpen:!0,className:"group/collapsible",children:(0,a.jsxs)(n.FX,{children:[(0,a.jsx)(o,{asChild:!0,children:(0,a.jsxs)(n.Uj,{children:[e.icon,(0,a.jsx)("span",{children:e.displayName}),(0,a.jsx)(y.A,{className:"ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"})]})}),(0,a.jsx)(c,{children:(0,a.jsx)(n.q9,{children:e.subItems.map(e=>(0,a.jsx)(n.Fg,{children:(0,a.jsx)(n.Cp,{asChild:!0,children:(0,a.jsx)(l(),{href:e.href,onClick:()=>r(!1),children:(0,a.jsx)("span",{children:e.displayName})})})},e.displayName))})})]})},e.displayName):(0,a.jsx)(n.FX,{children:(0,a.jsx)(n.Uj,{asChild:!0,isActive:t===e.href,children:(0,a.jsxs)(l(),{href:e.href,onClick:()=>r(!1),children:[e.icon,(0,a.jsx)("span",{children:e.displayName})]})})},e.href))})})]})})]})}},9267:(e,t,s)=>{"use strict";s.d(t,{K:()=>n});var a=s(5155),r=s(3312),l=s(3601);function n(e){let{icon:t,tooltip:s,variant:n="ghost",onClick:i,size:d="normal",isActive:o=!1}=e;return(0,a.jsx)(l.Bc,{children:(0,a.jsxs)(l.m_,{children:[(0,a.jsx)(l.k$,{asChild:!0,children:(0,a.jsx)(r.$,{variant:n,size:"icon",className:"".concat("small"===d?"h-8 w-8":""," ").concat(o?"bg-accent text-accent-foreground":""),onClick:i,children:t})}),(0,a.jsx)(l.ZI,{children:(0,a.jsx)("p",{children:s})})]})})}},1460:(e,t,s)=>{"use strict";s.d(t,{M:()=>l});var a=s(5155);let r={list:"max-w-2xl",grid:"sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl-grid-cols-6 max-w-7xl"};function l(e){let{title:t,variant:s="list",children:l}=e;return(0,a.jsxs)("div",{className:"gap-3 p-3 w-full mx-auto grid grid-cols-1 ".concat(r[s]),children:[t&&(0,a.jsx)("h1",{className:"col-span-full scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",children:t}),l]})}},639:(e,t,s)=>{"use strict";s.d(t,{V:()=>g});var a=s(5155),r=s(2115),l=s(8173),n=s.n(l),i=s(7936),d=s(1354),o=s(3312),c=s(4920),m=s(1567);let u=r.forwardRef((e,t)=>{let{className:s,...r}=e;return(0,a.jsx)(c.bL,{ref:t,className:(0,m.cn)("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",s),...r})});u.displayName=c.bL.displayName;let h=r.forwardRef((e,t)=>{let{className:s,...r}=e;return(0,a.jsx)(c._V,{ref:t,className:(0,m.cn)("aspect-square h-full w-full",s),...r})});h.displayName=c._V.displayName;let f=r.forwardRef((e,t)=>{let{className:s,...r}=e;return(0,a.jsx)(c.H4,{ref:t,className:(0,m.cn)("flex h-full w-full items-center justify-center rounded-full bg-muted",s),...r})});f.displayName=c.H4.displayName;var p=s(9095),x=s(9267);function g(e){let{onSidebarToggle:t=()=>{},customTopbarContent:s=(0,a.jsx)(a.Fragment,{})}=e,[l,c]=(0,r.useState)(!1);return(0,a.jsxs)("nav",{className:"fixed top-0 right-0 w-full z-50 flex items-center p-2 border-b bg-background gap-2",children:[(0,a.jsx)(x.K,{icon:(0,a.jsx)(i.A,{}),tooltip:"Toggle Sidebar",size:"normal",onClick:t}),(0,a.jsx)(n(),{className:"hidden sm:block text-2xl font-bold mx-12 focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-2 focus:ring-offset-background focus:rounded-md",href:"/",children:"KONYHA"}),s,(0,a.jsxs)(p.AM,{open:l,onOpenChange:e=>{c(e)},children:[(0,a.jsx)(p.Wv,{asChild:!0,children:(0,a.jsx)(o.$,{variant:"ghost",size:"icon",className:"ml-auto mr-1 cursor-pointer rounded-full",children:(0,a.jsxs)(u,{children:[(0,a.jsx)(h,{src:"",alt:"SB"}),(0,a.jsx)(f,{children:"SB"})]})})}),(0,a.jsxs)(p.hl,{className:"w-80 mx-2 flex flex-col gap-3 font-bold",children:[(0,a.jsx)("span",{children:"Logged in as Balazs"}),(0,a.jsxs)(o.$,{className:"font-bold",children:[(0,a.jsx)(d.A,{})," Sign Out"]})]})]})]})}},8986:(e,t,s)=>{"use strict";s.d(t,{J:()=>o});var a=s(5155),r=s(2115),l=s(6195),n=s(1027),i=s(1567);let d=(0,n.F)("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"),o=r.forwardRef((e,t)=>{let{className:s,...r}=e;return(0,a.jsx)(l.b,{ref:t,className:(0,i.cn)(d(),s),...r})});o.displayName=l.b.displayName},9095:(e,t,s)=>{"use strict";s.d(t,{AM:()=>i,Wv:()=>d,hl:()=>o});var a=s(5155),r=s(2115),l=s(532),n=s(1567);let i=l.bL,d=l.l9,o=r.forwardRef((e,t)=>{let{className:s,align:r="center",sideOffset:i=4,...d}=e;return(0,a.jsx)(l.ZL,{children:(0,a.jsx)(l.UC,{ref:t,align:r,sideOffset:i,className:(0,n.cn)("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",s),...d})})});o.displayName=l.UC.displayName},9291:(e,t,s)=>{"use strict";s.d(t,{P:()=>a,s:()=>r});let a={magyar:{displayName:"magyar",id:"0"},alaprecept:{displayName:"alaprecept",id:"1"},főzelék:{displayName:"főzel\xe9k",id:"2"},desszert:{displayName:"desszert",id:"3"},tészta:{displayName:"t\xe9szta",id:"4"},olasz:{displayName:"olasz",id:"5"},leves:{displayName:"leves",id:"6"}},r=[{id:"1",title:"Palacsinta alaprecept",tags:[a.alaprecept,a.magyar,a.desszert]},{id:"2",title:"Soml\xf3i galuska",tags:[a.desszert,a.magyar]},{id:"3",title:"Krumplifőzel\xe9k",tags:[a["főzel\xe9k"],a.magyar]},{id:"4",title:"Kocsonya",tags:[a.magyar]},{id:"5",title:"Bety\xe1rleves",tags:[a.magyar,a.leves]},{id:"6",title:"Fas\xedrt",tags:[a.magyar]},{id:"7",title:"Carbonara",tags:[a.olasz,a["t\xe9szta"]]},{id:"8",title:"Lecs\xf3",tags:[a.magyar]},{id:"9",title:"Rizott\xf3",tags:[a.olasz]}]},858:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});var a=s(2115);function r(e){let t=a.useRef({value:e,previous:e});return a.useMemo(()=>(t.current.value!==e&&(t.current.previous=t.current.value,t.current.value=e),t.current.previous),[e])}},7113:(e,t,s)=>{"use strict";s.d(t,{D:()=>c,N:()=>m});var a=s(2115),r=(e,t,s,a,r,l,n,i)=>{let d=document.documentElement,o=["light","dark"];function c(t){(Array.isArray(e)?e:[e]).forEach(e=>{let s="class"===e,a=s&&l?r.map(e=>l[e]||e):r;s?(d.classList.remove(...a),d.classList.add(t)):d.setAttribute(e,t)}),i&&o.includes(t)&&(d.style.colorScheme=t)}if(a)c(a);else try{let e=localStorage.getItem(t)||s,a=n&&"system"===e?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":e;c(a)}catch(e){}},l=["light","dark"],n="(prefers-color-scheme: dark)",i="undefined"==typeof window,d=a.createContext(void 0),o={setTheme:e=>{},themes:[]},c=()=>{var e;return null!=(e=a.useContext(d))?e:o},m=e=>a.useContext(d)?a.createElement(a.Fragment,null,e.children):a.createElement(h,{...e}),u=["light","dark"],h=e=>{let{forcedTheme:t,disableTransitionOnChange:s=!1,enableSystem:r=!0,enableColorScheme:i=!0,storageKey:o="theme",themes:c=u,defaultTheme:m=r?"system":"light",attribute:h="data-theme",value:b,children:y,nonce:j,scriptProps:v}=e,[N,k]=a.useState(()=>p(o,m)),[w,C]=a.useState(()=>p(o)),S=b?Object.values(b):c,z=a.useCallback(e=>{let t=e;if(!t)return;"system"===e&&r&&(t=g());let a=b?b[t]:t,n=s?x(j):null,d=document.documentElement,o=e=>{"class"===e?(d.classList.remove(...S),a&&d.classList.add(a)):e.startsWith("data-")&&(a?d.setAttribute(e,a):d.removeAttribute(e))};if(Array.isArray(h)?h.forEach(o):o(h),i){let e=l.includes(m)?m:null,s=l.includes(t)?t:e;d.style.colorScheme=s}null==n||n()},[j]),A=a.useCallback(e=>{let t="function"==typeof e?e(N):e;k(t);try{localStorage.setItem(o,t)}catch(e){}},[N]),E=a.useCallback(e=>{C(g(e)),"system"===N&&r&&!t&&z("system")},[N,t]);a.useEffect(()=>{let e=window.matchMedia(n);return e.addListener(E),E(e),()=>e.removeListener(E)},[E]),a.useEffect(()=>{let e=e=>{e.key===o&&(e.newValue?k(e.newValue):A(m))};return window.addEventListener("storage",e),()=>window.removeEventListener("storage",e)},[A]),a.useEffect(()=>{z(null!=t?t:N)},[t,N]);let T=a.useMemo(()=>({theme:N,setTheme:A,forcedTheme:t,resolvedTheme:"system"===N?w:N,themes:r?[...c,"system"]:c,systemTheme:r?w:void 0}),[N,A,t,w,r,c]);return a.createElement(d.Provider,{value:T},a.createElement(f,{forcedTheme:t,storageKey:o,attribute:h,enableSystem:r,enableColorScheme:i,defaultTheme:m,value:b,themes:c,nonce:j,scriptProps:v}),y)},f=a.memo(e=>{let{forcedTheme:t,storageKey:s,attribute:l,enableSystem:n,enableColorScheme:i,defaultTheme:d,value:o,themes:c,nonce:m,scriptProps:u}=e,h=JSON.stringify([l,s,d,t,c,o,n,i]).slice(1,-1);return a.createElement("script",{...u,suppressHydrationWarning:!0,nonce:"undefined"==typeof window?m:"",dangerouslySetInnerHTML:{__html:"(".concat(r.toString(),")(").concat(h,")")}})}),p=(e,t)=>{let s;if(!i){try{s=localStorage.getItem(e)||void 0}catch(e){}return s||t}},x=e=>{let t=document.createElement("style");return e&&t.setAttribute("nonce",e),t.appendChild(document.createTextNode("*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}")),document.head.appendChild(t),()=>{window.getComputedStyle(document.body),setTimeout(()=>{document.head.removeChild(t)},1)}},g=e=>(e||(e=window.matchMedia(n)),e.matches?"dark":"light")}},e=>{var t=t=>e(e.s=t);e.O(0,[311,80,458,441,517,358],()=>t(2101)),_N_E=e.O()}]);