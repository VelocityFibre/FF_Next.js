"use strict";(()=>{var a={};a.id=9249,a.ids=[9249],a.modules={10762:a=>{a.exports=import("@neondatabase/serverless")},16598:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{default:()=>g});var e=c(10762),f=a([e]);e=(f.then?(await f)():f)[0];let h=(0,e.neon)(process.env.DATABASE_URL);async function g(a,b){let{id:c}=a.query;if(b.setHeader("Access-Control-Allow-Credentials","true"),b.setHeader("Access-Control-Allow-Origin","*"),b.setHeader("Access-Control-Allow-Methods","GET,PUT,DELETE,OPTIONS"),b.setHeader("Access-Control-Allow-Headers","X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"),"OPTIONS"===a.method)return void b.status(200).end();try{if(!c||"string"!=typeof c)return b.status(400).json({error:"Client ID is required"});switch(a.method){case"GET":{let a=await h`
          SELECT 
            c.*,
            COUNT(DISTINCT p.id) as project_count,
            COUNT(DISTINCT CASE WHEN p.status = 'ACTIVE' OR p.status = 'IN_PROGRESS' THEN p.id END) as active_projects,
            COUNT(DISTINCT CASE WHEN p.status = 'COMPLETED' THEN p.id END) as completed_projects,
            SUM(p.budget_allocated) as total_budget,
            SUM(p.budget_spent) as total_spent,
            JSON_AGG(
              DISTINCT JSONB_BUILD_OBJECT(
                'id', p.id,
                'name', p.name,
                'status', p.status,
                'priority', p.priority,
                'start_date', p.start_date,
                'end_date', p.end_date,
                'budget_allocated', p.budget_allocated,
                'budget_spent', p.budget_spent,
                'project_manager_id', p.project_manager_id
              ) ORDER BY p.created_at DESC
            ) FILTER (WHERE p.id IS NOT NULL) as projects
          FROM clients c
          LEFT JOIN projects p ON p.client_id = c.id
          WHERE c.id = ${c}
          GROUP BY c.id
        `;if(!a||0===a.length)return b.status(404).json({success:!1,error:"Client not found"});return b.status(200).json({success:!0,data:a[0]})}case"PUT":{let d=a.body,e=await h`
          UPDATE clients 
          SET 
              name = ${d.name||d.company_name},
              email = ${d.email},
              phone = ${d.phone},
              address = ${d.address},
              city = ${d.city},
              state = ${d.state},
              postal_code = ${d.postal_code||d.postalCode},
              country = ${d.country},
              type = ${d.type},
              status = ${d.status},
              contact_person = ${d.contact_person||d.contactPerson},
              contact_email = ${d.contact_email||d.contactEmail},
              contact_phone = ${d.contact_phone||d.contactPhone},
              payment_terms = ${d.payment_terms||d.paymentTerms},
              metadata = ${d.metadata},
              updated_at = NOW()
          WHERE id = ${c}
          RETURNING *
        `;if(!e||0===e.length)return b.status(404).json({success:!1,error:"Client not found"});return b.status(200).json({success:!0,data:e[0]})}case"DELETE":{let a=await h`
          SELECT COUNT(*) as count 
          FROM projects 
          WHERE client_id = ${c} 
            AND status NOT IN ('COMPLETED', 'CANCELLED')
        `;if(a[0]?.count>0)return b.status(400).json({success:!1,error:"Cannot delete client with active projects"});let d=await h`
          DELETE FROM clients 
          WHERE id = ${c}
          RETURNING id
        `;if(!d||0===d.length)return b.status(404).json({success:!1,error:"Client not found"});return b.status(200).json({success:!0,message:"Client deleted successfully"})}default:return b.status(405).json({error:"Method not allowed"})}}catch(a){return console.error("Client API error:",a),b.status(500).json({success:!1,error:a instanceof Error?a.message:"Internal server error"})}}d()}catch(a){d(a)}})},75600:a=>{a.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},87504:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{config:()=>o,default:()=>n,handler:()=>m});var e=c(29046),f=c(8667),g=c(33480),h=c(86435),i=c(16598),j=c(58112),k=c(18766),l=a([i]);i=(l.then?(await l)():l)[0];let n=(0,h.M)(i,"default"),o=(0,h.M)(i,"config"),p=new g.PagesAPIRouteModule({definition:{kind:f.A.PAGES_API,page:"/api/clients/[id]",pathname:"/api/clients/[id]",bundlePath:"",filename:""},userland:i,distDir:".next",relativeProjectDir:""});async function m(a,b,c){let d=await p.prepare(a,b,{srcPage:"/api/clients/[id]"});if(!d){b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve());return}let{query:f,params:g,prerenderManifest:h,routerServerContext:i}=d;try{let c=a.method||"GET",d=(0,j.getTracer)(),e=d.getActiveScopeSpan(),l=p.instrumentationOnRequestError.bind(p),m=async e=>p.render(a,b,{query:{...f,...g},params:g,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:h.preview,propagateError:!1,dev:p.isDev,page:"/api/clients/[id]",internalRevalidate:null==i?void 0:i.revalidate,onError:(...b)=>l(a,...b)}).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let f=d.getRootSpanAttributes();if(!f)return;if(f.get("next.span_type")!==k.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${f.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let g=f.get("next.route");if(g){let a=`${c} ${g}`;e.setAttributes({"next.route":g,"http.route":g,"next.span_name":a}),e.updateName(a)}else e.updateName(`${c} ${a.url}`)});e?await m(e):await d.withPropagatedContext(a.headers,()=>d.trace(k.BaseServerSpan.handleRequest,{spanName:`${c} ${a.url}`,kind:j.SpanKind.SERVER,attributes:{"http.method":c,"http.target":a.url}},m))}catch(a){if(p.isDev)throw a;(0,e.sendError)(b,500,"Internal Server Error")}finally{null==c.waitUntil||c.waitUntil.call(c,Promise.resolve())}}d()}catch(a){d(a)}})}};var b=require("../../../webpack-api-runtime.js");b.C(a);var c=b.X(0,[7169],()=>b(b.s=87504));module.exports=c})();