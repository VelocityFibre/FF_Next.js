import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { StaffStatus, Position, Department } from '@/types/staff.types';

/**
 * Script to fix missing fields in imported staff data
 */
export async function fixStaffData() {
  try {
    console.log('Starting staff data fix...');
    
    // Get all staff
    const staffSnapshot = await getDocs(collection(db, 'staff'));
    console.log(`Found ${staffSnapshot.size} staff members`);
    
    const batch = writeBatch(db);
    let updatedCount = 0;
    
    staffSnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const updates: any = {};
      
      // Add or update position field - standardize to Position enum values
      if (!data.position || data.position === '') {
        // Set a default position
        updates.position = Position.FIELD_TECHNICIAN;
        console.log(`Setting position for ${data.name || docSnapshot.id}: ${updates.position}`);
      } else {
        // Try to map existing position to standard positions
        const currentPosition = (data.position || '').toLowerCase();
        
        if (currentPosition.includes('project manager')) {
          updates.position = currentPosition.includes('senior') ? Position.SENIOR_PROJECT_MANAGER : Position.PROJECT_MANAGER;
        } else if (currentPosition.includes('supervisor')) {
          updates.position = Position.SITE_SUPERVISOR;
        } else if (currentPosition.includes('technician')) {
          updates.position = currentPosition.includes('senior') ? Position.SENIOR_TECHNICIAN : Position.FIELD_TECHNICIAN;
        } else if (currentPosition.includes('cable') || currentPosition.includes('jointer')) {
          updates.position = Position.CABLE_JOINTER;
        } else if (currentPosition.includes('fiber') || currentPosition.includes('splicer')) {
          updates.position = Position.FIBER_SPLICER;
        } else if (currentPosition.includes('network') || currentPosition.includes('engineer')) {
          updates.position = Position.NETWORK_ENGINEER;
        } else if (currentPosition.includes('quality') || currentPosition.includes('inspector')) {
          updates.position = Position.QUALITY_INSPECTOR;
        } else if (currentPosition.includes('safety')) {
          updates.position = Position.SAFETY_OFFICER;
        } else if (currentPosition.includes('operations manager')) {
          updates.position = Position.OPERATIONS_MANAGER;
        } else if (currentPosition.includes('construction manager')) {
          updates.position = Position.CONSTRUCTION_MANAGER;
        } else if (currentPosition.includes('team lead') || currentPosition.includes('lead')) {
          updates.position = Position.TEAM_LEAD;
        } else if (currentPosition.includes('admin')) {
          updates.position = Position.ADMIN_ASSISTANT;
        } else if (currentPosition.includes('driver')) {
          updates.position = Position.DRIVER;
        } else if (currentPosition.includes('intern')) {
          updates.position = Position.INTERN;
        } else {
          // Keep existing position if it doesn't match standard ones
          console.log(`Keeping custom position for ${data.name || docSnapshot.id}: ${data.position}`);
        }
        
        if (updates.position) {
          console.log(`Updating position for ${data.name || docSnapshot.id}: ${data.position} -> ${updates.position}`);
        }
      }
      
      // Add missing status field - default to ACTIVE
      if (!data.status) {
        updates.status = StaffStatus.ACTIVE;
        console.log(`Setting status for ${data.name || docSnapshot.id}: ACTIVE`);
      }
      
      // Add missing department field if not present
      if (!data.department) {
        updates.department = Department.OPERATIONS;
        console.log(`Setting department for ${data.name || docSnapshot.id}: OPERATIONS`);
      }
      
      // Add missing numeric fields with defaults
      if (data.currentProjectCount === undefined) {
        updates.currentProjectCount = 0;
      }
      
      if (data.maxProjectCount === undefined) {
        updates.maxProjectCount = 5;
      }
      
      if (data.totalProjectsCompleted === undefined) {
        updates.totalProjectsCompleted = 0;
      }
      
      if (data.averageProjectRating === undefined) {
        updates.averageProjectRating = 0;
      }
      
      if (data.experienceYears === undefined) {
        updates.experienceYears = 1;
      }
      
      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        batch.update(doc(db, 'staff', docSnapshot.id), updates);
        updatedCount++;
      }
    });
    
    // Commit the batch
    if (updatedCount > 0) {
      await batch.commit();
      console.log(`Successfully updated ${updatedCount} staff members`);
    } else {
      console.log('No staff members needed updates');
    }
    
    // Now let's specifically ensure we have some project managers
    // Get all staff again to check positions
    const updatedSnapshot = await getDocs(collection(db, 'staff'));
    const managers: Array<{ id: string; name: string; position: string }> = [];
    const nonManagers: Array<{ id: string; name: string; position: string; status: string }> = [];
    
    updatedSnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const position = (data.position || '').toLowerCase();
      
      // Check if they have a manager-eligible position
      const isManager = position.includes('manager') || 
                       position.includes('lead') || 
                       position.includes('supervisor');
      
      if (data.status === StaffStatus.ACTIVE && isManager) {
        managers.push({ id: docSnapshot.id, name: data.name, position: data.position });
      } else {
        nonManagers.push({ id: docSnapshot.id, name: data.name, position: data.position, status: data.status });
      }
    });
    
    console.log(`\nProject Managers found: ${managers.length}`);
    managers.forEach(m => console.log(`  - ${m.name} (${m.position})`));
    
    // If no managers found, promote some staff to manager positions
    if (managers.length === 0 && nonManagers.length > 0) {
      console.log('\nNo project managers found. Promoting some staff...');
      
      const toPromote = nonManagers.slice(0, Math.min(5, nonManagers.length));
      const promoteBatch = writeBatch(db);
      
      for (const staff of toPromote) {
        promoteBatch.update(doc(db, 'staff', staff.id), {
          position: Position.PROJECT_MANAGER,
          status: StaffStatus.ACTIVE
        });
        console.log(`Promoting ${staff.name} to Project Manager`);
      }
      
      await promoteBatch.commit();
      console.log(`Promoted ${toPromote.length} staff members to Project Manager position`);
    }
    
    console.log('\nStaff data fix completed!');
    return { success: true, updatedCount, managerCount: managers.length };
    
  } catch (error) {
    console.error('Error fixing staff data:', error);
    return { success: false, error };
  }
}

// Export a function to run this from the browser console
(window as any).fixStaffData = fixStaffData;