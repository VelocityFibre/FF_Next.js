"use strict";(()=>{var a={};a.id=7352,a.ids=[7352],a.modules={10762:a=>{a.exports=import("@neondatabase/serverless")},20575:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{default:()=>g});var e=c(10762),f=a([e]);e=(f.then?(await f)():f)[0];let h=(0,e.neon)(process.env.DATABASE_URL);async function g(a,b){let{projectId:c}=a.query;if("GET"===a.method)try{let a,d;if(c&&"all"!==c)d=(a=await h`
          SELECT * FROM boqs 
          WHERE project_id = ${c}
          ORDER BY created_at DESC
        `).length>0?await h`
            SELECT * FROM boq_items 
            WHERE project_id = ${c}
            ORDER BY line_number
          `:[];else if((a=await h`
          SELECT 
            b.*,
            COUNT(bi.id)::int as items_count
          FROM boqs b
          LEFT JOIN boq_items bi ON b.id = bi.boq_id
          GROUP BY b.id
          ORDER BY b.created_at DESC
          LIMIT 100
        `).length>0){let b=a.map(a=>a.id);d=await h`
            SELECT * FROM boq_items
            WHERE boq_id = ANY(${b})
            ORDER BY line_number
            LIMIT 500
          `}else d=[];let e=d.map(a=>({id:a.id,projectId:a.project_id,itemCode:a.item_code||"",description:a.description,unit:a.uom,quantity:Number(a.quantity),unitPrice:a.unit_price?Number(a.unit_price):0,totalPrice:a.total_price?Number(a.total_price):0,category:a.category||"Materials",supplier:a.catalog_item_name||"",status:a.procurement_status||"pending",createdAt:a.created_at||new Date().toISOString(),updatedAt:a.updated_at||new Date().toISOString()})),f={totalValue:e.reduce((a,b)=>a+b.totalPrice,0),totalItems:e.length,boqCount:a.length,categories:[...new Set(e.map(a=>a.category))]};b.status(200).json({items:e,total:e.length,boqs:a,stats:f})}catch(a){console.error("Error fetching BOQ items:",a),b.status(500).json({error:"Failed to fetch BOQ items"})}else if("POST"===a.method)try{let d=a.body,e=await h`
        INSERT INTO boq_items (
          boq_id, project_id, item_code, description, uom, quantity, 
          unit_price, total_price, category, catalog_item_name, procurement_status
        )
        VALUES (
          ${d.boqId||null}, 
          ${d.projectId||c},
          ${d.itemCode||""}, 
          ${d.description}, 
          ${d.unit||d.uom}, 
          ${d.quantity}, 
          ${d.unitPrice||0}, 
          ${d.totalPrice||0}, 
          ${d.category||"Materials"}, 
          ${d.supplier||""}, 
          ${d.status||"pending"}
        )
        RETURNING *
      `;b.status(201).json({message:"BOQ item created successfully",item:e[0]})}catch(a){console.error("Error creating BOQ item:",a),b.status(500).json({error:"Failed to create BOQ item"})}else b.status(405).json({error:"Method not allowed"})}d()}catch(a){d(a)}})},21679:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{config:()=>o,default:()=>n,handler:()=>m});var e=c(29046),f=c(8667),g=c(33480),h=c(86435),i=c(20575),j=c(58112),k=c(18766),l=a([i]);i=(l.then?(await l)():l)[0];let n=(0,h.M)(i,"default"),o=(0,h.M)(i,"config"),p=new g.PagesAPIRouteModule({definition:{kind:f.A.PAGES_API,page:"/api/procurement/boq",pathname:"/api/procurement/boq",bundlePath:"",filename:""},userland:i,distDir:".next",relativeProjectDir:""});async function m(a,b,c){let d=await p.prepare(a,b,{srcPage:"/api/procurement/boq"});if(!d){b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve());return}let{query:f,params:g,prerenderManifest:h,routerServerContext:i}=d;try{let c=a.method||"GET",d=(0,j.getTracer)(),e=d.getActiveScopeSpan(),l=p.instrumentationOnRequestError.bind(p),m=async e=>p.render(a,b,{query:{...f,...g},params:g,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:h.preview,propagateError:!1,dev:p.isDev,page:"/api/procurement/boq",internalRevalidate:null==i?void 0:i.revalidate,onError:(...b)=>l(a,...b)}).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let f=d.getRootSpanAttributes();if(!f)return;if(f.get("next.span_type")!==k.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${f.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let g=f.get("next.route");if(g){let a=`${c} ${g}`;e.setAttributes({"next.route":g,"http.route":g,"next.span_name":a}),e.updateName(a)}else e.updateName(`${c} ${a.url}`)});e?await m(e):await d.withPropagatedContext(a.headers,()=>d.trace(k.BaseServerSpan.handleRequest,{spanName:`${c} ${a.url}`,kind:j.SpanKind.SERVER,attributes:{"http.method":c,"http.target":a.url}},m))}catch(a){if(p.isDev)throw a;(0,e.sendError)(b,500,"Internal Server Error")}finally{null==c.waitUntil||c.waitUntil.call(c,Promise.resolve())}}d()}catch(a){d(a)}})},75600:a=>{a.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")}};var b=require("../../../webpack-api-runtime.js");b.C(a);var c=b.X(0,[7169],()=>b(b.s=21679));module.exports=c})();