"use strict";(()=>{var a={};a.id=1223,a.ids=[1223],a.modules={9892:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{default:()=>g});var e=c(10762),f=a([e]);e=(f.then?(await f)():f)[0];let h=(0,e.neon)(process.env.DATABASE_URL);async function g(a,b){if("GET"!==a.method)return b.status(405).json({error:"Method not allowed"});let{projectId:c}=a.query;try{let a;return a=c?(await h`
        SELECT 
          p.*,
          c.name as client_name,
          COUNT(DISTINCT sp.id) as pole_count,
          COUNT(DISTINCT sd.id) as drop_count,
          COALESCE(SUM(sf.length), 0) as total_fiber
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        LEFT JOIN sow_poles sp ON p.id = sp.project_id
        LEFT JOIN sow_drops sd ON p.id = sd.project_id
        LEFT JOIN sow_fibre sf ON p.id = sf.project_id
        WHERE p.id = ${c}
        GROUP BY p.id, c.name
      `)[0]||null:(await h`
        SELECT 
          COUNT(*) as total_projects,
          COUNT(CASE WHEN status = 'active' OR status = 'in_progress' THEN 1 END) as active_projects,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
          COUNT(CASE WHEN status = 'on_hold' THEN 1 END) as on_hold_projects,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_projects,
          COALESCE(SUM(budget), 0) as total_budget,
          COALESCE(AVG(budget), 0) as average_budget,
          COUNT(DISTINCT client_id) as unique_clients
        FROM projects
      `)[0]||{total_projects:0,active_projects:0,completed_projects:0,on_hold_projects:0,cancelled_projects:0,total_budget:0,average_budget:0,unique_clients:0},b.status(200).json({success:!0,data:a})}catch(a){return console.error("Project summary error:",a),b.status(200).json({success:!0,data:c?null:{total_projects:0,active_projects:0,completed_projects:0,on_hold_projects:0,cancelled_projects:0,total_budget:0,average_budget:0,unique_clients:0}})}}d()}catch(a){d(a)}})},10762:a=>{a.exports=import("@neondatabase/serverless")},53192:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{config:()=>o,default:()=>n,handler:()=>m});var e=c(29046),f=c(8667),g=c(33480),h=c(86435),i=c(9892),j=c(58112),k=c(18766),l=a([i]);i=(l.then?(await l)():l)[0];let n=(0,h.M)(i,"default"),o=(0,h.M)(i,"config"),p=new g.PagesAPIRouteModule({definition:{kind:f.A.PAGES_API,page:"/api/analytics/projects/summary",pathname:"/api/analytics/projects/summary",bundlePath:"",filename:""},userland:i,distDir:".next",relativeProjectDir:""});async function m(a,b,c){let d=await p.prepare(a,b,{srcPage:"/api/analytics/projects/summary"});if(!d){b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve());return}let{query:f,params:g,prerenderManifest:h,routerServerContext:i}=d;try{let c=a.method||"GET",d=(0,j.getTracer)(),e=d.getActiveScopeSpan(),l=p.instrumentationOnRequestError.bind(p),m=async e=>p.render(a,b,{query:{...f,...g},params:g,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:h.preview,propagateError:!1,dev:p.isDev,page:"/api/analytics/projects/summary",internalRevalidate:null==i?void 0:i.revalidate,onError:(...b)=>l(a,...b)}).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let f=d.getRootSpanAttributes();if(!f)return;if(f.get("next.span_type")!==k.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${f.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let g=f.get("next.route");if(g){let a=`${c} ${g}`;e.setAttributes({"next.route":g,"http.route":g,"next.span_name":a}),e.updateName(a)}else e.updateName(`${c} ${a.url}`)});e?await m(e):await d.withPropagatedContext(a.headers,()=>d.trace(k.BaseServerSpan.handleRequest,{spanName:`${c} ${a.url}`,kind:j.SpanKind.SERVER,attributes:{"http.method":c,"http.target":a.url}},m))}catch(a){if(p.isDev)throw a;(0,e.sendError)(b,500,"Internal Server Error")}finally{null==c.waitUntil||c.waitUntil.call(c,Promise.resolve())}}d()}catch(a){d(a)}})},75600:a=>{a.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")}};var b=require("../../../../webpack-api-runtime.js");b.C(a);var c=b.X(0,[7169],()=>b(b.s=53192));module.exports=c})();