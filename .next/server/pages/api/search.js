"use strict";(()=>{var a={};a.id=9395,a.ids=[9395],a.modules={51545:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{config:()=>o,default:()=>n,handler:()=>m});var e=c(29046),f=c(8667),g=c(33480),h=c(86435),i=c(81045),j=c(58112),k=c(18766),l=a([i]);i=(l.then?(await l)():l)[0];let n=(0,h.M)(i,"default"),o=(0,h.M)(i,"config"),p=new g.PagesAPIRouteModule({definition:{kind:f.A.PAGES_API,page:"/api/search",pathname:"/api/search",bundlePath:"",filename:""},userland:i,distDir:".next",relativeProjectDir:""});async function m(a,b,c){let d=await p.prepare(a,b,{srcPage:"/api/search"});if(!d){b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve());return}let{query:f,params:g,prerenderManifest:h,routerServerContext:i}=d;try{let c=a.method||"GET",d=(0,j.getTracer)(),e=d.getActiveScopeSpan(),l=p.instrumentationOnRequestError.bind(p),m=async e=>p.render(a,b,{query:{...f,...g},params:g,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:h.preview,propagateError:!1,dev:p.isDev,page:"/api/search",internalRevalidate:null==i?void 0:i.revalidate,onError:(...b)=>l(a,...b)}).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let f=d.getRootSpanAttributes();if(!f)return;if(f.get("next.span_type")!==k.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${f.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let g=f.get("next.route");if(g){let a=`${c} ${g}`;e.setAttributes({"next.route":g,"http.route":g,"next.span_name":a}),e.updateName(a)}else e.updateName(`${c} ${a.url}`)});e?await m(e):await d.withPropagatedContext(a.headers,()=>d.trace(k.BaseServerSpan.handleRequest,{spanName:`${c} ${a.url}`,kind:j.SpanKind.SERVER,attributes:{"http.method":c,"http.target":a.url}},m))}catch(a){if(p.isDev)throw a;(0,e.sendError)(b,500,"Internal Server Error")}finally{null==c.waitUntil||c.waitUntil.call(c,Promise.resolve())}}d()}catch(a){d(a)}})},64939:a=>{a.exports=import("pg")},75600:a=>{a.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},81045:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{default:()=>g});var e=c(64939),f=a([e]);e=(f.then?(await f)():f)[0];let h=process.env.DATABASE_URL||"postgresql://neondb_owner:npg_jUJCNFiG38aY@ep-mute-brook-a99vppmn-pooler.gwc.azure.neon.tech/neondb?sslmode=require";async function g(a,b){if("GET"!==a.method)return b.status(405).json({error:"Method not allowed"});let c=new e.Client({connectionString:h});try{let{q:d,type:e="all",limit:f=20}=a.query;if(!d||"string"!=typeof d)return b.status(400).json({error:"Search query is required"});await c.connect();let g=await c.query("SELECT * FROM global_search($1, $2)",[d,parseInt(f)||20]),h=await c.query(`
      SELECT search_term, search_count 
      FROM popular_searches 
      WHERE search_term ILIKE $1 
      ORDER BY search_count DESC 
      LIMIT 5
    `,[`%${d}%`]),i=await c.query(`
      SELECT DISTINCT suggestion_text, suggestion_type
      FROM autocomplete_suggestions
      WHERE suggestion_text ILIKE $1
      ORDER BY usage_count DESC
      LIMIT 10
    `,[`${d}%`]);c.query(`
      INSERT INTO search_history (
        user_id, search_query, search_type, 
        result_count, search_duration_ms, created_at
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
    `,[a.headers["x-user-id"]||null,d,e,g.rows.length,50]).catch(a=>console.error("Failed to record search:",a)),c.query(`
      INSERT INTO popular_searches (search_term, search_count, category, last_searched)
      VALUES ($1, 1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (search_term, category) 
      DO UPDATE SET 
        search_count = popular_searches.search_count + 1,
        last_searched = CURRENT_TIMESTAMP
    `,[d,e]).catch(a=>console.error("Failed to update popular searches:",a));let j={success:!0,query:d,results:g.rows.map(a=>({type:a.result_type,id:a.result_id,title:a.result_title,description:a.result_description||"",relevance:a.relevance})),suggestions:i.rows.map(a=>a.suggestion_text),popular:h.rows.map(a=>a.search_term),total:g.rows.length};return b.status(200).json(j)}catch(a){return console.error("Search error:",a),b.status(500).json({success:!1,error:a instanceof Error?a.message:"Search failed"})}finally{await c.end()}}d()}catch(a){d(a)}})}};var b=require("../../webpack-api-runtime.js");b.C(a);var c=b.X(0,[7169],()=>b(b.s=51545));module.exports=c})();