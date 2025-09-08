"use strict";(()=>{var a={};a.id=896,a.ids=[896],a.modules={10762:a=>{a.exports=import("@neondatabase/serverless")},13439:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{config:()=>o,default:()=>n,handler:()=>m});var e=c(29046),f=c(8667),g=c(33480),h=c(86435),i=c(75716),j=c(58112),k=c(18766),l=a([i]);i=(l.then?(await l)():l)[0];let n=(0,h.M)(i,"default"),o=(0,h.M)(i,"config"),p=new g.PagesAPIRouteModule({definition:{kind:f.A.PAGES_API,page:"/api/procurement/stock",pathname:"/api/procurement/stock",bundlePath:"",filename:""},userland:i,distDir:".next",relativeProjectDir:""});async function m(a,b,c){let d=await p.prepare(a,b,{srcPage:"/api/procurement/stock"});if(!d){b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve());return}let{query:f,params:g,prerenderManifest:h,routerServerContext:i}=d;try{let c=a.method||"GET",d=(0,j.getTracer)(),e=d.getActiveScopeSpan(),l=p.instrumentationOnRequestError.bind(p),m=async e=>p.render(a,b,{query:{...f,...g},params:g,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:h.preview,propagateError:!1,dev:p.isDev,page:"/api/procurement/stock",internalRevalidate:null==i?void 0:i.revalidate,onError:(...b)=>l(a,...b)}).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let f=d.getRootSpanAttributes();if(!f)return;if(f.get("next.span_type")!==k.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${f.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let g=f.get("next.route");if(g){let a=`${c} ${g}`;e.setAttributes({"next.route":g,"http.route":g,"next.span_name":a}),e.updateName(a)}else e.updateName(`${c} ${a.url}`)});e?await m(e):await d.withPropagatedContext(a.headers,()=>d.trace(k.BaseServerSpan.handleRequest,{spanName:`${c} ${a.url}`,kind:j.SpanKind.SERVER,attributes:{"http.method":c,"http.target":a.url}},m))}catch(a){if(p.isDev)throw a;(0,e.sendError)(b,500,"Internal Server Error")}finally{null==c.waitUntil||c.waitUntil.call(c,Promise.resolve())}}d()}catch(a){d(a)}})},75600:a=>{a.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},75716:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{default:()=>g});var e=c(10762),f=a([e]);e=(f.then?(await f)():f)[0];let h=(0,e.neon)(process.env.DATABASE_URL);async function g(a,b){let{projectId:c}=a.query;if("GET"===a.method)try{let a,d=[];c&&"all"!==c?(a=await h`
          SELECT * FROM stock_positions 
          WHERE project_id = ${c}
          ORDER BY updated_at DESC
        `,d=await h`
          SELECT * FROM stock_movements 
          WHERE project_id = ${c}
          ORDER BY movement_date DESC
          LIMIT 10
        `):(a=await h`
          SELECT * FROM stock_positions 
          WHERE is_active = true
          ORDER BY updated_at DESC
          LIMIT 200
        `,d=await h`
          SELECT * FROM stock_movements
          ORDER BY movement_date DESC
          LIMIT 20
        `);let e=a.map(a=>({id:a.id,itemCode:a.item_code,name:a.item_name,description:a.description||"",category:a.category||"General",projectId:a.project_id,warehouse:a.warehouse_location||"Main Warehouse",location:a.bin_location||"",quantity:Number(a.available_quantity||0),unit:a.uom,minQuantity:Number(a.reorder_level||0),maxQuantity:Number(a.max_stock_level||0),unitCost:Number(a.average_unit_cost||0),totalValue:Number(a.total_value||0),supplier:"",lastRestocked:a.last_movement_date||new Date().toISOString(),status:a.stock_status||"in_stock",createdAt:a.created_at||new Date().toISOString(),updatedAt:a.updated_at||new Date().toISOString()})),f=e.filter(a=>"low"===a.status||"critical"===a.status||a.minQuantity>0&&a.quantity<=a.minQuantity),g=e.filter(a=>0===a.quantity||"out_of_stock"===a.status),i={recentMovements:d.length,lastMovementDate:d[0]?.movement_date||null,totalMovements:d.length};b.status(200).json({items:e,total:e.length,lowStock:f.length,outOfStock:g.length,movements:d.slice(0,10),stats:{totalValue:e.reduce((a,b)=>a+b.totalValue,0),categories:[...new Set(e.map(a=>a.category))],...i}})}catch(a){console.error("Error fetching stock items:",a),b.status(500).json({error:"Failed to fetch stock items"})}else if("POST"===a.method)try{let d=a.body,e=await h`
        INSERT INTO stock_positions (
          project_id, item_code, item_name, description, category, uom,
          available_quantity, on_hand_quantity, warehouse_location, bin_location,
          reorder_level, max_stock_level, average_unit_cost, total_value, stock_status, is_active
        )
        VALUES (
          ${d.projectId||c},
          ${d.itemCode||""},
          ${d.name},
          ${d.description||""},
          ${d.category||"General"},
          ${d.unit},
          ${d.quantity||0},
          ${d.quantity||0},
          ${d.warehouse||"Main Warehouse"},
          ${d.location||""},
          ${d.minQuantity||0},
          ${d.maxQuantity||0},
          ${d.unitCost||0},
          ${d.totalValue||0},
          ${d.status||"in_stock"},
          true
        )
        RETURNING *
      `;b.status(201).json({message:"Stock item added successfully",item:e[0]})}catch(a){console.error("Error adding stock item:",a),b.status(500).json({error:"Failed to add stock item"})}else b.status(405).json({error:"Method not allowed"})}d()}catch(a){d(a)}})}};var b=require("../../../webpack-api-runtime.js");b.C(a);var c=b.X(0,[7169],()=>b(b.s=13439));module.exports=c})();