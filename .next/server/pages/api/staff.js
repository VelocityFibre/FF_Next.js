"use strict";(()=>{var a={};a.id=6475,a.ids=[6475],a.modules={10762:a=>{a.exports=import("@neondatabase/serverless")},13519:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{default:()=>g});var e=c(10762),f=a([e]);e=(f.then?(await f)():f)[0];let h=(0,e.neon)(process.env.DATABASE_URL);async function g(a,b){if(b.setHeader("Access-Control-Allow-Credentials","true"),b.setHeader("Access-Control-Allow-Origin","*"),b.setHeader("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,OPTIONS"),b.setHeader("Access-Control-Allow-Headers","X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"),"OPTIONS"===a.method)return void b.status(200).end();try{switch(a.method){case"GET":let{id:c,search:d,department:e,status:f,position:g}=a.query;if(c){let a=await h`
            SELECT 
              s.*,
              CONCAT(s.first_name, ' ', s.last_name) as full_name
            FROM staff s
            WHERE s.id = ${c}
          `;if(0===a.length)return b.status(404).json({success:!1,data:null,message:"Staff member not found"});b.status(200).json({success:!0,data:a[0]})}else{let a=[];d&&a.push(`(
              LOWER(s.first_name) LIKE LOWER('%${d}%') OR 
              LOWER(s.last_name) LIKE LOWER('%${d}%') OR 
              LOWER(s.email) LIKE LOWER('%${d}%') OR 
              LOWER(s.employee_id) LIKE LOWER('%${d}%')
            )`),e&&a.push(`s.department = '${e}'`),f&&a.push(`s.status = '${f}'`),g&&a.push(`LOWER(s.position) LIKE LOWER('%${g}%')`);let c=a.length>0?`WHERE ${a.join(" AND ")}`:"",i=await h`
            SELECT 
              s.*,
              CONCAT(s.first_name, ' ', s.last_name) as full_name
            FROM staff s
            ${c?h.unsafe(c):h``}
            ORDER BY s.created_at DESC NULLS LAST
          `;b.status(200).json({success:!0,data:i||[],message:0===i.length?"No staff members found":void 0})}break;case"POST":let i=a.body,j=await h`
          INSERT INTO staff (
            employee_id, first_name, last_name, email, phone,
            department, position, hire_date, status
          )
          VALUES (
            ${i.employee_id||i.employeeId||`EMP-${Date.now()}`},
            ${i.first_name||i.firstName||""},
            ${i.last_name||i.lastName||""},
            ${i.email},
            ${i.phone||null},
            ${i.department||"General"},
            ${i.position||"Staff"},
            ${i.hire_date||i.hireDate||new Date().toISOString()},
            ${i.status||"ACTIVE"}
          )
          RETURNING *, CONCAT(first_name, ' ', last_name) as full_name
        `;b.status(201).json({success:!0,data:j[0]});break;case"PUT":if(!a.query.id)return b.status(400).json({success:!1,error:"Staff ID required"});let k=a.body,l=await h`
          UPDATE staff 
          SET 
              first_name = COALESCE(${k.first_name||k.firstName}, first_name),
              last_name = COALESCE(${k.last_name||k.lastName}, last_name),
              email = COALESCE(${k.email}, email),
              phone = COALESCE(${k.phone}, phone),
              position = COALESCE(${k.position}, position),
              department = COALESCE(${k.department}, department),
              status = COALESCE(${k.status}, status),
              hire_date = COALESCE(${k.hire_date||k.hireDate}, hire_date),
              updated_at = NOW()
          WHERE id = ${a.query.id}
          RETURNING *, CONCAT(first_name, ' ', last_name) as full_name
        `;if(0===l.length)return b.status(404).json({success:!1,error:"Staff member not found"});b.status(200).json({success:!0,data:l[0]});break;case"DELETE":if(!a.query.id)return b.status(400).json({success:!1,error:"Staff ID required"});await h`DELETE FROM staff WHERE id = ${a.query.id}`,b.status(200).json({success:!0,message:"Staff member deleted successfully"});break;default:b.status(405).json({success:!1,error:"Method not allowed"})}}catch(a){console.error("API Error:",a),b.status(500).json({success:!1,error:a.message})}}d()}catch(a){d(a)}})},75600:a=>{a.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},92397:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{config:()=>o,default:()=>n,handler:()=>m});var e=c(29046),f=c(8667),g=c(33480),h=c(86435),i=c(13519),j=c(58112),k=c(18766),l=a([i]);i=(l.then?(await l)():l)[0];let n=(0,h.M)(i,"default"),o=(0,h.M)(i,"config"),p=new g.PagesAPIRouteModule({definition:{kind:f.A.PAGES_API,page:"/api/staff",pathname:"/api/staff",bundlePath:"",filename:""},userland:i,distDir:".next",relativeProjectDir:""});async function m(a,b,c){let d=await p.prepare(a,b,{srcPage:"/api/staff"});if(!d){b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve());return}let{query:f,params:g,prerenderManifest:h,routerServerContext:i}=d;try{let c=a.method||"GET",d=(0,j.getTracer)(),e=d.getActiveScopeSpan(),l=p.instrumentationOnRequestError.bind(p),m=async e=>p.render(a,b,{query:{...f,...g},params:g,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:h.preview,propagateError:!1,dev:p.isDev,page:"/api/staff",internalRevalidate:null==i?void 0:i.revalidate,onError:(...b)=>l(a,...b)}).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let f=d.getRootSpanAttributes();if(!f)return;if(f.get("next.span_type")!==k.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${f.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let g=f.get("next.route");if(g){let a=`${c} ${g}`;e.setAttributes({"next.route":g,"http.route":g,"next.span_name":a}),e.updateName(a)}else e.updateName(`${c} ${a.url}`)});e?await m(e):await d.withPropagatedContext(a.headers,()=>d.trace(k.BaseServerSpan.handleRequest,{spanName:`${c} ${a.url}`,kind:j.SpanKind.SERVER,attributes:{"http.method":c,"http.target":a.url}},m))}catch(a){if(p.isDev)throw a;(0,e.sendError)(b,500,"Internal Server Error")}finally{null==c.waitUntil||c.waitUntil.call(c,Promise.resolve())}}d()}catch(a){d(a)}})}};var b=require("../../webpack-api-runtime.js");b.C(a);var c=b.X(0,[7169],()=>b(b.s=92397));module.exports=c})();