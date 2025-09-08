"use strict";(()=>{var a={};a.id=8765,a.ids=[8765],a.modules={10762:a=>{a.exports=import("@neondatabase/serverless")},67233:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{default:()=>g});var e=c(10762),f=a([e]);e=(f.then?(await f)():f)[0];let h=(0,e.neon)(process.env.DATABASE_URL);async function g(a,b){if("GET"===a.method)try{let a=(await h`
        SELECT 
          s.*,
          u.first_name as user_first_name,
          u.last_name as user_last_name,
          u.last_login,
          (
            SELECT COUNT(*) FROM tasks 
            WHERE tasks.assigned_to = s.user_id
            AND tasks.status IN ('pending', 'in_progress')
          )::int as active_task_count,
          (
            SELECT COUNT(*) FROM tasks 
            WHERE tasks.assigned_to = s.user_id
            AND tasks.status = 'completed'
          )::int as completed_task_count,
          (
            SELECT id FROM tasks 
            WHERE tasks.assigned_to = s.user_id
            AND tasks.status = 'in_progress'
            ORDER BY tasks.updated_at DESC
            LIMIT 1
          ) as current_task_id
        FROM staff s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE (
          s.department = 'Field Operations' OR
          s.position = 'Field Technician' OR
          s.position = 'Technician'
        )
        ORDER BY s.updated_at DESC
        LIMIT 50
      `).map(a=>{var b,c,d;return{id:a.id,name:`${a.first_name} ${a.last_name}`,email:a.email,phone:a.phone||"+27 00 000 0000",status:(b=a.status,c=a.active_task_count,d=a.current_task_id,"inactive"===b||"terminated"===b?"offline":d||c>0?"on_task":"on_leave"===b?"on_break":"available"),currentTask:a.current_task_id||null,location:{lat:-26.2041,lng:28.0473},skills:Array.isArray(a.skills)?a.skills:[],rating:a.performance_rating?Number(a.performance_rating):4,completedTasks:a.completed_task_count||0,activeTaskCount:a.active_task_count||0,lastActive:a.last_login||a.updated_at||new Date().toISOString(),createdAt:a.created_at||new Date().toISOString()}}),c={total:a.length,available:a.filter(a=>"available"===a.status).length,onTask:a.filter(a=>"on_task"===a.status).length,onBreak:a.filter(a=>"on_break"===a.status).length,offline:a.filter(a=>"offline"===a.status).length,avgRating:a.reduce((a,b)=>a+b.rating,0)/(a.length||1)};b.status(200).json({technicians:a,...c})}catch(a){console.error("Error fetching technicians:",a),b.status(500).json({error:"Failed to fetch technicians"})}else if("POST"===a.method)try{let c=a.body,d=c.employeeId||`TECH-${Date.now().toString().slice(-8)}`,e=await h`
        INSERT INTO staff (
          employee_id, first_name, last_name, email, phone,
          department, position, status, contract_type
        )
        VALUES (
          ${d},
          ${c.firstName||c.name?.split(" ")[0]||""},
          ${c.lastName||c.name?.split(" ")[1]||""},
          ${c.email},
          ${c.phone},
          'Field Operations',
          'Field Technician',
          'active',
          'full-time'
        )
        RETURNING *
      `;b.status(201).json({message:"Technician added successfully",technician:e[0]})}catch(a){console.error("Error adding technician:",a),b.status(500).json({error:"Failed to add technician"})}else b.status(405).json({error:"Method not allowed"})}d()}catch(a){d(a)}})},75600:a=>{a.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},87681:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{config:()=>o,default:()=>n,handler:()=>m});var e=c(29046),f=c(8667),g=c(33480),h=c(86435),i=c(67233),j=c(58112),k=c(18766),l=a([i]);i=(l.then?(await l)():l)[0];let n=(0,h.M)(i,"default"),o=(0,h.M)(i,"config"),p=new g.PagesAPIRouteModule({definition:{kind:f.A.PAGES_API,page:"/api/field/technicians",pathname:"/api/field/technicians",bundlePath:"",filename:""},userland:i,distDir:".next",relativeProjectDir:""});async function m(a,b,c){let d=await p.prepare(a,b,{srcPage:"/api/field/technicians"});if(!d){b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve());return}let{query:f,params:g,prerenderManifest:h,routerServerContext:i}=d;try{let c=a.method||"GET",d=(0,j.getTracer)(),e=d.getActiveScopeSpan(),l=p.instrumentationOnRequestError.bind(p),m=async e=>p.render(a,b,{query:{...f,...g},params:g,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:h.preview,propagateError:!1,dev:p.isDev,page:"/api/field/technicians",internalRevalidate:null==i?void 0:i.revalidate,onError:(...b)=>l(a,...b)}).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let f=d.getRootSpanAttributes();if(!f)return;if(f.get("next.span_type")!==k.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${f.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let g=f.get("next.route");if(g){let a=`${c} ${g}`;e.setAttributes({"next.route":g,"http.route":g,"next.span_name":a}),e.updateName(a)}else e.updateName(`${c} ${a.url}`)});e?await m(e):await d.withPropagatedContext(a.headers,()=>d.trace(k.BaseServerSpan.handleRequest,{spanName:`${c} ${a.url}`,kind:j.SpanKind.SERVER,attributes:{"http.method":c,"http.target":a.url}},m))}catch(a){if(p.isDev)throw a;(0,e.sendError)(b,500,"Internal Server Error")}finally{null==c.waitUntil||c.waitUntil.call(c,Promise.resolve())}}d()}catch(a){d(a)}})}};var b=require("../../../webpack-api-runtime.js");b.C(a);var c=b.X(0,[7169],()=>b(b.s=87681));module.exports=c})();