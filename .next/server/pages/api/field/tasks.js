"use strict";(()=>{var a={};a.id=486,a.ids=[486],a.modules={10762:a=>{a.exports=import("@neondatabase/serverless")},33462:(a,b,c)=>{c.d(b,{O4:()=>d,aI:()=>g});var d=function(a){return a.BAD_REQUEST="BAD_REQUEST",a.UNAUTHORIZED="UNAUTHORIZED",a.FORBIDDEN="FORBIDDEN",a.NOT_FOUND="NOT_FOUND",a.METHOD_NOT_ALLOWED="METHOD_NOT_ALLOWED",a.CONFLICT="CONFLICT",a.VALIDATION_ERROR="VALIDATION_ERROR",a.RATE_LIMIT="RATE_LIMIT",a.PAYLOAD_TOO_LARGE="PAYLOAD_TOO_LARGE",a.INTERNAL_ERROR="INTERNAL_ERROR",a.DATABASE_ERROR="DATABASE_ERROR",a.SERVICE_UNAVAILABLE="SERVICE_UNAVAILABLE",a.GATEWAY_TIMEOUT="GATEWAY_TIMEOUT",a.BUSINESS_RULE_VIOLATION="BUSINESS_RULE_VIOLATION",a.INSUFFICIENT_PERMISSIONS="INSUFFICIENT_PERMISSIONS",a.RESOURCE_LOCKED="RESOURCE_LOCKED",a.DEPENDENCY_ERROR="DEPENDENCY_ERROR",a}({});let e={BAD_REQUEST:400,UNAUTHORIZED:401,FORBIDDEN:403,NOT_FOUND:404,METHOD_NOT_ALLOWED:405,CONFLICT:409,VALIDATION_ERROR:422,RATE_LIMIT:429,PAYLOAD_TOO_LARGE:413,INTERNAL_ERROR:500,DATABASE_ERROR:500,SERVICE_UNAVAILABLE:503,GATEWAY_TIMEOUT:504,BUSINESS_RULE_VIOLATION:422,INSUFFICIENT_PERMISSIONS:403,RESOURCE_LOCKED:423,DEPENDENCY_ERROR:424};class f{static generateMeta(a){return{timestamp:new Date().toISOString(),...a}}static success(a,b,c,d=200,e){let f={success:!0,data:b,...c&&{message:c},meta:this.generateMeta(e)};a.status(d).json(f)}static created(a,b,c="Resource created successfully",d){this.success(a,b,c,201,d)}static noContent(a){a.status(204).end()}static paginated(a,b,c,d,e){let f=Math.ceil(c.total/c.pageSize),g={success:!0,data:b,pagination:{...c,totalPages:f},...d&&{message:d},meta:this.generateMeta(e)};a.status(200).json(g)}static error(a,b,c,d,f){let g=e[b]||500,h={success:!1,error:{code:b,message:c,...d&&{details:d}},meta:this.generateMeta(f)};a.status(g).json(h)}static validationError(a,b,c="Validation failed"){this.error(a,"VALIDATION_ERROR",c,b)}static notFound(a,b,c){let d=c?`${b} with identifier '${c}' not found`:`${b} not found`;this.error(a,"NOT_FOUND",d)}static unauthorized(a,b="Authentication required"){this.error(a,"UNAUTHORIZED",b)}static forbidden(a,b="You do not have permission to perform this action"){this.error(a,"FORBIDDEN",b)}static methodNotAllowed(a,b,c){a.setHeader("Allow",c.join(", ")),this.error(a,"METHOD_NOT_ALLOWED",`Method ${b} not allowed. Allowed methods: ${c.join(", ")}`)}static internalError(a,b,c="An internal error occurred"){console.error("Internal Server Error:",b);this.error(a,"INTERNAL_ERROR",c,void 0)}static databaseError(a,b,c="A database error occurred"){console.error("Database Error:",b);this.error(a,"DATABASE_ERROR",c,void 0)}static setCorsHeaders(a,b="*",c=["GET","POST","PUT","DELETE","PATCH","OPTIONS"],d=["Content-Type","Authorization"]){a.setHeader("Access-Control-Allow-Origin",b),a.setHeader("Access-Control-Allow-Methods",c.join(", ")),a.setHeader("Access-Control-Allow-Headers",d.join(", "))}static handleOptions(a){this.setCorsHeaders(a),a.status(200).end()}}let g={success:f.success,created:f.created,noContent:f.noContent,paginated:f.paginated,error:f.error,validationError:f.validationError,notFound:f.notFound,unauthorized:f.unauthorized,forbidden:f.forbidden,methodNotAllowed:f.methodNotAllowed,internalError:f.internalError,databaseError:f.databaseError,setCorsHeaders:f.setCorsHeaders,handleOptions:f.handleOptions}},66654:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{default:()=>h});var e=c(10762),f=c(33462),g=a([e]);e=(g.then?(await g)():g)[0];let i=(0,e.neon)(process.env.DATABASE_URL);async function h(a,b){if("GET"===a.method)try{let c,{technicianId:d,status:e,priority:g,dateFrom:h,dateTo:j,category:k,search:l,limit:m="100",offset:n="0"}=a.query;if(d||e||g||k||h||j||l){let a=`
          SELECT 
            t.*,
            u.first_name,
            u.last_name,
            p.name as project_name,
            p.location as project_location,
            p.latitude as project_latitude,
            p.longitude as project_longitude
          FROM tasks t
          LEFT JOIN users u ON t.assigned_to = u.id
          LEFT JOIN projects p ON t.project_id = p.id
          WHERE 1=1
        `;d&&(a+=` AND t.assigned_to = '${d}'`),e&&(a+=` AND t.status = '${e}'`),g&&(a+=` AND t.priority = '${g}'`),k&&(a+=` AND t.category = '${k}'`),h&&(a+=` AND t.due_date >= '${new Date(h).toISOString()}'`),j&&(a+=` AND t.due_date <= '${new Date(j).toISOString()}'`),l&&(a+=` AND (t.title ILIKE '%${l}%' OR t.description ILIKE '%${l}%')`),a+=`
          ORDER BY 
            CASE t.priority 
              WHEN 'urgent' THEN 1 
              WHEN 'high' THEN 2 
              WHEN 'medium' THEN 3 
              WHEN 'low' THEN 4 
              ELSE 5 
            END,
            t.created_at DESC
          LIMIT ${Number(m)}
          OFFSET ${Number(n)}
        `,c=await i.unsafe(a)}else c=await i`
          SELECT 
            t.*,
            u.first_name,
            u.last_name,
            p.name as project_name,
            p.location as project_location,
            p.latitude as project_latitude,
            p.longitude as project_longitude
          FROM tasks t
          LEFT JOIN users u ON t.assigned_to = u.id
          LEFT JOIN projects p ON t.project_id = p.id
          ORDER BY 
            CASE t.priority 
              WHEN 'urgent' THEN 1 
              WHEN 'high' THEN 2 
              WHEN 'medium' THEN 3 
              WHEN 'low' THEN 4 
              ELSE 5 
            END,
            t.created_at DESC
          LIMIT ${Number(m)}
          OFFSET ${Number(n)}
        `;let o=c.map(a=>{let b=a.metadata||{},c=b.location||{};return{id:a.id,title:a.title,description:a.description||"",type:a.category||"installation",priority:a.priority||"medium",status:a.status||"pending",assignedTo:a.assigned_to||"",technicianName:a.first_name&&a.last_name?`${a.first_name} ${a.last_name}`.trim():"Unassigned",location:{address:c.address||a.project_location||"No address specified",coordinates:c.latitude&&c.longitude?{lat:Number(c.latitude),lng:Number(c.longitude)}:a.project_latitude&&a.project_longitude?{lat:Number(a.project_latitude),lng:Number(a.project_longitude)}:{lat:-26.2041,lng:28.0473}},scheduledDate:a.start_date||a.due_date||new Date().toISOString(),estimatedDuration:a.estimated_hours?Number(a.estimated_hours):4,materials:b.equipment||[],syncStatus:b.syncStatus||"synced",offline:!!b.offlineEdits,notes:b.notes,photos:b.photos||[],customerInfo:b.customerInfo,workOrder:b.workOrder,qualityCheck:b.qualityCheck,createdAt:a.created_at||new Date().toISOString(),updatedAt:a.updated_at||new Date().toISOString()}}),p={totalTasks:o.length,pendingTasks:o.filter(a=>"pending"===a.status).length,inProgressTasks:o.filter(a=>"in_progress"===a.status).length,completedTasks:o.filter(a=>"completed"===a.status).length,highPriorityTasks:o.filter(a=>"high"===a.priority||"urgent"===a.priority).length},q=Number(a.query.page)||1,r=Number(m);return f.aI.paginated(b,o,{page:q,pageSize:r,total:o.length+Number(n)},void 0,{stats:p})}catch(a){return f.aI.databaseError(b,a,"Failed to fetch tasks")}if("POST"!==a.method)return f.aI.methodNotAllowed(b,a.method,["GET","POST"]);try{let c=a.body,d=c.taskCode||`TASK-${Date.now().toString().slice(-8)}`,e=await i`
        INSERT INTO tasks (
          task_code, title, description, status, priority,
          category, assigned_to, project_id, due_date,
          estimated_hours, metadata
        )
        VALUES (
          ${d},
          ${c.title},
          ${c.description||""},
          ${c.status||"pending"},
          ${c.priority||"medium"},
          ${c.type||c.category||"installation"},
          ${c.assignedTo||null},
          ${c.projectId||null},
          ${c.scheduledDate?new Date(c.scheduledDate):null},
          ${c.estimatedDuration||4},
          ${JSON.stringify(c.metadata||{})}
        )
        RETURNING *
      `;return f.aI.created(b,e[0],"Task created successfully")}catch(a){return f.aI.databaseError(b,a,"Failed to create task")}}d()}catch(a){d(a)}})},75600:a=>{a.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},82355:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{config:()=>o,default:()=>n,handler:()=>m});var e=c(29046),f=c(8667),g=c(33480),h=c(86435),i=c(66654),j=c(58112),k=c(18766),l=a([i]);i=(l.then?(await l)():l)[0];let n=(0,h.M)(i,"default"),o=(0,h.M)(i,"config"),p=new g.PagesAPIRouteModule({definition:{kind:f.A.PAGES_API,page:"/api/field/tasks",pathname:"/api/field/tasks",bundlePath:"",filename:""},userland:i,distDir:".next",relativeProjectDir:""});async function m(a,b,c){let d=await p.prepare(a,b,{srcPage:"/api/field/tasks"});if(!d){b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve());return}let{query:f,params:g,prerenderManifest:h,routerServerContext:i}=d;try{let c=a.method||"GET",d=(0,j.getTracer)(),e=d.getActiveScopeSpan(),l=p.instrumentationOnRequestError.bind(p),m=async e=>p.render(a,b,{query:{...f,...g},params:g,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:h.preview,propagateError:!1,dev:p.isDev,page:"/api/field/tasks",internalRevalidate:null==i?void 0:i.revalidate,onError:(...b)=>l(a,...b)}).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let f=d.getRootSpanAttributes();if(!f)return;if(f.get("next.span_type")!==k.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${f.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let g=f.get("next.route");if(g){let a=`${c} ${g}`;e.setAttributes({"next.route":g,"http.route":g,"next.span_name":a}),e.updateName(a)}else e.updateName(`${c} ${a.url}`)});e?await m(e):await d.withPropagatedContext(a.headers,()=>d.trace(k.BaseServerSpan.handleRequest,{spanName:`${c} ${a.url}`,kind:j.SpanKind.SERVER,attributes:{"http.method":c,"http.target":a.url}},m))}catch(a){if(p.isDev)throw a;(0,e.sendError)(b,500,"Internal Server Error")}finally{null==c.waitUntil||c.waitUntil.call(c,Promise.resolve())}}d()}catch(a){d(a)}})}};var b=require("../../../webpack-api-runtime.js");b.C(a);var c=b.X(0,[7169],()=>b(b.s=82355));module.exports=c})();