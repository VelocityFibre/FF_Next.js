(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8558],{9980:(e,t,s)=>{(window.__NEXT_P=window.__NEXT_P||[]).push(["/staff/import",function(){return s(28777)}])},21271:(e,t,s)=>{"use strict";s.d(t,{A:()=>r});let r=(0,s(56467).A)("AlertCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]])},28364:(e,t,s)=>{"use strict";s.d(t,{A:()=>r});let r=(0,s(56467).A)("FileText",[["path",{d:"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z",key:"1nnpy2"}],["polyline",{points:"14 2 14 8 20 8",key:"1ew0cm"}],["line",{x1:"16",x2:"8",y1:"13",y2:"13",key:"14keom"}],["line",{x1:"16",x2:"8",y1:"17",y2:"17",key:"17nazh"}],["line",{x1:"10",x2:"8",y1:"9",y2:"9",key:"1a5vjj"}]])},28777:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>w});var r=s(37876),a=s(46618),i=s(30155),l=s(14232),o=s(97685),n=s(29143),d=s(16932);let c={total:0,processed:0,succeeded:0,failed:0,status:"idle"},m={selectedFile:null,importing:!1,progress:c,importResult:null,overwriteExisting:!0};var p=s(28364);let u=(0,s(56467).A)("Table",[["path",{d:"M12 3v18",key:"108xh3"}],["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M3 9h18",key:"1pudct"}],["path",{d:"M3 15h18",key:"5xshup"}]]);var f=s(97842);function h(e){var t;let{selectedFile:s,onFileSelect:a,onClearFile:l}=e;return(0,r.jsx)("div",{className:"border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors",children:s?(0,r.jsxs)("div",{className:"flex items-center justify-between p-4 bg-gray-50 rounded-lg",children:[(0,r.jsxs)("div",{className:"flex items-center space-x-3",children:[(t=s.name).endsWith(".csv")?(0,r.jsx)(p.A,{className:"w-5 h-5 text-green-500"}):t.endsWith(".xlsx")||t.endsWith(".xls")?(0,r.jsx)(u,{className:"w-5 h-5 text-blue-500"}):(0,r.jsx)(p.A,{className:"w-5 h-5 text-gray-500"}),(0,r.jsxs)("div",{className:"text-left",children:[(0,r.jsx)("p",{className:"font-medium text-gray-900",children:s.name}),(0,r.jsx)("p",{className:"text-sm text-gray-500",children:(e=>{if(0===e)return"0 B";let t=Math.floor(Math.log(e)/Math.log(1024));return"".concat((e/Math.pow(1024,t)).toFixed(1)," ").concat(["B","KB","MB","GB"][t])})(s.size)})]})]}),(0,r.jsx)("button",{onClick:l,className:"p-1 text-gray-400 hover:text-gray-600 transition-colors",children:(0,r.jsx)(f.A,{className:"w-5 h-5"})})]}):(0,r.jsxs)("label",{className:"cursor-pointer",children:[(0,r.jsx)(i.A,{className:"w-12 h-12 text-gray-400 mx-auto mb-4"}),(0,r.jsx)("p",{className:"text-lg font-medium text-gray-900 mb-2",children:"Choose a file to upload"}),(0,r.jsx)("p",{className:"text-sm text-gray-600 mb-4",children:"CSV, Excel (.xlsx, .xls) files supported"}),(0,r.jsxs)("div",{className:"inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors",children:[(0,r.jsx)(i.A,{className:"w-4 h-4 mr-2"}),"Select File"]}),(0,r.jsx)("input",{type:"file",accept:".csv,.xlsx,.xls",onChange:a,className:"hidden"})]})})}function g(e){let{progress:t}=e;return"idle"===t.status?null:(0,r.jsxs)("div",{className:"mt-6 p-4 bg-gray-50 rounded-lg",children:[(0,r.jsxs)("div",{className:"flex items-center justify-between mb-2",children:[(0,r.jsx)("span",{className:"font-medium ".concat((e=>{switch(e){case"parsing":return"text-blue-600";case"importing":return"text-yellow-600";case"completed":return"text-green-600";case"error":return"text-red-600";default:return"text-gray-600"}})(t.status)),children:(e=>{switch(e){case"parsing":return"Parsing file...";case"importing":return"Importing staff...";case"completed":return"Import completed";case"error":return"Import failed";default:return"Ready to import"}})(t.status)}),t.total>0&&(0,r.jsxs)("span",{className:"text-sm text-gray-600",children:[t.processed," / ",t.total]})]}),t.total>0&&(0,r.jsx)("div",{className:"w-full bg-gray-200 rounded-full h-2",children:(0,r.jsx)("div",{className:"bg-blue-600 h-2 rounded-full transition-all duration-300",style:{width:"".concat(t.processed/t.total*100,"%")}})})]})}var y=s(30449),b=s(21271);function v(e){let{importResult:t}=e;return(0,r.jsxs)("div",{className:"mt-6 border-t pt-6",children:[(0,r.jsx)("h4",{className:"text-lg font-semibold text-gray-900 mb-4",children:"Import Results"}),(0,r.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4 mb-6",children:[(0,r.jsxs)("div",{className:"bg-green-50 p-4 rounded-lg",children:[(0,r.jsxs)("div",{className:"flex items-center",children:[(0,r.jsx)(y.A,{className:"w-5 h-5 text-green-500 mr-2"}),(0,r.jsx)("span",{className:"font-medium text-green-900",children:"Successful"})]}),(0,r.jsx)("p",{className:"text-2xl font-bold text-green-600 mt-1",children:t.imported})]}),(0,r.jsxs)("div",{className:"bg-red-50 p-4 rounded-lg",children:[(0,r.jsxs)("div",{className:"flex items-center",children:[(0,r.jsx)(b.A,{className:"w-5 h-5 text-red-500 mr-2"}),(0,r.jsx)("span",{className:"font-medium text-red-900",children:"Failed"})]}),(0,r.jsx)("p",{className:"text-2xl font-bold text-red-600 mt-1",children:t.failed})]}),(0,r.jsxs)("div",{className:"bg-blue-50 p-4 rounded-lg",children:[(0,r.jsxs)("div",{className:"flex items-center",children:[(0,r.jsx)(p.A,{className:"w-5 h-5 text-blue-500 mr-2"}),(0,r.jsx)("span",{className:"font-medium text-blue-900",children:"Total"})]}),(0,r.jsx)("p",{className:"text-2xl font-bold text-blue-600 mt-1",children:t.imported+t.failed})]})]}),t.errors.length>0&&(0,r.jsxs)("div",{className:"bg-red-50 border border-red-200 rounded-lg p-4",children:[(0,r.jsx)("h5",{className:"font-medium text-red-900 mb-3",children:"Import Errors:"}),(0,r.jsx)("div",{className:"space-y-2 max-h-64 overflow-y-auto",children:t.errors.map((e,t)=>(0,r.jsxs)("div",{className:"text-sm",children:[(0,r.jsxs)("span",{className:"font-medium text-red-800",children:["Row ",e.row,":"]}),(0,r.jsx)("span",{className:"text-red-700 ml-2",children:e.message}),e.field&&(0,r.jsxs)("span",{className:"text-red-600 ml-1",children:["(",e.field,")"]})]},t))})]}),t.success&&(0,r.jsx)("div",{className:"bg-green-50 border border-green-200 rounded-lg p-4",children:(0,r.jsxs)("div",{className:"flex items-center",children:[(0,r.jsx)(y.A,{className:"w-5 h-5 text-green-500 mr-2"}),(0,r.jsx)("span",{className:"font-medium text-green-900",children:"All staff members imported successfully!"})]})})]})}function j(){let{selectedFile:e,importing:t,progress:s,importResult:p,overwriteExisting:u,handleFileSelect:f,handleImport:y,downloadTemplate:b,clearFile:j,setOverwriteExisting:w}=function(){let[e,t]=(0,l.useState)(m),s=(0,l.useCallback)(e=>{var s;let r=null==(s=e.target.files)?void 0:s[0];if(!r)return;let a=["text/csv","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(r.type)||r.name.endsWith(".csv")||r.name.endsWith(".xlsx")||r.name.endsWith(".xls")?{valid:!0}:{valid:!1,error:"Please select a valid CSV or Excel file"};if(!a.valid)return void o.Ay.error(a.error||"Invalid file");t(e=>({...e,selectedFile:r,importResult:null,progress:c}))},[]),r=async()=>{if(!e.selectedFile)return void o.Ay.error("Please select a file first");t(e=>({...e,importing:!0,progress:{...e.progress,status:"parsing"}}));try{var s;let r,a=(s=e.selectedFile).name.endsWith(".csv")||"text/csv"===s.type?"csv":s.name.endsWith(".xlsx")||s.name.endsWith(".xls")||s.type.includes("spreadsheet")||s.type.includes("excel")?"excel":"unknown";if("csv"===a)r=await n.r.importFromCSV(e.selectedFile,e.overwriteExisting);else if("excel"===a)r=await n.r.importFromExcel(e.selectedFile,e.overwriteExisting);else throw Error("Unsupported file type. Please use CSV or Excel files.");t(e=>({...e,importResult:r,progress:{total:r.imported+r.failed,processed:r.imported+r.failed,succeeded:r.imported,failed:r.failed,status:"completed"}})),r.success?o.Ay.success("Successfully imported ".concat(r.imported," staff members!")):o.Ay.error("Import completed with ".concat(r.failed," errors. Check details below."))}catch(e){d.Rm.error("Import failed:",{data:e},"useStaffImportAdvanced"),t(e=>({...e,progress:{...e.progress,status:"error"}})),o.Ay.error(e.message||"Failed to import staff data")}finally{t(e=>({...e,importing:!1}))}};return{...e,handleFileSelect:s,handleImport:r,downloadTemplate:()=>{let e=new Blob([n.r.getImportTemplate()],{type:"text/csv"}),t=URL.createObjectURL(e),s=document.createElement("a");s.href=t,s.download="staff-import-template.csv",document.body.appendChild(s),s.click(),document.body.removeChild(s),URL.revokeObjectURL(t),o.Ay.success("Template downloaded successfully")},clearFile:()=>{t(e=>({...e,selectedFile:null,importResult:null,progress:c}))},setOverwriteExisting:e=>{t(t=>({...t,overwriteExisting:e}))}}}();return(0,r.jsxs)("div",{className:"bg-white rounded-lg shadow-sm border border-gray-200 p-6",children:[(0,r.jsxs)("div",{className:"mb-6",children:[(0,r.jsx)("h3",{className:"text-lg font-semibold text-gray-900 mb-2",children:"Import Staff Data"}),(0,r.jsx)("p",{className:"text-sm text-gray-600",children:"Upload CSV or Excel files to import staff members. Supports both new records and updates to existing staff."})]}),(0,r.jsxs)("div",{className:"mb-6",children:[(0,r.jsxs)("label",{className:"flex items-center space-x-3",children:[(0,r.jsx)("input",{type:"checkbox",checked:u,onChange:e=>w(e.target.checked),className:"h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"}),(0,r.jsx)("span",{className:"text-sm font-medium text-gray-700",children:"Overwrite existing staff records"})]}),(0,r.jsx)("p",{className:"text-xs text-gray-500 mt-1 ml-7",children:"When enabled, staff with matching Employee IDs will be updated. When disabled, duplicates will be skipped."})]}),(0,r.jsx)(h,{selectedFile:e,onFileSelect:f,onClearFile:j}),(0,r.jsx)(g,{progress:s}),(0,r.jsxs)("div",{className:"flex items-center justify-between mt-6",children:[(0,r.jsxs)("button",{onClick:b,className:"inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors",children:[(0,r.jsx)(a.A,{className:"w-4 h-4 mr-2"}),"Download Template"]}),(0,r.jsx)("button",{onClick:y,disabled:!e||t,className:"inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",children:t?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:"animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"}),"Importing..."]}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(i.A,{className:"w-4 h-4 mr-2"}),"Import Staff"]})})]}),p&&(0,r.jsx)(v,{importResult:p})]})}let w=()=>(0,r.jsx)(j,{})},30155:(e,t,s)=>{"use strict";s.d(t,{A:()=>r});let r=(0,s(56467).A)("Upload",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]])},30449:(e,t,s)=>{"use strict";s.d(t,{A:()=>r});let r=(0,s(56467).A)("CheckCircle",[["path",{d:"M22 11.08V12a10 10 0 1 1-5.93-9.14",key:"g774vq"}],["polyline",{points:"22 4 12 14.01 9 11.01",key:"6xbx8j"}]])},32383:()=>{},46618:(e,t,s)=>{"use strict";s.d(t,{A:()=>r});let r=(0,s(56467).A)("Download",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]])},83686:()=>{},97685:(e,t,s)=>{"use strict";s.d(t,{Ay:()=>G});var r,a=s(14232);let i={data:""},l=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,o=/\/\*[^]*?\*\/|  +/g,n=/\n+/g,d=(e,t)=>{let s="",r="",a="";for(let i in e){let l=e[i];"@"==i[0]?"i"==i[1]?s=i+" "+l+";":r+="f"==i[1]?d(l,i):i+"{"+d(l,"k"==i[1]?"":t)+"}":"object"==typeof l?r+=d(l,t?t.replace(/([^,])+/g,e=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):i):null!=l&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),a+=d.p?d.p(i,l):i+":"+l+";")}return s+(t&&a?t+"{"+a+"}":a)+r},c={},m=e=>{if("object"==typeof e){let t="";for(let s in e)t+=s+m(e[s]);return t}return e};function p(e){let t,s,r,a=this||{},p=e.call?e(a.p):e;return((e,t,s,r,a)=>{var i,p,u,f;let h=m(e),g=c[h]||(c[h]=(e=>{let t=0,s=11;for(;t<e.length;)s=101*s+e.charCodeAt(t++)>>>0;return"go"+s})(h));if(!c[g]){let t=h!==e?e:(e=>{let t,s,r=[{}];for(;t=l.exec(e.replace(o,""));)t[4]?r.shift():t[3]?(s=t[3].replace(n," ").trim(),r.unshift(r[0][s]=r[0][s]||{})):r[0][t[1]]=t[2].replace(n," ").trim();return r[0]})(e);c[g]=d(a?{["@keyframes "+g]:t}:t,s?"":"."+g)}let y=s&&c.g?c.g:null;return s&&(c.g=c[g]),i=c[g],p=t,u=r,(f=y)?p.data=p.data.replace(f,i):-1===p.data.indexOf(i)&&(p.data=u?i+p.data:p.data+i),g})(p.unshift?p.raw?(t=[].slice.call(arguments,1),s=a.p,p.reduce((e,r,a)=>{let i=t[a];if(i&&i.call){let e=i(s),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;i=t?"."+t:e&&"object"==typeof e?e.props?"":d(e,""):!1===e?"":e}return e+r+(null==i?"":i)},"")):p.reduce((e,t)=>Object.assign(e,t&&t.call?t(a.p):t),{}):p,(r=a.target,"object"==typeof window?((r?r.querySelector("#_goober"):window._goober)||Object.assign((r||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:r||i),a.g,a.o,a.k)}p.bind({g:1});let u,f,h,g=p.bind({k:1});function y(e,t){let s=this||{};return function(){let r=arguments;function a(i,l){let o=Object.assign({},i),n=o.className||a.className;s.p=Object.assign({theme:f&&f()},o),s.o=/ *go\d+/.test(n),o.className=p.apply(s,r)+(n?" "+n:""),t&&(o.ref=l);let d=e;return e[0]&&(d=o.as||e,delete o.as),h&&d[0]&&h(o),u(d,o)}return t?t(a):a}}var b=(e,t)=>"function"==typeof e?e(t):e,v=(()=>{let e=0;return()=>(++e).toString()})(),j=(()=>{let e;return()=>{if(void 0===e&&"u">typeof window){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),w="default",N=(e,t)=>{let{toastLimit:s}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,s)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:r}=t;return N(e,{type:+!!e.toasts.find(e=>e.id===r.id),toast:r});case 3:let{toastId:a}=t;return{...e,toasts:e.toasts.map(e=>e.id===a||void 0===a?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let i=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+i}))}}},k=[],A={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},E={},C=(e,t=w)=>{E[t]=N(E[t]||A,e),k.forEach(([e,s])=>{e===t&&s(E[t])})},F=e=>Object.keys(E).forEach(t=>C(e,t)),I=(e=w)=>t=>{C(t,e)},$=e=>(t,s)=>{let r,a=((e,t="blank",s)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...s,id:(null==s?void 0:s.id)||v()}))(t,e,s);return I(a.toasterId||(r=a.id,Object.keys(E).find(e=>E[e].toasts.some(e=>e.id===r))))({type:2,toast:a}),a.id},S=(e,t)=>$("blank")(e,t);S.error=$("error"),S.success=$("success"),S.loading=$("loading"),S.custom=$("custom"),S.dismiss=(e,t)=>{let s={type:3,toastId:e};t?I(t)(s):F(s)},S.dismissAll=e=>S.dismiss(void 0,e),S.remove=(e,t)=>{let s={type:4,toastId:e};t?I(t)(s):F(s)},S.removeAll=e=>S.remove(void 0,e),S.promise=(e,t,s)=>{let r=S.loading(t.loading,{...s,...null==s?void 0:s.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let a=t.success?b(t.success,e):void 0;return a?S.success(a,{id:r,...s,...null==s?void 0:s.success}):S.dismiss(r),e}).catch(e=>{let a=t.error?b(t.error,e):void 0;a?S.error(a,{id:r,...s,...null==s?void 0:s.error}):S.dismiss(r)}),e};var M=g`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,_=g`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,O=g`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,R=y("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${M} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${_} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${O} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,z=g`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,T=y("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${z} 1s linear infinite;
`,W=g`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,L=g`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,D=y("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${W} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${L} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,P=y("div")`
  position: absolute;
`,U=y("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,B=g`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,V=y("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${B} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,H=({toast:e})=>{let{icon:t,type:s,iconTheme:r}=e;return void 0!==t?"string"==typeof t?a.createElement(V,null,t):t:"blank"===s?null:a.createElement(U,null,a.createElement(T,{...r}),"loading"!==s&&a.createElement(P,null,"error"===s?a.createElement(R,{...r}):a.createElement(D,{...r})))},q=y("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,X=y("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`;a.memo(({toast:e,position:t,style:s,children:r})=>{let i=e.height?((e,t)=>{let s=e.includes("top")?1:-1,[r,a]=j()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*s}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*s}%,-1px) scale(.6); opacity:0;}
`];return{animation:t?`${g(r)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${g(a)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||t||"top-center",e.visible):{opacity:0},l=a.createElement(H,{toast:e}),o=a.createElement(X,{...e.ariaProps},b(e.message,e));return a.createElement(q,{className:e.className,style:{...i,...s,...e.style}},"function"==typeof r?r({icon:l,message:o}):a.createElement(a.Fragment,null,l,o))}),r=a.createElement,d.p=void 0,u=r,f=void 0,h=void 0,p`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;var G=S},97842:(e,t,s)=>{"use strict";s.d(t,{A:()=>r});let r=(0,s(56467).A)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])}},e=>{e.O(0,[9659,9509,6672,8132,9143,636,6593,8792],()=>e(e.s=9980)),_N_E=e.O()}]);