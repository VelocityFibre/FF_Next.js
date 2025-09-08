"use strict";(()=>{var a={};a.id=4035,a.ids=[4035],a.modules={10762:a=>{a.exports=import("@neondatabase/serverless")},52576:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{config:()=>o,default:()=>n,handler:()=>m});var e=c(29046),f=c(8667),g=c(33480),h=c(86435),i=c(81096),j=c(58112),k=c(18766),l=a([i]);i=(l.then?(await l)():l)[0];let n=(0,h.M)(i,"default"),o=(0,h.M)(i,"config"),p=new g.PagesAPIRouteModule({definition:{kind:f.A.PAGES_API,page:"/api/sow/list",pathname:"/api/sow/list",bundlePath:"",filename:""},userland:i,distDir:".next",relativeProjectDir:""});async function m(a,b,c){let d=await p.prepare(a,b,{srcPage:"/api/sow/list"});if(!d){b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve());return}let{query:f,params:g,prerenderManifest:h,routerServerContext:i}=d;try{let c=a.method||"GET",d=(0,j.getTracer)(),e=d.getActiveScopeSpan(),l=p.instrumentationOnRequestError.bind(p),m=async e=>p.render(a,b,{query:{...f,...g},params:g,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:h.preview,propagateError:!1,dev:p.isDev,page:"/api/sow/list",internalRevalidate:null==i?void 0:i.revalidate,onError:(...b)=>l(a,...b)}).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let f=d.getRootSpanAttributes();if(!f)return;if(f.get("next.span_type")!==k.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${f.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let g=f.get("next.route");if(g){let a=`${c} ${g}`;e.setAttributes({"next.route":g,"http.route":g,"next.span_name":a}),e.updateName(a)}else e.updateName(`${c} ${a.url}`)});e?await m(e):await d.withPropagatedContext(a.headers,()=>d.trace(k.BaseServerSpan.handleRequest,{spanName:`${c} ${a.url}`,kind:j.SpanKind.SERVER,attributes:{"http.method":c,"http.target":a.url}},m))}catch(a){if(p.isDev)throw a;(0,e.sendError)(b,500,"Internal Server Error")}finally{null==c.waitUntil||c.waitUntil.call(c,Promise.resolve())}}d()}catch(a){d(a)}})},75600:a=>{a.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},81096:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{default:()=>h});var e=c(81761),f=c(10762),g=a([f]);f=(g.then?(await g)():g)[0];let k=(0,f.neon)(process.env.DATABASE_URL||"postgresql://neondb_owner:npg_jUJCNFiG38aY@ep-mute-brook-a99vppmn-pooler.gwc.azure.neon.tech/neondb?sslmode=require");async function h(a,b){let{userId:c}=(0,e.x)(a);if(!c)return b.status(401).json({success:!1,data:null,message:"Unauthorized"});if("GET"!==a.method)return b.setHeader("Allow",["GET"]),b.status(405).json({success:!1,data:null,message:`Method ${a.method} not allowed`});try{let{type:c="all",projectId:d,status:e,page:f="1",pageSize:g="50",search:h,sortBy:k="created_at",sortOrder:l="DESC"}=a.query,m=parseInt(f),n=parseInt(g),o=(m-1)*n;await j();let p=[],q=0;if("all"===c||"poles"===c){let a=await i("sow_poles",{projectId:d,status:e,search:h,limit:n,offset:o,sortBy:k,sortOrder:l});"poles"===c?(p=a.data,q=a.count):(p.push(...a.data.map(a=>({...a,type:"pole"}))),q+=a.count)}if("all"===c||"drops"===c){let a=await i("sow_drops",{projectId:d,status:e,search:h,limit:"drops"===c?n:void 0,offset:"drops"===c?o:void 0,sortBy:k,sortOrder:l});"drops"===c?(p=a.data,q=a.count):(p.push(...a.data.map(a=>({...a,type:"drop"}))),q+=a.count)}if("all"===c||"fibre"===c){let a=await i("sow_fibre",{projectId:d,status:e,search:h,limit:"fibre"===c?n:void 0,offset:"fibre"===c?o:void 0,sortBy:k,sortOrder:l});"fibre"===c?(p=a.data,q=a.count):(p.push(...a.data.map(a=>({...a,type:"fibre"}))),q+=a.count)}if("all"===c){p.sort((a,b)=>{let c=a[k],d=b[k],e="DESC"===l?-1:1;return c>d?e:-e});let a=p.slice(o,o+n);return b.status(200).json({success:!0,data:a,pagination:{total:q,page:m,pageSize:n,totalPages:Math.ceil(q/n)}})}return b.status(200).json({success:!0,data:p,pagination:{total:q,page:m,pageSize:n,totalPages:Math.ceil(q/n)}})}catch(a){return console.error("SOW List API Error:",a),b.status(500).json({success:!1,data:null,error:"Internal server error"})}}async function i(a,b){let{projectId:c,status:d,search:e,limit:f,offset:g,sortBy:h,sortOrder:i}=b,j=[],l=[];c&&(j.push(`s.project_id = $${l.length+1}::uuid`),l.push(c)),d&&(j.push(`s.status = $${l.length+1}`),l.push(d)),e&&("sow_poles"===a?j.push(`(s.pole_number ILIKE $${l.length+1} OR s.location ILIKE $${l.length+1})`):"sow_drops"===a?j.push(`(s.drop_number ILIKE $${l.length+1} OR s.address ILIKE $${l.length+1})`):"sow_fibre"===a&&j.push(`(s.cable_id ILIKE $${l.length+1} OR s.start_location ILIKE $${l.length+1} OR s.end_location ILIKE $${l.length+1})`),l.push(`%${e}%`));let m=j.length>0?`WHERE ${j.join(" AND ")}`:"",n=`SELECT COUNT(*) FROM ${a} s ${m}`,[o]=await k.unsafe(n,l),p=parseInt(o.count),q=`
    SELECT s.*, p.project_name, p.project_code
    FROM ${a} s
    LEFT JOIN projects p ON s.project_id = p.id
    ${m}
    ORDER BY s.${h} ${i}
  `;return void 0!==f&&void 0!==g&&(q+=` LIMIT ${f} OFFSET ${g}`),{data:await k.unsafe(q,l),count:p}}async function j(){await k`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_code VARCHAR(50) NOT NULL UNIQUE,
      project_name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,await k`
    CREATE TABLE IF NOT EXISTS sow_poles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID,
      pole_number VARCHAR(255) NOT NULL,
      location VARCHAR(500),
      pole_type VARCHAR(100),
      height DECIMAL(10,2),
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,await k`
    CREATE TABLE IF NOT EXISTS sow_drops (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID,
      drop_number VARCHAR(255) NOT NULL,
      address VARCHAR(500),
      drop_type VARCHAR(100),
      cable_length DECIMAL(10,2),
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,await k`
    CREATE TABLE IF NOT EXISTS sow_fibre (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID,
      cable_id VARCHAR(255) NOT NULL,
      start_location VARCHAR(255),
      end_location VARCHAR(255),
      cable_type VARCHAR(100),
      length DECIMAL(10,2),
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`}d()}catch(a){d(a)}})},81761:(a,b,c)=>{c.d(b,{x:()=>d});function d(a){return{userId:"demo-user-123",sessionId:"demo-session",user:{id:"demo-user-123",email:"demo@fibreflow.com",name:"Demo User",role:"admin"}}}}};var b=require("../../../webpack-api-runtime.js");b.C(a);var c=b.X(0,[7169],()=>b(b.s=52576));module.exports=c})();