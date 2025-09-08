"use strict";(()=>{var a={};a.id=6360,a.ids=[6360],a.modules={10762:a=>{a.exports=import("@neondatabase/serverless")},23847:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{config:()=>o,default:()=>n,handler:()=>m});var e=c(29046),f=c(8667),g=c(33480),h=c(86435),i=c(63536),j=c(58112),k=c(18766),l=a([i]);i=(l.then?(await l)():l)[0];let n=(0,h.M)(i,"default"),o=(0,h.M)(i,"config"),p=new g.PagesAPIRouteModule({definition:{kind:f.A.PAGES_API,page:"/api/sow",pathname:"/api/sow",bundlePath:"",filename:""},userland:i,distDir:".next",relativeProjectDir:""});async function m(a,b,c){let d=await p.prepare(a,b,{srcPage:"/api/sow"});if(!d){b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve());return}let{query:f,params:g,prerenderManifest:h,routerServerContext:i}=d;try{let c=a.method||"GET",d=(0,j.getTracer)(),e=d.getActiveScopeSpan(),l=p.instrumentationOnRequestError.bind(p),m=async e=>p.render(a,b,{query:{...f,...g},params:g,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:h.preview,propagateError:!1,dev:p.isDev,page:"/api/sow",internalRevalidate:null==i?void 0:i.revalidate,onError:(...b)=>l(a,...b)}).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let f=d.getRootSpanAttributes();if(!f)return;if(f.get("next.span_type")!==k.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${f.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let g=f.get("next.route");if(g){let a=`${c} ${g}`;e.setAttributes({"next.route":g,"http.route":g,"next.span_name":a}),e.updateName(a)}else e.updateName(`${c} ${a.url}`)});e?await m(e):await d.withPropagatedContext(a.headers,()=>d.trace(k.BaseServerSpan.handleRequest,{spanName:`${c} ${a.url}`,kind:j.SpanKind.SERVER,attributes:{"http.method":c,"http.target":a.url}},m))}catch(a){if(p.isDev)throw a;(0,e.sendError)(b,500,"Internal Server Error")}finally{null==c.waitUntil||c.waitUntil.call(c,Promise.resolve())}}d()}catch(a){d(a)}})},63536:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{default:()=>h});var e=c(81761),f=c(10762),g=a([f]);f=(g.then?(await g)():g)[0];let o=(0,f.neon)(process.env.DATABASE_URL);async function h(a,b){let{userId:c}=(0,e.x)(a);if(!c)return b.status(401).json({success:!1,data:null,message:"Unauthorized"});try{let{action:c,projectId:d}=a.query;switch(a.method){case"GET":if(d&&!c)return await i(a,b,d);return b.status(400).json({success:!1,data:null,error:"Invalid GET request"});case"POST":if(!c)return b.status(400).json({success:!1,data:null,error:"Action required for POST requests"});switch(c){case"initialize":return await k(a,b);case"poles":return await l(a,b);case"drops":return await m(a,b);case"fibre":return await n(a,b);default:return b.status(400).json({success:!1,data:null,error:"Invalid action"})}default:return b.setHeader("Allow",["GET","POST"]),b.status(405).json({success:!1,data:null,message:`Method ${a.method} not allowed`})}}catch(a){return console.error("SOW API Error:",a),b.status(500).json({success:!1,data:null,error:"Internal server error"})}}async function i(a,b,c){try{await j();let[a,d,e]=await Promise.all([o`SELECT * FROM sow_poles WHERE project_id = ${c}::uuid ORDER BY created_at DESC`,o`SELECT * FROM sow_drops WHERE project_id = ${c}::uuid ORDER BY created_at DESC`,o`SELECT * FROM sow_fibre WHERE project_id = ${c}::uuid ORDER BY created_at DESC`]);return b.status(200).json({success:!0,data:{poles:a||[],drops:d||[],fibre:e||[],summary:{totalPoles:a?.length||0,totalDrops:d?.length||0,totalFibre:e?.length||0}}})}catch(a){return console.error("Error fetching SOW data:",a),b.status(500).json({success:!1,data:null,error:"Failed to fetch SOW data"})}}async function j(){await o`
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
    )`,await o`
    CREATE TABLE IF NOT EXISTS sow_drops (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID,
      drop_number VARCHAR(255) NOT NULL,
      address VARCHAR(500),
      drop_type VARCHAR(100),
      cable_length DECIMAL(10,2),
      cable_type VARCHAR(100),
      customer_name VARCHAR(255),
      customer_phone VARCHAR(20),
      latitude DECIMAL(10,8),
      longitude DECIMAL(11,8),
      status VARCHAR(50) DEFAULT 'pending',
      installation_date DATE,
      installed_by VARCHAR(255),
      tested BOOLEAN DEFAULT FALSE,
      test_date DATE,
      test_results JSONB DEFAULT '{}',
      notes TEXT,
      photos JSONB DEFAULT '[]',
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,await o`
    CREATE TABLE IF NOT EXISTS sow_fibre (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID,
      cable_id VARCHAR(255) NOT NULL,
      cable_type VARCHAR(100),
      cable_size VARCHAR(50),
      fiber_count INTEGER,
      start_location VARCHAR(255),
      end_location VARCHAR(255),
      start_latitude DECIMAL(10,8),
      start_longitude DECIMAL(11,8),
      end_latitude DECIMAL(10,8),
      end_longitude DECIMAL(11,8),
      length DECIMAL(10,2),
      installation_method VARCHAR(100),
      status VARCHAR(50) DEFAULT 'pending',
      installation_date DATE,
      installed_by VARCHAR(255),
      splicing_complete BOOLEAN DEFAULT FALSE,
      splicing_date DATE,
      testing_complete BOOLEAN DEFAULT FALSE,
      test_date DATE,
      test_results JSONB DEFAULT '{}',
      notes TEXT,
      route_map JSONB DEFAULT '[]',
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`}async function k(a,b){try{let{projectId:c}=a.body;if(!c)return b.status(400).json({success:!1,data:null,error:"Project ID required"});return await o`
      CREATE TABLE IF NOT EXISTS sow_poles (
        id SERIAL PRIMARY KEY,
        project_id VARCHAR(255) NOT NULL,
        pole_number VARCHAR(255),
        location VARCHAR(255),
        pole_type VARCHAR(100),
        height DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,await o`
      CREATE TABLE IF NOT EXISTS sow_drops (
        id SERIAL PRIMARY KEY,
        project_id VARCHAR(255) NOT NULL,
        drop_number VARCHAR(255),
        address VARCHAR(500),
        drop_type VARCHAR(100),
        cable_length DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,await o`
      CREATE TABLE IF NOT EXISTS sow_fibre (
        id SERIAL PRIMARY KEY,
        project_id VARCHAR(255) NOT NULL,
        cable_id VARCHAR(255),
        start_location VARCHAR(255),
        end_location VARCHAR(255),
        cable_type VARCHAR(100),
        length DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,b.status(200).json({success:!0,data:null,message:"Tables initialized successfully"})}catch(a){return console.error("Error initializing tables:",a),b.status(500).json({success:!1,data:null,error:"Failed to initialize tables"})}}async function l(a,b){try{let{projectId:c,poles:d}=a.body;if(!c||!Array.isArray(d))return b.status(400).json({success:!1,data:null,error:"Project ID and poles array required"});await j();let e=[];for(let a of d){let b=await o`
        INSERT INTO sow_poles (project_id, pole_number, location, pole_type, height, status)
        VALUES (${c}::uuid, ${a.pole_number}, ${a.location}, ${a.pole_type}, ${a.height}, ${a.status||"pending"})
        RETURNING *
      `;e.push(b[0])}return b.status(201).json({success:!0,data:e,message:`${e.length} poles uploaded`})}catch(a){return console.error("Error uploading poles:",a),b.status(500).json({success:!1,data:null,error:"Failed to upload poles"})}}async function m(a,b){try{let{projectId:c,drops:d}=a.body;if(!c||!Array.isArray(d))return b.status(400).json({success:!1,data:null,error:"Project ID and drops array required"});await j();let e=[];for(let a of d){let b=await o`
        INSERT INTO sow_drops (project_id, drop_number, address, drop_type, cable_length, status)
        VALUES (${c}::uuid, ${a.drop_number}, ${a.address}, ${a.drop_type}, ${a.cable_length}, ${a.status||"pending"})
        RETURNING *
      `;e.push(b[0])}return b.status(201).json({success:!0,data:e,message:`${e.length} drops uploaded`})}catch(a){return console.error("Error uploading drops:",a),b.status(500).json({success:!1,data:null,error:"Failed to upload drops"})}}async function n(a,b){try{let{projectId:c,fibre:d}=a.body;if(!c||!Array.isArray(d))return b.status(400).json({success:!1,data:null,error:"Project ID and fibre array required"});await j();let e=[];for(let a of d){let b=await o`
        INSERT INTO sow_fibre (project_id, cable_id, start_location, end_location, cable_type, length, status)
        VALUES (${c}::uuid, ${a.cable_id}, ${a.start_location}, ${a.end_location}, ${a.cable_type}, ${a.length}, ${a.status||"pending"})
        RETURNING *
      `;e.push(b[0])}return b.status(201).json({success:!0,data:e,message:`${e.length} fibre cables uploaded`})}catch(a){return console.error("Error uploading fibre:",a),b.status(500).json({success:!1,data:null,error:"Failed to upload fibre"})}}d()}catch(a){d(a)}})},75600:a=>{a.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},81761:(a,b,c)=>{c.d(b,{x:()=>d});function d(a){return{userId:"demo-user-123",sessionId:"demo-session",user:{id:"demo-user-123",email:"demo@fibreflow.com",name:"Demo User",role:"admin"}}}}};var b=require("../../webpack-api-runtime.js");b.C(a);var c=b.X(0,[7169],()=>b(b.s=23847));module.exports=c})();