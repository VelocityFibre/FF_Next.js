"use strict";exports.id=3970,exports.ids=[3970],exports.modules={23536:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{sf:()=>k});var e=c(51964),f=c(24390),g=c(42874),h=c(97761),i=c(49888);c(36645);var j=a([e,g,h]);[e,g,h]=j.then?(await j)():j;let k={async getAll(a){try{let b=await (0,e.S5)(a);return(0,f.LD)(b)}catch(a){throw i.Rm.error("Error fetching staff:",{data:a},"index"),a}},async getById(a){try{let b=await (0,e.PQ)(a);if(0===b.length)return null;return(0,f.SA)(b[0])}catch(a){throw i.Rm.error("Error fetching staff member:",{data:a},"index"),a}},create:g.D1,createOrUpdate:g.XF,update:g.yf,delete:g.o7,async getActiveStaff(){try{return(await (0,e.b3)()).map(a=>(0,f.CC)(a))}catch(a){throw i.Rm.error("Error fetching active staff:",{data:a},"index"),a}},async getProjectManagers(){try{return(await (0,e.SO)()).map(a=>(0,f.CC)(a,!0))}catch(a){throw i.Rm.error("Error fetching project managers:",{data:a},"index"),a}},getStaffSummary:h.f};d()}catch(a){d(a)}})},23970:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{staffNeonService:()=>e.sf});var e=c(23536),f=a([e]);e=(f.then?(await f)():f)[0],d()}catch(a){d(a)}})},24390:(a,b,c)=>{c.d(b,{CC:()=>h,LD:()=>g,SA:()=>f});var d=c(58326);function e(a){return{seconds:Math.floor(a.getTime()/1e3),nanoseconds:a.getTime()%1e3*1e6,toDate:()=>a,toMillis:()=>a.getTime(),isEqual:b=>a.getTime()===b.toMillis()}}function f(a){return{id:a.id,name:a.name||"",email:a.email||"",phone:a.phone||"",position:a.position||"",department:a.department||"",status:a.status||"ACTIVE",employeeId:a.employee_id||"",managerName:a.manager_name||"",managerPosition:a.manager_position||"",startDate:a.join_date?e((0,d.xi)(a.join_date)):e(new Date),alternativePhone:a.alternate_phone||"",contractType:a.type||"PERMANENT",createdAt:a.created_at?e((0,d.xi)(a.created_at)):e(new Date),updatedAt:a.updated_at?e((0,d.xi)(a.updated_at)):e(new Date),createdBy:a.created_by||"",lastModifiedBy:a.last_modified_by||"",experienceYears:a.experience_years||0,specializations:a.specializations||[],workingHours:a.working_hours||"",availableWeekends:a.available_weekends??!1,availableNights:a.available_nights??!1,timeZone:a.time_zone||"UTC",activeProjectIds:a.active_project_ids||[],currentProjectCount:a.current_project_count||0,maxProjectCount:a.max_project_count||5,totalProjectsCompleted:a.total_projects_completed||0,averageProjectRating:a.average_project_rating||0,onTimeCompletionRate:a.on_time_completion_rate||0,managerId:a.manager_id,reportsTo:a.reports_to,level:a.level,assignedEquipment:a.assigned_equipment||[],vehicleAssigned:a.vehicle_assigned,toolsAssigned:a.tools_assigned||[],trainingRecords:a.training_records||[],nextTrainingDue:a.next_training_due?e((0,d.xi)(a.next_training_due)):void 0,safetyTrainingExpiry:a.safety_training_expiry?e((0,d.xi)(a.safety_training_expiry)):void 0,endDate:a.end_date?e((0,d.xi)(a.end_date)):void 0,salaryGrade:a.salary_grade,hourlyRate:a.hourly_rate,managerEmployeeId:a.manager_employee_id||"",isActive:a.is_active??!0,...a.last_active_date&&{lastActiveDate:e((0,d.xi)(a.last_active_date))},profilePhotoUrl:a.profile_image_url,emergencyContactName:a.emergency_contact_name||"",emergencyContactPhone:a.emergency_contact_phone||"",address:a.address||"",city:a.city||"",province:a.province||"",postalCode:a.postal_code||"",taxNumber:a.tax_number||"",bankAccountNumber:a.bank_account_number||"",bankName:a.bank_name||"",salaryAmount:a.salary_amount||0,benefitsPackage:a.benefits_package||"",workLocation:a.work_location||"",workSchedule:a.work_schedule||"",skills:a.skills||[],certifications:a.certifications||[],performanceRating:a.performance_rating||0,performanceNotes:a.performance_notes||"",bio:a.bio,notes:a.notes||""}}function g(a){return a.map(a=>({...a,managerName:a.manager_name,managerPosition:a.manager_position}))}function h(a,b=!1){return{id:a.id,name:a.name,position:a.position,department:a.department||(b?"Management":void 0),email:a.email,status:"ACTIVE",currentProjectCount:0,maxProjectCount:b?10:5}}},36645:(a,b,c)=>{c.d(b,{C4:()=>f,W:()=>g,bQ:()=>e,vV:()=>h});var d=c(49888);function e(a){if(!a.employeeId||""===a.employeeId.trim())throw Error("Employee ID is required and cannot be empty");if(!a.name||""===a.name.trim())throw Error("Name is required and cannot be empty");if(!a.email||""===a.email.trim())throw Error("Email is required and cannot be empty")}function f(a){let b=null;if(null!=a){let c=String(a).trim();b=""!==c&&"undefined"!==c&&"null"!==c?c:null}else b=null;return""===b&&(b=null),b}function g(a,b,c){d.Rm.info("1. Raw input data:",{data:JSON.stringify(b,null,2)},"validators"),void 0!==c&&(d.Rm.info("   - String representation:",{data:String(c)},"validators"),d.Rm.info("   - JSON stringify:",{data:JSON.stringify(c)},"validators"),d.Rm.info("   - Trimmed length:",{data:c?String(c).length:"N/A"},"validators"))}function h(a,b,c){d.Rm.error(`❌ ${a} ERROR - Detailed error info:`,{data:{message:b instanceof Error?b.message:"Unknown error",stack:b instanceof Error?b.stack:"No stack trace",inputData:c,processedData:{employeeId:c.employeeId,reportsTo:c.reportsTo}}},"validators")}},42874:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{D1:()=>i,XF:()=>j,o7:()=>l,yf:()=>k});var e=c(72305),f=c(36645),g=c(49888),h=a([e]);async function i(a){try{(0,f.W)("CREATE",a,a.reportsTo),(0,f.bQ)(a);let b=(0,f.C4)(a.reportsTo);return(await (0,e.l)`
      INSERT INTO staff (
        employee_id, name, email, phone, department, position, 
        status, join_date, reports_to, created_at, updated_at
      ) VALUES (
        ${a.employeeId.trim()}, ${a.name.trim()}, ${a.email.trim()}, ${a.phone.trim()},
        ${a.department}, ${a.position}, ${a.status||"ACTIVE"},
        ${a.startDate||new Date}, ${b}, 
        NOW(), NOW()
      ) RETURNING *
    `)[0]}catch(b){throw(0,f.vV)("CREATE",b,a),b}}async function j(a){try{(0,f.W)("CREATE_OR_UPDATE",a,a.reportsTo),(0,f.bQ)(a);let b=(0,f.C4)(a.reportsTo);if((await (0,e.l)`
      SELECT id FROM staff WHERE employee_id = ${a.employeeId}
    `).length>0)return(await (0,e.l)`
        UPDATE staff SET
          name = ${a.name},
          email = ${a.email},
          phone = ${a.phone},
          department = ${a.department},
          position = ${a.position},
          status = ${a.status||"ACTIVE"},
          reports_to = ${b},
          updated_at = NOW()
        WHERE employee_id = ${a.employeeId}
        RETURNING *
      `)[0];return(await (0,e.l)`
        INSERT INTO staff (
          employee_id, name, email, phone, department, position, 
          status, join_date, reports_to, created_at, updated_at
        ) VALUES (
          ${a.employeeId}, ${a.name}, ${a.email}, ${a.phone},
          ${a.department}, ${a.position}, ${a.status||"ACTIVE"},
          ${a.startDate||new Date}, ${b}, 
          NOW(), NOW()
        ) RETURNING *
      `)[0]}catch(b){throw(0,f.vV)("CREATE_OR_UPDATE",b,a),b}}async function k(a,b){try{let c=b.reportsTo&&""!==b.reportsTo.trim()?b.reportsTo:null;return(await (0,e.l)`
      UPDATE staff SET
        name = ${b.name},
        email = ${b.email},
        phone = ${b.phone},
        department = ${b.department},
        position = ${b.position},
        status = ${b.status},
        reports_to = ${c},
        updated_at = NOW()
      WHERE id = ${a}
      RETURNING *
    `)[0]}catch(a){throw g.Rm.error("Error updating staff member:",{data:a},"crudOperations"),a}}async function l(a){try{await (0,e.l)`DELETE FROM staff WHERE id = ${a}`}catch(a){throw g.Rm.error("Error deleting staff member:",{data:a},"crudOperations"),a}}e=(h.then?(await h)():h)[0],d()}catch(a){d(a)}})},43773:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{ll:()=>i});var e=c(10762),f=a([e]);e=(f.then?(await f)():f)[0];let g=Number(process.env.NEON_POOL_QUERY_LIMIT||10);!Number.isNaN(g)&&g>0&&(e.neonConfig.poolQueryLimit=g);let h="__FF_NEON_SQL__",i=function(){let a=globalThis;return a[h]||(a[h]=function(){let a=process.env.DATABASE_URL;if(!a)throw Error("DATABASE_URL is not set. Please configure it in your environment.");return(0,e.neon)(a)}()),a[h]}();d()}catch(a){d(a)}})},51964:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{PQ:()=>h,S5:()=>g,SO:()=>j,b3:()=>i});var e=c(72305),f=a([e]);async function g(a){if(!a||!a.status?.length&&!a.department?.length)return(0,e.l)`
      SELECT 
        s.*,
        m.name as manager_name,
        m.position as manager_position
      FROM staff s
      LEFT JOIN staff m ON s.reports_to = m.id
      ORDER BY s.name ASC
    `;if(a.status?.length&&a.department?.length){let b=a.status[0],c=a.department[0];return(0,e.l)`
      SELECT 
        s.*,
        m.name as manager_name,
        m.position as manager_position
      FROM staff s
      LEFT JOIN staff m ON s.reports_to = m.id
      WHERE s.status = ${b} AND s.department = ${c}
      ORDER BY s.name ASC
    `}if(a.status?.length){let b=a.status[0];return(0,e.l)`
      SELECT 
        s.*,
        m.name as manager_name,
        m.position as manager_position
      FROM staff s
      LEFT JOIN staff m ON s.reports_to = m.id
      WHERE s.status = ${b}
      ORDER BY s.name ASC
    `}if(a.department?.length){let b=a.department[0];return(0,e.l)`
      SELECT 
        s.*,
        m.name as manager_name,
        m.position as manager_position
      FROM staff s
      LEFT JOIN staff m ON s.reports_to = m.id
      WHERE s.department = ${b}
      ORDER BY s.name ASC
    `}return(0,e.l)`
    SELECT 
      s.*,
      m.name as manager_name,
      m.position as manager_position
    FROM staff s
    LEFT JOIN staff m ON s.reports_to = m.id
    ORDER BY s.name ASC
  `}async function h(a){return(0,e.l)`
    SELECT 
      s.*,
      m.name as manager_name,
      m.position as manager_position
    FROM staff s
    LEFT JOIN staff m ON s.reports_to = m.id
    WHERE s.id = ${a} 
    LIMIT 1
  `}async function i(){return(0,e.l)`
    SELECT id, name, position, department, email 
    FROM staff 
    WHERE status = 'ACTIVE'
    ORDER BY name ASC
  `}async function j(){return(0,e.l)`
    SELECT id, name, position, department, email 
    FROM staff 
    WHERE status = 'ACTIVE' 
      AND (position LIKE '%Manager%' OR position LIKE '%Lead%' OR position = 'MD')
    ORDER BY name ASC
  `}e=(f.then?(await f)():f)[0],d()}catch(a){d(a)}})},72305:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{l:()=>e.ll});var e=c(43773),f=a([e]);e=(f.then?(await f)():f)[0],d()}catch(a){d(a)}})},97761:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{f:()=>h});var e=c(72305),f=c(49888),g=a([e]);async function h(){try{let a=await (0,e.l)`SELECT COUNT(*) as count FROM staff`,b=await (0,e.l)`SELECT COUNT(*) as count FROM staff WHERE status = 'ACTIVE'`,c=await (0,e.l)`SELECT COUNT(*) as count FROM staff WHERE status = 'INACTIVE'`,d=await (0,e.l)`SELECT COUNT(*) as count FROM staff WHERE status = 'ON_LEAVE'`,f=await (0,e.l)`
      SELECT department, COUNT(*) as count 
      FROM staff 
      GROUP BY department
    `,g=parseInt(a[0].count),h=parseInt(b[0].count),i=parseInt(c[0].count),j=parseInt(d[0].count),k={};return f.forEach(a=>{k[a.department]=parseInt(a.count)}),{totalStaff:g,activeStaff:h,inactiveStaff:i,onLeaveStaff:j,availableStaff:h,monthlyGrowth:0,averageProjectLoad:0,staffByDepartment:k,staffByLevel:{},staffBySkill:{},staffByContractType:{},averageExperience:0,utilizationRate:g>0?h/g*100:0,overallocatedStaff:0,underutilizedStaff:0,topPerformers:[],topSkills:[]}}catch(a){throw f.Rm.error("Error fetching staff summary:",{data:a},"statistics"),a}}e=(g.then?(await g)():g)[0],d()}catch(a){d(a)}})}};