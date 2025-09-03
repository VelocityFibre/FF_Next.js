/**
 * Client API Service
 * Uses API routes instead of direct database access for security
 */

const API_BASE = '/api';

interface DbClient {
  id?: string;
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  client_type?: string;
  status?: string;
  payment_terms?: string;
  contract_value?: number;
  created_at?: string;
  updated_at?: string;
}

interface Client {
  id?: string;
  companyName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  category?: string;
  status?: string;
  paymentTerms?: string;
  contractValue?: number;
  totalProjectValue?: number;
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

function transformDbToClient(dbClient: DbClient): any {
  return {
    id: dbClient.id,
    name: dbClient.company_name, // Map to 'name' for compatibility
    companyName: dbClient.company_name,
    contactPerson: dbClient.contact_person,
    email: dbClient.email,
    phone: dbClient.phone,
    address: dbClient.address,
    city: dbClient.city || 'Johannesburg',
    province: dbClient.state || 'Gauteng',
    state: dbClient.state,
    postalCode: '',
    country: 'South Africa',
    category: dbClient.client_type || 'SME',
    status: dbClient.status || 'ACTIVE',
    paymentTerms: dbClient.payment_terms || 'NET_30',
    creditLimit: 100000,
    creditRating: 'UNRATED',
    preferredContactMethod: 'EMAIL',
    communicationLanguage: 'English',
    timezone: 'Africa/Johannesburg',
    priority: 'MEDIUM',
    industry: '',
    serviceTypes: [],
    tags: [],
    contractValue: dbClient.contract_value,
    totalProjectValue: dbClient.contract_value,
    created_at: dbClient.created_at,
    updated_at: dbClient.updated_at
  };
}

function transformClientToDb(client: Partial<Client>): Partial<DbClient> {
  return {
    id: client.id,
    company_name: client.companyName,
    contact_person: client.contactPerson,
    email: client.email,
    phone: client.phone,
    address: client.address,
    city: client.city,
    state: client.state,
    client_type: client.category,
    status: client.status,
    payment_terms: client.paymentTerms,
    contract_value: client.contractValue
  };
}

export const clientApiService = {
  async getAll(): Promise<Client[]> {
    const response = await fetch(`${API_BASE}/clients`);
    const dbClients = await handleResponse<DbClient[]>(response);
    return dbClients.map(transformDbToClient);
  },

  async getById(id: string): Promise<Client | null> {
    const response = await fetch(`${API_BASE}/clients?id=${id}`);
    const dbClient = await handleResponse<DbClient | null>(response);
    return dbClient ? transformDbToClient(dbClient) : null;
  },

  async create(clientData: any): Promise<Client> {
    // Transform the form data to match the database schema
    const dbData = {
      company_name: clientData.name || clientData.companyName,
      contact_person: clientData.contactPerson,
      email: clientData.email,
      phone: clientData.phone,
      address: clientData.address?.street || clientData.address,
      city: clientData.address?.city || clientData.city || 'Johannesburg',
      state: clientData.address?.state || clientData.state || 'Gauteng',
      status: clientData.status || 'active'
    };
    
    const response = await fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbData)
    });
    const dbClient = await handleResponse<DbClient>(response);
    return transformDbToClient(dbClient);
  },

  async update(id: string, updates: any): Promise<Client> {
    // Transform the form data to match the database schema
    const dbUpdates = {
      company_name: updates.name || updates.companyName,
      contact_person: updates.contactPerson,
      email: updates.email,
      phone: updates.phone,
      address: updates.address?.street || updates.address,
      city: updates.address?.city || updates.city || 'Johannesburg',
      state: updates.address?.state || updates.state || 'Gauteng',
      status: updates.status || 'active'
    };
    
    const response = await fetch(`${API_BASE}/clients?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbUpdates)
    });
    const dbClient = await handleResponse<DbClient>(response);
    return transformDbToClient(dbClient);
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/clients?id=${id}`, {
      method: 'DELETE'
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },

  // Compatibility methods to match existing service interface
  async getActiveClients(): Promise<any[]> {
    const clients = await this.getAll();
    // Return all clients for now, regardless of status
    // Later we can filter by status when we know the exact status values
    return clients;
  },

  async getClientSummary(): Promise<{
    totalClients: number;
    activeClients: number;
    newThisMonth: number;
  }> {
    const clients = await this.getAll();
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    const newThisMonth = clients.filter(c => {
      if (!c.created_at) return false;
      const created = new Date(c.created_at);
      return created.getMonth() === thisMonth && created.getFullYear() === thisYear;
    }).length;

    return {
      totalClients: clients.length,
      activeClients: clients.filter(c => c.status === 'active').length,
      newThisMonth
    };
  }
};