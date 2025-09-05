/**
 * Staff API Service
 * Uses API routes instead of direct database access for security
 */

const API_BASE = '/api';

interface DbStaff {
  id?: string;
  employee_id?: string;
  name: string;
  email?: string;
  phone?: string;
  alternate_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  department?: string;
  position?: string;
  type?: string;
  status?: string;
  salary?: number;
  join_date?: string;
  end_date?: string;
  emergency_contact?: any;
  skills?: string[];
  certifications?: string[];
  notes?: string;
  reports_to?: string;
  project_count?: number;
  manager_name?: string;
  created_at?: string;
  updated_at?: string;
}

interface Staff {
  id?: string;
  employeeId?: string;
  name: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  department?: string;
  position?: string;
  type?: string;
  status?: string;
  salary?: number;
  joinDate?: string;
  endDate?: string;
  emergencyContact?: any;
  skills?: string[];
  certifications?: string[];
  notes?: string;
  reportsTo?: string;
  currentProjectCount?: number;
  maxProjectCount?: number;
  managerName?: string;
  startDate?: string;  // Alias for joinDate for compatibility
  createdAt?: string;
  updatedAt?: string;
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
    id: dbStaff.id,
    employeeId: dbStaff.employee_id,
    name: dbStaff.name,
    email: dbStaff.email,
    phone: dbStaff.phone,
    alternatePhone: dbStaff.alternate_phone,
    address: dbStaff.address,
    city: dbStaff.city,
    state: dbStaff.state,
    postalCode: dbStaff.postal_code,
    department: dbStaff.department,
    position: dbStaff.position,
    type: dbStaff.type,
    status: dbStaff.status,
    salary: dbStaff.salary,
    joinDate: dbStaff.join_date,
    startDate: dbStaff.join_date, // Alias for compatibility
    endDate: dbStaff.end_date,
    emergencyContact: dbStaff.emergency_contact,
    skills: dbStaff.skills,
    certifications: dbStaff.certifications,
    notes: dbStaff.notes,
    reportsTo: dbStaff.reports_to,
    currentProjectCount: dbStaff.project_count || 0,
    maxProjectCount: 5, // Default max
    managerName: dbStaff.manager_name,
    createdAt: dbStaff.created_at,
    updatedAt: dbStaff.updated_at
  };
}

function transformStaffToDb(staff: Partial<Staff>): Partial<DbStaff> {
  return {
    id: staff.id,
    employee_id: staff.employeeId,
    name: staff.name,
    email: staff.email,
    phone: staff.phone,
    alternate_phone: staff.alternatePhone,
    address: staff.address,
    city: staff.city,
    state: staff.state,
    postal_code: staff.postalCode,
    department: staff.department,
    position: staff.position,
    type: staff.type,
    status: staff.status,
    salary: staff.salary,
    join_date: staff.joinDate || staff.startDate,
    end_date: staff.endDate,
    emergency_contact: staff.emergencyContact,
    skills: staff.skills,
    certifications: staff.certifications,
    notes: staff.notes,
    reports_to: staff.reportsTo
  };
}

export const staffApiService = {
  async getAll(filter?: any): Promise<Staff[]> {
    const params = new URLSearchParams();
    if (filter) {
      if (filter.search || filter.searchTerm) params.append('search', filter.search || filter.searchTerm);
      if (filter.department) params.append('department', filter.department);
      if (filter.status) params.append('status', filter.status);
      if (filter.position) params.append('position', filter.position);
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${API_BASE}/staff${queryString}`);
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