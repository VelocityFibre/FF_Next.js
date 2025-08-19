import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { StaffStatus, StaffLevel } from '@/types/staff.types';

export function StaffDebug() {
  const [staffData, setStaffData] = useState<any[]>([]);
  const [activeStaff, setActiveStaff] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        // Get all staff
        const allStaffSnapshot = await getDocs(collection(db, 'staff'));
        const allStaff = allStaffSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStaffData(allStaff);

        // Get active staff
        const activeQuery = query(
          collection(db, 'staff'),
          where('status', '==', StaffStatus.ACTIVE),
          orderBy('name', 'asc')
        );
        const activeSnapshot = await getDocs(activeQuery);
        const active = activeSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setActiveStaff(active);

        // Filter for managers
        const managerLevels = [
          StaffLevel.SENIOR,
          StaffLevel.LEAD,
          StaffLevel.MANAGER,
          StaffLevel.EXECUTIVE
        ];
        const managersFiltered = active.filter(staff => 
          managerLevels.includes(staff.level)
        );
        setManagers(managersFiltered);

      } catch (err) {
        console.error('Error fetching staff:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, []);

  if (loading) return <div>Loading staff debug info...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-bold mb-4">Staff Debug Information</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Total Staff: {staffData.length}</h3>
          {staffData.length > 0 && (
            <div className="mt-2 text-sm">
              <p>Sample staff member:</p>
              <pre className="bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(staffData[0], null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold">Active Staff: {activeStaff.length}</h3>
          {activeStaff.map(staff => (
            <div key={staff.id} className="text-sm">
              - {staff.name} (Status: {staff.status}, Level: {staff.level})
            </div>
          ))}
        </div>

        <div>
          <h3 className="font-semibold">Eligible Project Managers: {managers.length}</h3>
          {managers.map(manager => (
            <div key={manager.id} className="text-sm">
              - {manager.name} (Level: {manager.level}, Projects: {manager.currentProjectCount}/{manager.maxProjectCount})
            </div>
          ))}
        </div>

        {managers.length === 0 && activeStaff.length > 0 && (
          <div className="bg-yellow-100 p-3 rounded">
            <p className="text-sm">
              No project managers found. Staff must have status 'active' and level of 'senior', 'lead', 'manager', or 'executive'.
            </p>
            <p className="text-sm mt-2">
              Current active staff levels:
              {activeStaff.map(s => ` ${s.name}: ${s.level}`).join(', ')}
            </p>
          </div>
        )}

        {staffData.length === 0 && (
          <div className="bg-red-100 p-3 rounded">
            <p className="text-sm">
              No staff members found in the database. Please add staff members first.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}