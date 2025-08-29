/**
 * Staff API Service
 * Uses API routes instead of direct database access for security
 */

const API_BASE = '/api';

interface DbStaff {
  id?: string;
  employee_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  hire_date?: string;
  salary?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

interface Staff {
  id?: string;
  employeeId?: string;
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  hire_date?: string;
  salary?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  const data = await response.json();
  return data.data || data;
}

function transformDbToStaff(dbStaff: DbStaff): Staff {
  return {
    ...dbStaff,
    employeeId: dbStaff.employee_id,
    name: `${dbStaff.first_name} ${dbStaff.last_name}`.trim()
  };
}

function transformStaffToDb(staff: Partial<Staff>): Partial<DbStaff> {
  const names = staff.name?.split(' ') || [];
  return {
    ...staff,
    employee_id: staff.employeeId,
    first_name: names[0] || '',
    last_name: names.slice(1).join(' ') || ''
  };
}

export const staffApiService = {
  async getAll(): Promise<Staff[]> {
    const response = await fetch(`${API_BASE}/staff`);
    const dbStaff = await handleResponse<DbStaff[]>(response);
    return dbStaff.map(transformDbToStaff);
  },

  async getById(id: string): Promise<Staff | null> {
    const response = await fetch(`${API_BASE}/staff?id=${id}`);
    const dbStaff = await handleResponse<DbStaff | null>(response);
    return dbStaff ? transformDbToStaff(dbStaff) : null;
  },

  async create(staffData: Omit<Staff, 'id' | 'created_at' | 'updated_at'>): Promise<Staff> {
    const dbData = transformStaffToDb(staffData);
    const response = await fetch(`${API_BASE}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbData)
    });
    const dbStaff = await handleResponse<DbStaff>(response);
    return transformDbToStaff(dbStaff);
  },

  async update(id: string, updates: Partial<Staff>): Promise<Staff> {
    const dbUpdates = transformStaffToDb(updates);
    const response = await fetch(`${API_BASE}/staff?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbUpdates)
    });
    const dbStaff = await handleResponse<DbStaff>(response);
    return transformDbToStaff(dbStaff);
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/staff?id=${id}`, {
      method: 'DELETE'
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },

  // Compatibility methods to match existing service interface
  async getActiveStaff(): Promise<Staff[]> {
    const staff = await this.getAll();
    return staff.filter(s => s.status === 'active');
  },

  async getStaffByDepartment(department: string): Promise<Staff[]> {
    const staff = await this.getAll();
    return staff.filter(s => s.department === department);
  },

  async getStaffSummary(): Promise<{
    totalStaff: number;
    activeStaff: number;
    departments: string[];
    averageSalary: number;
  }> {
    const staff = await this.getAll();
    const departments = [...new Set(staff.map(s => s.department).filter(Boolean))];
    const activeSalaries = staff
      .filter(s => s.status === 'active' && s.salary)
      .map(s => s.salary || 0);
    
    return {
      totalStaff: staff.length,
      activeStaff: staff.filter(s => s.status === 'active').length,
      departments: departments as string[],
      averageSalary: activeSalaries.length > 0 
        ? activeSalaries.reduce((sum, s) => sum + s, 0) / activeSalaries.length
        : 0
    };
  }
};