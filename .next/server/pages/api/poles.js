"use strict";(()=>{var a={};a.id=2968,a.ids=[2968],a.modules={10762:a=>{a.exports=import("@neondatabase/serverless")},15984:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{default:()=>h});var e=c(81761),f=c(10762),g=a([f]);f=(g.then?(await g)():g)[0];let n=(0,f.neon)(process.env.DATABASE_URL||"postgresql://neondb_owner:npg_jUJCNFiG38aY@ep-mute-brook-a99vppmn-pooler.gwc.azure.neon.tech/neondb?sslmode=require");async function h(a,b){let{userId:c}=(0,e.x)(a);if(!c)return b.status(401).json({success:!1,data:null,message:"Unauthorized"});try{switch(a.method){case"GET":return await i(a,b);case"POST":return await j(a,b);case"PUT":return await k(a,b);case"DELETE":return await l(a,b);default:return b.setHeader("Allow",["GET","POST","PUT","DELETE"]),b.status(405).json({success:!1,data:null,message:`Method ${a.method} not allowed`})}}catch(a){return console.error("Poles API Error:",a),b.status(500).json({success:!1,data:null,error:"Internal server error"})}}async function i(a,b){try{let{projectId:c,id:d,status:e,page:f="1",pageSize:g="50",search:h}=a.query;if(await m(),d){let a=await n`
        SELECT p.*, pr.project_name, pr.project_code
        FROM sow_poles p
        LEFT JOIN projects pr ON p.project_id = pr.id
        WHERE p.id = ${d}::uuid
      `;if(0===a.length)return b.status(404).json({success:!1,data:null,message:"Pole not found"});return b.status(200).json({success:!0,data:a[0]})}let i=[],j=[];c&&(i.push(`p.project_id = $${j.length+1}::uuid`),j.push(c)),e&&(i.push(`p.status = $${j.length+1}`),j.push(e)),h&&(i.push(`(p.pole_number ILIKE $${j.length+1} OR p.location ILIKE $${j.length+1})`),j.push(`%${h}%`));let k=i.length>0?`WHERE ${i.join(" AND ")}`:"",l=(parseInt(f)-1)*parseInt(g),o=`SELECT COUNT(*) FROM sow_poles p ${k}`,[p]=await n.unsafe(o,j),q=parseInt(p.count),r=`
      SELECT p.*, pr.project_name, pr.project_code
      FROM sow_poles p
      LEFT JOIN projects pr ON p.project_id = pr.id
      ${k}
      ORDER BY p.created_at DESC
      LIMIT ${g}
      OFFSET ${l}
    `,s=await n.unsafe(r,j);return b.status(200).json({success:!0,data:s,total:q,page:parseInt(f),pageSize:parseInt(g)})}catch(a){return console.error("Error fetching poles:",a),b.status(500).json({success:!1,data:null,error:"Failed to fetch poles"})}}async function j(a,b){try{let c=a.body;if(!c.project_id||!c.pole_number)return b.status(400).json({success:!1,data:null,error:"Project ID and pole number are required"});await m();let d=await n`
      INSERT INTO sow_poles (
        project_id, pole_number, location, pole_type, height,
        latitude, longitude, status, installation_date, installed_by,
        inspection_status, inspection_date, notes, photos, metadata
      )
      VALUES (
        ${c.project_id}::uuid, ${c.pole_number}, ${c.location},
        ${c.pole_type}, ${c.height}, ${c.latitude},
        ${c.longitude}, ${c.status||"pending"}, ${c.installation_date},
        ${c.installed_by}, ${c.inspection_status}, ${c.inspection_date},
        ${c.notes}, ${JSON.stringify(c.photos||[])}, 
        ${JSON.stringify(c.metadata||{})}
      )
      RETURNING *
    `;return b.status(201).json({success:!0,data:d[0]})}catch(a){return console.error("Error creating pole:",a),b.status(500).json({success:!1,data:null,error:"Failed to create pole"})}}async function k(a,b){try{let{id:c}=a.query,d=a.body;if(!c)return b.status(400).json({success:!1,data:null,error:"Pole ID required"});await m();let e=await n`
      UPDATE sow_poles SET
        pole_number = COALESCE(${d.pole_number}, pole_number),
        location = COALESCE(${d.location}, location),
        pole_type = COALESCE(${d.pole_type}, pole_type),
        height = COALESCE(${d.height}, height),
        latitude = COALESCE(${d.latitude}, latitude),
        longitude = COALESCE(${d.longitude}, longitude),
        status = COALESCE(${d.status}, status),
        installation_date = COALESCE(${d.installation_date}, installation_date),
        installed_by = COALESCE(${d.installed_by}, installed_by),
        inspection_status = COALESCE(${d.inspection_status}, inspection_status),
        inspection_date = COALESCE(${d.inspection_date}, inspection_date),
        notes = COALESCE(${d.notes}, notes),
        photos = COALESCE(${JSON.stringify(d.photos)}, photos),
        metadata = COALESCE(${JSON.stringify(d.metadata)}, metadata),
        updated_at = NOW()
      WHERE id = ${c}::uuid
      RETURNING *
    `;if(0===e.length)return b.status(404).json({success:!1,data:null,message:"Pole not found"});return b.status(200).json({success:!0,data:e[0]})}catch(a){return console.error("Error updating pole:",a),b.status(500).json({success:!1,data:null,error:"Failed to update pole"})}}async function l(a,b){try{let{id:c}=a.query;if(!c)return b.status(400).json({success:!1,data:null,error:"Pole ID required"});return await n`DELETE FROM sow_poles WHERE id = ${c}::uuid`,b.status(200).json({success:!0,data:null,message:"Pole deleted successfully"})}catch(a){return console.error("Error deleting pole:",a),b.status(500).json({success:!1,data:null,error:"Failed to delete pole"})}}async function m(){await n`
    CREATE TABLE IF NOT EXISTS sow_poles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID,
      pole_number VARCHAR(255) NOT NULL,
      location VARCHAR(500),
      pole_type VARCHAR(100),
      height DECIMAL(10,2),
      latitude DECIMAL(10,8),
      longitude DECIMAL(11,8),
      status VARCHAR(50) DEFAULT 'pending',
      installation_date DATE,
      installed_by VARCHAR(255),
      inspection_status VARCHAR(50),
      inspection_date DATE,
      notes TEXT,
      photos JSONB DEFAULT '[]',
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,await n`CREATE INDEX IF NOT EXISTS idx_sow_poles_project ON sow_poles(project_id)`,await n`CREATE INDEX IF NOT EXISTS idx_sow_poles_status ON sow_poles(status)`,await n`CREATE INDEX IF NOT EXISTS idx_sow_poles_number ON sow_poles(pole_number)`}d()}catch(a){d(a)}})},73935:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{config:()=>o,default:()=>n,handler:()=>m});var e=c(29046),f=c(8667),g=c(33480),h=c(86435),i=c(15984),j=c(58112),k=c(18766),l=a([i]);i=(l.then?(await l)():l)[0];let n=(0,h.M)(i,"default"),o=(0,h.M)(i,"config"),p=new g.PagesAPIRouteModule({definition:{kind:f.A.PAGES_API,page:"/api/poles",pathname:"/api/poles",bundlePath:"",filename:""},userland:i,distDir:".next",relativeProjectDir:""});async function m(a,b,c){let d=await p.prepare(a,b,{srcPage:"/api/poles"});if(!d){b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve());return}let{query:f,params:g,prerenderManifest:h,routerServerContext:i}=d;try{let c=a.method||"GET",d=(0,j.getTracer)(),e=d.getActiveScopeSpan(),l=p.instrumentationOnRequestError.bind(p),m=async e=>p.render(a,b,{query:{...f,...g},params:g,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:h.preview,propagateError:!1,dev:p.isDev,page:"/api/poles",internalRevalidate:null==i?void 0:i.revalidate,onError:(...b)=>l(a,...b)}).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let f=d.getRootSpanAttributes();if(!f)return;if(f.get("next.span_type")!==k.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${f.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let g=f.get("next.route");if(g){let a=`${c} ${g}`;e.setAttributes({"next.route":g,"http.route":g,"next.span_name":a}),e.updateName(a)}else e.updateName(`${c} ${a.url}`)});e?await m(e):await d.withPropagatedContext(a.headers,()=>d.trace(k.BaseServerSpan.handleRequest,{spanName:`${c} ${a.url}`,kind:j.SpanKind.SERVER,attributes:{"http.method":c,"http.target":a.url}},m))}catch(a){if(p.isDev)throw a;(0,e.sendError)(b,500,"Internal Server Error")}finally{null==c.waitUntil||c.waitUntil.call(c,Promise.resolve())}}d()}catch(a){d(a)}})},75600:a=>{a.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},81761:(a,b,c)=>{c.d(b,{x:()=>d});function d(a){return{userId:"demo-user-123",sessionId:"demo-session",user:{id:"demo-user-123",email:"demo@fibreflow.com",name:"Demo User",role:"admin"}}}}};var b=require("../../webpack-api-runtime.js");b.C(a);var c=b.X(0,[7169],()=>b(b.s=73935));module.exports=c})();