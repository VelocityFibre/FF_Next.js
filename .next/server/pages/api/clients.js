"use strict";(()=>{var a={};a.id=9965,a.ids=[9965],a.modules={10762:a=>{a.exports=import("@neondatabase/serverless")},17516:(a,b,c)=>{c.d(b,{Pi:()=>f,rI:()=>g});class d extends Error{constructor(a,b){super(a),this.originalError=b,this.name="DatabaseError"}}async function e(a,b){let{fallbackData:c,logError:e=!0,retryCount:f=1,timeout:g=3e4}=b;for(let b=0;b<=f;b++)try{let b=new Promise((a,b)=>{setTimeout(()=>{b(new d(`Database query timed out after ${g}ms`))},g)});return await Promise.race([a(),b])}catch(a){e&&console.error(`Database query failed (attempt ${b+1}/${f+1}):`,a),b<f&&await new Promise(a=>setTimeout(a,1e3*Math.pow(2,b)))}return e&&console.warn("All database query attempts failed. Returning fallback data."),c}async function f(a,b){return e(a,{...b,fallbackData:[]})}async function g(a,b){try{let c=await e(a,{...b,fallbackData:void 0,logError:b?.logError??!0});if(void 0===c)return{success:!1,error:"Database mutation failed after all retry attempts"};return{success:!0,data:c}}catch(a){return{success:!1,error:a instanceof Error?a.message:"Unknown error occurred"}}}},24345:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{default:()=>i});var e=c(86669),f=c(17516),g=c(75880),h=a([e]);async function i(a,b){if(b.setHeader("Access-Control-Allow-Credentials","true"),b.setHeader("Access-Control-Allow-Origin","*"),b.setHeader("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,OPTIONS"),b.setHeader("Access-Control-Allow-Headers","X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"),"OPTIONS"===a.method)return void b.status(200).end();try{switch(a.method){case"GET":let{id:c,status:d,search:g}=a.query;if(c){let a=await (0,f.Pi)(async()=>(0,e.ll)`
              SELECT 
                c.*,
                COUNT(DISTINCT p.id) as project_count,
                COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_projects,
                SUM(p.budget) as total_budget,
                JSON_AGG(
                  DISTINCT JSONB_BUILD_OBJECT(
                    'id', p.id,
                    'project_name', p.project_name,
                    'status', p.status,
                    'start_date', p.start_date,
                    'end_date', p.end_date,
                    'budget', p.budget
                  )
                ) FILTER (WHERE p.id IS NOT NULL) as projects
              FROM clients c
              LEFT JOIN projects p ON p.client_id = c.id::text::uuid
              WHERE c.id = ${c}
              GROUP BY c.id
            `,{logError:!0});if(0===a.length)return b.status(404).json({success:!1,data:null,message:"Client not found"});b.status(200).json({success:!0,data:a[0]})}else{let a=await (0,f.Pi)(async()=>g&&d?(0,e.ll)`
                  SELECT 
                    c.*,
                    COUNT(DISTINCT p.id) as project_count,
                    COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_projects,
                    SUM(p.budget) as total_revenue
                  FROM clients c
                  LEFT JOIN projects p ON p.client_id = c.id::text::uuid
                  WHERE (
                    LOWER(c.client_name) LIKE LOWER(${"%"+g+"%"}) OR 
                    LOWER(c.contact_person) LIKE LOWER(${"%"+g+"%"}) OR 
                    LOWER(c.email) LIKE LOWER(${"%"+g+"%"})
                  ) AND c.status = ${d}
                  GROUP BY c.id
                  ORDER BY c.client_name ASC NULLS LAST
                `:g?(0,e.ll)`
                  SELECT 
                    c.*,
                    COUNT(DISTINCT p.id) as project_count,
                    COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_projects,
                    SUM(p.budget) as total_revenue
                  FROM clients c
                  LEFT JOIN projects p ON p.client_id = c.id::text::uuid
                  WHERE (
                    LOWER(c.client_name) LIKE LOWER(${"%"+g+"%"}) OR 
                    LOWER(c.contact_person) LIKE LOWER(${"%"+g+"%"}) OR 
                    LOWER(c.email) LIKE LOWER(${"%"+g+"%"})
                  )
                  GROUP BY c.id
                  ORDER BY c.client_name ASC NULLS LAST
                `:d?(0,e.ll)`
                  SELECT 
                    c.*,
                    COUNT(DISTINCT p.id) as project_count,
                    COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_projects,
                    SUM(p.budget) as total_revenue
                  FROM clients c
                  LEFT JOIN projects p ON p.client_id = c.id::text::uuid
                  WHERE c.status = ${d}
                  GROUP BY c.id
                  ORDER BY c.client_name ASC NULLS LAST
                `:(0,e.ll)`
                  SELECT 
                    c.*,
                    COUNT(DISTINCT p.id) as project_count,
                    COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_projects,
                    SUM(p.budget) as total_revenue
                  FROM clients c
                  LEFT JOIN projects p ON p.client_id = c.id::text::uuid
                  GROUP BY c.id
                  ORDER BY c.client_name ASC NULLS LAST
                `,{logError:!0,retryCount:2});b.status(200).json({success:!0,data:a||[],message:0===a.length?"No clients found":void 0})}break;case"POST":let h=a.body,i=await (0,e.ll)`
          INSERT INTO clients (
            client_code, client_name, contact_person, email, phone,
            address, city, state, country, status
          )
          VALUES (
            ${h.client_code||h.clientCode||`CLI-${Date.now()}`},
            ${h.client_name||h.clientName||h.name||h.company_name},
            ${h.contact_person||h.contactPerson||null},
            ${h.email||null},
            ${h.phone||null},
            ${h.address||null},
            ${h.city||null},
            ${h.state||null},
            ${h.country||"South Africa"},
            ${h.status||"active"}
          )
          RETURNING *
        `;b.status(201).json({success:!0,data:i[0]});break;case"PUT":if(!a.query.id)return b.status(400).json({success:!1,error:"Client ID required"});let j=a.body,k=await (0,e.ll)`
          UPDATE clients 
          SET 
              client_name = COALESCE(${j.client_name||j.clientName||j.name||j.company_name}, client_name),
              contact_person = COALESCE(${j.contact_person||j.contactPerson}, contact_person),
              email = COALESCE(${j.email}, email),
              phone = COALESCE(${j.phone}, phone),
              address = COALESCE(${j.address}, address),
              city = COALESCE(${j.city}, city),
              state = COALESCE(${j.state}, state),
              country = COALESCE(${j.country}, country),
              status = COALESCE(${j.status}, status),
              updated_at = NOW()
          WHERE id = ${a.query.id}
          RETURNING *
        `;if(0===k.length)return b.status(404).json({success:!1,error:"Client not found"});b.status(200).json({success:!0,data:k[0]});break;case"DELETE":if(!a.query.id)return b.status(400).json({success:!1,error:"Client ID required"});await (0,e.ll)`DELETE FROM clients WHERE id = ${a.query.id}`,b.status(200).json({success:!0,message:"Client deleted successfully"});break;default:b.status(405).json({success:!1,error:"Method not allowed"})}}catch(c){g.XU.error({error:c,method:a.method,path:"/api/clients"},"Client API request failed"),b.status(500).json({success:!1,error:c.message})}}e=(h.then?(await h)():h)[0],d()}catch(a){d(a)}})},38525:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{config:()=>o,default:()=>n,handler:()=>m});var e=c(29046),f=c(8667),g=c(33480),h=c(86435),i=c(24345),j=c(58112),k=c(18766),l=a([i]);i=(l.then?(await l)():l)[0];let n=(0,h.M)(i,"default"),o=(0,h.M)(i,"config"),p=new g.PagesAPIRouteModule({definition:{kind:f.A.PAGES_API,page:"/api/clients",pathname:"/api/clients",bundlePath:"",filename:""},userland:i,distDir:".next",relativeProjectDir:""});async function m(a,b,c){let d=await p.prepare(a,b,{srcPage:"/api/clients"});if(!d){b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve());return}let{query:f,params:g,prerenderManifest:h,routerServerContext:i}=d;try{let c=a.method||"GET",d=(0,j.getTracer)(),e=d.getActiveScopeSpan(),l=p.instrumentationOnRequestError.bind(p),m=async e=>p.render(a,b,{query:{...f,...g},params:g,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:h.preview,propagateError:!1,dev:p.isDev,page:"/api/clients",internalRevalidate:null==i?void 0:i.revalidate,onError:(...b)=>l(a,...b)}).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let f=d.getRootSpanAttributes();if(!f)return;if(f.get("next.span_type")!==k.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${f.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let g=f.get("next.route");if(g){let a=`${c} ${g}`;e.setAttributes({"next.route":g,"http.route":g,"next.span_name":a}),e.updateName(a)}else e.updateName(`${c} ${a.url}`)});e?await m(e):await d.withPropagatedContext(a.headers,()=>d.trace(k.BaseServerSpan.handleRequest,{spanName:`${c} ${a.url}`,kind:j.SpanKind.SERVER,attributes:{"http.method":c,"http.target":a.url}},m))}catch(a){if(p.isDev)throw a;(0,e.sendError)(b,500,"Internal Server Error")}finally{null==c.waitUntil||c.waitUntil.call(c,Promise.resolve())}}d()}catch(a){d(a)}})},74552:a=>{a.exports=require("pino")},75600:a=>{a.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},75880:(a,b,c)=>{c.d(b,{XU:()=>g});let d=void 0!==globalThis.EdgeRuntime?null:c(74552),e=d({level:(()=>{let a=process.env.LOG_LEVEL?.toLowerCase()||"info";return["fatal","error","warn","info","debug","trace","silent"].includes(a)?a:"info"})(),formatters:{level:a=>({level:a}),bindings:a=>({pid:a.pid,host:a.hostname,env:"production"})},redact:{paths:["password","token","secret","apiKey","api_key","authorization","cookie","sessionId","session_id","creditCard","credit_card","ssn","socialSecurity","social_security","bankAccount","bank_account","privateKey","private_key","clientSecret","client_secret","refreshToken","refresh_token","accessToken","access_token","idToken","id_token"].flatMap(a=>[a,`*.${a}`,`*.*.${a}`,`req.headers.${a}`,`res.headers.${a}`,`error.${a}`,`err.${a}`]),censor:"[REDACTED]"},timestamp:d.stdTimeFunctions.isoTime,messageKey:"msg",errorKey:"error",...{}}),f=a=>e.child({module:a}),g=f("api");f("database"),f("auth"),f("sow"),f("script"),f("migration"),f("analytics"),f("procurement"),f("field-ops")},86669:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{ll:()=>i});var e=c(10762),f=a([e]);e=(f.then?(await f)():f)[0];let g=Number(process.env.NEON_POOL_QUERY_LIMIT||10);!Number.isNaN(g)&&g>0&&(e.neonConfig.poolQueryLimit=g);let h="__FF_NEON_SQL__",i=function(){let a=globalThis;return a[h]||(a[h]=function(){let a=process.env.DATABASE_URL;if(!a)throw Error("DATABASE_URL is not set. Please configure it in your environment.");return(0,e.neon)(a)}()),a[h]}();d()}catch(a){d(a)}})}};var b=require("../../webpack-api-runtime.js");b.C(a);var c=b.X(0,[7169],()=>b(b.s=38525));module.exports=c})();