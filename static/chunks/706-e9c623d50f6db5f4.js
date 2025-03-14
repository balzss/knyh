"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[706],{1161:(e,s,a)=>{a.d(s,{G:()=>b});var l=a(5155),t=a(8173),r=a.n(t),i=a(2458),n=a(8369);let d=n.bL,o=n.R6,c=n.Ke;var m=a(3312),x=a(1983),f=a(6293),p=a(3100),u=a(8131),h=a(3474),j=a(689),g=a(4628),N=a(5325),y=a(9291);let v=[{displayName:"Recipes",icon:(0,l.jsx)(x.A,{}),href:"/"},{displayName:"Tags",icon:(0,l.jsx)(f.A,{}),subItems:Object.values(y.P).map(e=>{let{displayName:s}=e;return{displayName:s,href:"#"}})},{displayName:"Shopping List",icon:(0,l.jsx)(p.A,{}),href:"/shopping-list"},{displayName:"Archive",icon:(0,l.jsx)(u.A,{}),href:"/archive"},{displayName:"Settings",icon:(0,l.jsx)(h.A,{}),href:"/settings"}];function b(e){let{path:s}=e,{isMobile:a,setOpenMobile:t}=(0,i.cL)();return(0,l.jsxs)(i.Bx,{children:[a&&(0,l.jsx)(i.Gh,{className:"p-3",children:(0,l.jsxs)("div",{className:"flex justify-between items-center",children:[(0,l.jsx)(r(),{className:"text-2xl font-bold focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-2 focus:ring-offset-background focus:rounded-md",href:"/",onClick:()=>t(!1),children:"KONYHA"}),(0,l.jsx)(m.$,{variant:"ghost",size:"icon",onClick:()=>t(!1),children:(0,l.jsx)(j.A,{})})]})}),(0,l.jsx)(i.Yv,{className:a?"":"mt-16",children:(0,l.jsxs)(i.Cn,{children:[(0,l.jsx)("div",{className:"mb-4",children:(0,l.jsx)(m.$,{variant:"default",className:"font-bold py-4 px-3",asChild:!0,children:(0,l.jsxs)(r(),{href:"/create",onClick:()=>t(!1),children:[(0,l.jsx)(g.A,{}),(0,l.jsx)("span",{children:"Add Recipe"})]})})}),(0,l.jsx)(i.rQ,{children:(0,l.jsx)(i.wZ,{children:v.map(e=>e.subItems?(0,l.jsx)(d,{asChild:!0,defaultOpen:!0,className:"group/collapsible",children:(0,l.jsxs)(i.FX,{children:[(0,l.jsx)(o,{asChild:!0,children:(0,l.jsxs)(i.Uj,{children:[e.icon,(0,l.jsx)("span",{children:e.displayName}),(0,l.jsx)(N.A,{className:"ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"})]})}),(0,l.jsx)(c,{children:(0,l.jsx)(i.q9,{children:e.subItems.map(e=>(0,l.jsx)(i.Fg,{children:(0,l.jsx)(i.Cp,{asChild:!0,children:(0,l.jsx)(r(),{href:e.href,onClick:()=>t(!1),children:(0,l.jsx)("span",{children:e.displayName})})})},e.displayName))})})]})},e.displayName):(0,l.jsx)(i.FX,{children:(0,l.jsx)(i.Uj,{asChild:!0,isActive:s===e.href,children:(0,l.jsxs)(r(),{href:e.href,onClick:()=>t(!1),children:[e.icon,(0,l.jsx)("span",{children:e.displayName})]})})},e.href))})})]})})]})}},9267:(e,s,a)=>{a.d(s,{K:()=>i});var l=a(5155),t=a(3312),r=a(3601);function i(e){let{icon:s,tooltip:a,variant:i="ghost",onClick:n,size:d="normal",isActive:o=!1}=e;return(0,l.jsx)(r.Bc,{children:(0,l.jsxs)(r.m_,{children:[(0,l.jsx)(r.k$,{asChild:!0,children:(0,l.jsx)(t.$,{variant:i,size:"icon",className:"".concat("small"===d?"h-8 w-8":""," ").concat(o?"bg-accent text-accent-foreground":""),onClick:n,children:s})}),(0,l.jsx)(r.ZI,{children:(0,l.jsx)("p",{children:a})})]})})}},1460:(e,s,a)=>{a.d(s,{M:()=>r});var l=a(5155);let t={list:"max-w-2xl",grid:"sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl-grid-cols-6 max-w-7xl"};function r(e){let{title:s,variant:a="list",children:r}=e;return(0,l.jsxs)("div",{className:"gap-3 p-3 w-full mx-auto grid grid-cols-1 ".concat(t[a]),children:[s&&(0,l.jsx)("h1",{className:"col-span-full scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",children:s}),r]})}},3377:(e,s,a)=>{a.d(s,{j:()=>k});var l=a(5155),t=a(2115),r=a(437),i=a(7512),n=a(3261),d=a(1703),o=a(5792),c=a(5524),m=a(5686),x=a(9553),f=a(8131),p=a(2757),u=a(1027),h=a(1567);let j=(0,u.F)("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",{variants:{variant:{default:"border-transparent bg-primary text-primary-foreground hover:bg-primary/80",secondary:"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",destructive:"border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",outline:"text-foreground"}},defaultVariants:{variant:"default"}});function g(e){let{className:s,variant:a,...t}=e;return(0,l.jsx)("div",{className:(0,h.cn)(j({variant:a}),s),...t})}var N=a(3312);let y=t.forwardRef((e,s)=>{let{className:a,...t}=e;return(0,l.jsx)("div",{ref:s,className:(0,h.cn)("rounded-lg border bg-card text-card-foreground shadow-sm",a),...t})});y.displayName="Card";let v=t.forwardRef((e,s)=>{let{className:a,...t}=e;return(0,l.jsx)("div",{ref:s,className:(0,h.cn)("flex flex-col space-y-1.5 p-6",a),...t})});v.displayName="CardHeader";let b=t.forwardRef((e,s)=>{let{className:a,...t}=e;return(0,l.jsx)("div",{ref:s,className:(0,h.cn)("text-2xl font-semibold leading-none tracking-tight",a),...t})});b.displayName="CardTitle";let w=t.forwardRef((e,s)=>{let{className:a,...t}=e;return(0,l.jsx)("div",{ref:s,className:(0,h.cn)("text-sm text-muted-foreground",a),...t})});w.displayName="CardDescription";let C=t.forwardRef((e,s)=>{let{className:a,...t}=e;return(0,l.jsx)("div",{ref:s,className:(0,h.cn)("p-6 pt-0",a),...t})});C.displayName="CardContent";let z=t.forwardRef((e,s)=>{let{className:a,...t}=e;return(0,l.jsx)("div",{ref:s,className:(0,h.cn)("flex items-center p-6 pt-0",a),...t})});z.displayName="CardFooter";var A=a(9267);function k(e){let{title:s,tags:a,isSelected:u=!0,selectionMode:h=!1,onSelect:j,archivedMode:k=!1}=e,[R,K]=(0,t.useState)(!1);return(0,l.jsxs)(y,{onMouseEnter:()=>K(!0),onMouseLeave:()=>K(!1),onFocus:()=>K(!0),onBlur:e=>{e.currentTarget.contains(e.relatedTarget)||K(!1)},className:"focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background focus:rounded-md flex flex-col ".concat(u?"border-primary":""),tabIndex:0,children:[(0,l.jsxs)(v,{className:"relative",children:[(0,l.jsx)(b,{children:s}),(0,l.jsxs)(w,{className:"flex gap-3 items-center",children:[(0,l.jsxs)("div",{className:"flex gap-1 items-center",children:[(0,l.jsx)(r.A,{size:"1rem"})," 4 adag"]}),(0,l.jsxs)("div",{className:"flex gap-1 items-center",children:[(0,l.jsx)(i.A,{size:"1rem"})," 30 perc"]})]}),(u||R||h)&&(0,l.jsx)("div",{className:"absolute top-0 right-0",children:(0,l.jsx)(N.$,{variant:"ghost",size:"icon",className:"h-8 w-8 mr-1.5 ".concat(u?"text-primary hover:text-primary":""),onClick:()=>j(!u),children:u?(0,l.jsx)(n.A,{}):(0,l.jsx)(d.A,{})})})]}),(0,l.jsx)(C,{className:"flex-grow",children:"card content"}),(0,l.jsxs)(z,{className:"flex flex-col gap-4 items-start pb-3 mt-auto",children:[(0,l.jsx)("div",{className:"flex gap-2 flex-wrap",children:a.map(e=>(0,l.jsx)(g,{tabIndex:k?void 0:0,onClick:k?void 0:()=>console.log(e.displayName),className:k?"":"cursor-pointer",variant:k?"outline":"default",children:e.displayName},e.id))}),(0,l.jsx)("div",{className:"flex gap-4 ".concat(R&&!h?"":"invisible"),children:k?(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(A.K,{icon:(0,l.jsx)(o.A,{}),tooltip:"Restore",size:"small"}),(0,l.jsx)(A.K,{icon:(0,l.jsx)(c.A,{}),tooltip:"Delete",size:"small"})]}):(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(A.K,{icon:(0,l.jsx)(m.A,{}),tooltip:"Edit Recipe",size:"small"}),(0,l.jsx)(A.K,{icon:(0,l.jsx)(x.A,{}),tooltip:"Share",size:"small"}),(0,l.jsx)(A.K,{icon:(0,l.jsx)(f.A,{}),tooltip:"Archive",size:"small"}),(0,l.jsx)(A.K,{icon:(0,l.jsx)(p.A,{}),tooltip:"More Options",size:"small"})]})})]})]})}},639:(e,s,a)=>{a.d(s,{V:()=>j});var l=a(5155),t=a(2115),r=a(8173),i=a.n(r),n=a(7936),d=a(1354),o=a(3312),c=a(4920),m=a(1567);let x=t.forwardRef((e,s)=>{let{className:a,...t}=e;return(0,l.jsx)(c.bL,{ref:s,className:(0,m.cn)("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",a),...t})});x.displayName=c.bL.displayName;let f=t.forwardRef((e,s)=>{let{className:a,...t}=e;return(0,l.jsx)(c._V,{ref:s,className:(0,m.cn)("aspect-square h-full w-full",a),...t})});f.displayName=c._V.displayName;let p=t.forwardRef((e,s)=>{let{className:a,...t}=e;return(0,l.jsx)(c.H4,{ref:s,className:(0,m.cn)("flex h-full w-full items-center justify-center rounded-full bg-muted",a),...t})});p.displayName=c.H4.displayName;var u=a(9095),h=a(9267);function j(e){let{onSidebarToggle:s=()=>{},customTopbarContent:a=(0,l.jsx)(l.Fragment,{})}=e,[r,c]=(0,t.useState)(!1);return(0,l.jsxs)("nav",{className:"fixed top-0 right-0 w-full z-50 flex items-center p-2 border-b bg-background gap-2",children:[(0,l.jsx)(h.K,{icon:(0,l.jsx)(n.A,{}),tooltip:"Toggle Sidebar",size:"normal",onClick:s}),(0,l.jsx)(i(),{className:"hidden sm:block text-2xl font-bold mx-12 focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-2 focus:ring-offset-background focus:rounded-md",href:"/",children:"KONYHA"}),a,(0,l.jsxs)(u.AM,{open:r,onOpenChange:e=>{c(e)},children:[(0,l.jsx)(u.Wv,{asChild:!0,children:(0,l.jsx)(o.$,{variant:"ghost",size:"icon",className:"ml-auto mr-1 cursor-pointer rounded-full",children:(0,l.jsxs)(x,{children:[(0,l.jsx)(f,{src:"",alt:"SB"}),(0,l.jsx)(p,{children:"SB"})]})})}),(0,l.jsxs)(u.hl,{className:"w-80 mx-2 flex flex-col gap-3 font-bold",children:[(0,l.jsx)("span",{children:"Logged in as Balazs"}),(0,l.jsxs)(o.$,{className:"font-bold",children:[(0,l.jsx)(d.A,{})," Sign Out"]})]})]})]})}},6717:(e,s,a)=>{a.d(s,{x:()=>k,h:()=>R});var l=a(5155),t=a(2115),r=a(3900),i=a(3312),n=a(3601),d=a(689);function o(e){let{value:s,onChange:a,clearable:o=!1,placeholder:c,Icon:m}=e,x=(0,t.useRef)(null);return(0,l.jsxs)("div",{className:"relative flex items-center max-w-2xl ml-1 w-full",children:[m&&(0,l.jsx)(m,{className:"absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform"}),(0,l.jsx)(r.p,{ref:x,placeholder:c,className:"px-8",value:s,onChange:e=>a(e,e.target.value)}),s&&o&&(0,l.jsx)(n.Bc,{children:(0,l.jsxs)(n.m_,{children:[(0,l.jsx)(n.k$,{asChild:!0,children:(0,l.jsx)(i.$,{variant:"ghost",size:"icon",className:"absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 transform p-3 rounded-full",onClick:()=>{var e;a(void 0,""),null===(e=x.current)||void 0===e||e.focus()},children:(0,l.jsx)(d.A,{})})}),(0,l.jsx)(n.ZI,{children:(0,l.jsx)("p",{children:"Clear input field"})})]})})]})}var c=a(9095),m=a(9267),x=a(2329),f=a(2645),p=a(2488),u=a(7193),h=a(1567);let j=x.bL;x.YJ;let g=x.WT,N=t.forwardRef((e,s)=>{let{className:a,children:t,...r}=e;return(0,l.jsxs)(x.l9,{ref:s,className:(0,h.cn)("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",a),...r,children:[t,(0,l.jsx)(x.In,{asChild:!0,children:(0,l.jsx)(f.A,{className:"h-4 w-4 opacity-50"})})]})});N.displayName=x.l9.displayName;let y=t.forwardRef((e,s)=>{let{className:a,...t}=e;return(0,l.jsx)(x.PP,{ref:s,className:(0,h.cn)("flex cursor-default items-center justify-center py-1",a),...t,children:(0,l.jsx)(p.A,{className:"h-4 w-4"})})});y.displayName=x.PP.displayName;let v=t.forwardRef((e,s)=>{let{className:a,...t}=e;return(0,l.jsx)(x.wn,{ref:s,className:(0,h.cn)("flex cursor-default items-center justify-center py-1",a),...t,children:(0,l.jsx)(f.A,{className:"h-4 w-4"})})});v.displayName=x.wn.displayName;let b=t.forwardRef((e,s)=>{let{className:a,children:t,position:r="popper",...i}=e;return(0,l.jsx)(x.ZL,{children:(0,l.jsxs)(x.UC,{ref:s,className:(0,h.cn)("relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2","popper"===r&&"data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",a),position:r,...i,children:[(0,l.jsx)(y,{}),(0,l.jsx)(x.LM,{className:(0,h.cn)("p-1","popper"===r&&"h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),children:t}),(0,l.jsx)(v,{})]})})});b.displayName=x.UC.displayName,t.forwardRef((e,s)=>{let{className:a,...t}=e;return(0,l.jsx)(x.JU,{ref:s,className:(0,h.cn)("py-1.5 pl-8 pr-2 text-sm font-semibold",a),...t})}).displayName=x.JU.displayName;let w=t.forwardRef((e,s)=>{let{className:a,children:t,...r}=e;return(0,l.jsxs)(x.q7,{ref:s,className:(0,h.cn)("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",a),...r,children:[(0,l.jsx)("span",{className:"absolute left-2 flex h-3.5 w-3.5 items-center justify-center",children:(0,l.jsx)(x.VF,{children:(0,l.jsx)(u.A,{className:"h-4 w-4"})})}),(0,l.jsx)(x.p4,{children:t})]})});w.displayName=x.q7.displayName,t.forwardRef((e,s)=>{let{className:a,...t}=e;return(0,l.jsx)(x.wv,{ref:s,className:(0,h.cn)("-mx-1 my-1 h-px bg-muted",a),...t})}).displayName=x.wv.displayName;var C=a(8986),z=a(2591),A=a(138);function k(e){let{searchQuery:s,onSearchQueryChange:a,selectedLayout:r,onLayoutChange:i}=e,[n,d]=(0,t.useState)(!1);return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)("div",{className:"flex-1 relative flex items-center max-w-2xl ml-1",children:(0,l.jsx)(o,{placeholder:"Search",clearable:!0,Icon:z.A,value:s,onChange:(e,s)=>a(s)})}),(0,l.jsxs)(c.AM,{open:n,onOpenChange:e=>d(e),children:[(0,l.jsx)(c.Wv,{asChild:!0,children:(0,l.jsx)("span",{children:(0,l.jsx)(m.K,{size:"normal",variant:"ghost",icon:(0,l.jsx)(A.A,{}),tooltip:"Filter and view options",isActive:n,onClick:()=>d(e=>!e)})})}),(0,l.jsx)(c.hl,{className:"w-80 mx-2",children:(0,l.jsxs)("div",{className:"flex items-center justify-between",children:[(0,l.jsx)(C.J,{htmlFor:"layoutSelect",className:"font-bold",children:"Layout"}),(0,l.jsxs)(j,{onValueChange:i,defaultValue:r,children:[(0,l.jsx)(N,{className:"w-[180px]",id:"layoutSelect",children:(0,l.jsx)(g,{})}),(0,l.jsxs)(b,{children:[(0,l.jsx)(w,{value:"list",children:"List"}),(0,l.jsx)(w,{value:"grid",children:"Grid"})]})]})]})})]})]})}function R(e){let{selectionLength:s,onClearSelection:a,selectActions:t}=e;return(0,l.jsxs)("div",{className:"flex items-center gap-2",children:[(0,l.jsx)(m.K,{size:"normal",variant:"ghost",icon:(0,l.jsx)(d.A,{}),tooltip:"Clear selection",onClick:a}),(0,l.jsxs)("span",{className:"mr-4 font-bold ",children:[s," selected"]}),t.map((e,s)=>{let{icon:a,tooltip:t,onClick:r}=e;return(0,l.jsx)(m.K,{size:"normal",variant:"ghost",icon:a,tooltip:t,onClick:r},s)})]})}},8986:(e,s,a)=>{a.d(s,{J:()=>o});var l=a(5155),t=a(2115),r=a(6195),i=a(1027),n=a(1567);let d=(0,i.F)("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"),o=t.forwardRef((e,s)=>{let{className:a,...t}=e;return(0,l.jsx)(r.b,{ref:s,className:(0,n.cn)(d(),a),...t})});o.displayName=r.b.displayName},9095:(e,s,a)=>{a.d(s,{AM:()=>n,Wv:()=>d,hl:()=>o});var l=a(5155),t=a(2115),r=a(532),i=a(1567);let n=r.bL,d=r.l9,o=t.forwardRef((e,s)=>{let{className:a,align:t="center",sideOffset:n=4,...d}=e;return(0,l.jsx)(r.ZL,{children:(0,l.jsx)(r.UC,{ref:s,align:t,sideOffset:n,className:(0,i.cn)("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",a),...d})})});o.displayName=r.UC.displayName},9291:(e,s,a)=>{a.d(s,{P:()=>l,s:()=>t});let l={magyar:{displayName:"magyar",id:"0"},alaprecept:{displayName:"alaprecept",id:"1"},főzelék:{displayName:"főzel\xe9k",id:"2"},desszert:{displayName:"desszert",id:"3"},tészta:{displayName:"t\xe9szta",id:"4"},olasz:{displayName:"olasz",id:"5"},leves:{displayName:"leves",id:"6"}},t=[{id:"1",title:"Palacsinta alaprecept",tags:[l.alaprecept,l.magyar,l.desszert]},{id:"2",title:"Soml\xf3i galuska",tags:[l.desszert,l.magyar]},{id:"3",title:"Krumplifőzel\xe9k",tags:[l["főzel\xe9k"],l.magyar]},{id:"4",title:"Kocsonya",tags:[l.magyar]},{id:"5",title:"Bety\xe1rleves",tags:[l.magyar,l.leves]},{id:"6",title:"Fas\xedrt",tags:[l.magyar]},{id:"7",title:"Carbonara",tags:[l.olasz,l["t\xe9szta"]]},{id:"8",title:"Lecs\xf3",tags:[l.magyar]},{id:"9",title:"Rizott\xf3",tags:[l.olasz]}]}}]);