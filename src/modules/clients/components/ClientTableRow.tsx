import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Eye, Mail, Phone } from 'lucide-react';
import type { Client } from '@/types/client.types';
import { getStatusColor, getPriorityColor, getCategoryIcon, formatCurrency } from '../utils/clientUtils';

interface ClientTableRowProps {
  client: Client;
  onDelete: (id: string) => void;
}

export function ClientTableRow({ client, onDelete }: ClientTableRowProps) {
  const navigate = useNavigate();

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-4">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">
            {getCategoryIcon(client.category)}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{client.name}</p>
            <p className="text-xs text-gray-500">{client.industry}</p>
          </div>
        </div>
      </td>
      
      <td className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-gray-900">{client.contactPerson}</p>
          <div className="flex items-center gap-2 text-xs">
            <a 
              href={`mailto:${client.email}`} 
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Mail className="h-3 w-3" />
              {client.email}
            </a>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <a 
              href={`tel:${client.phone}`} 
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Phone className="h-3 w-3" />
              {client.phone}
            </a>
          </div>
        </div>
      </td>
      
      <td className="px-4 py-4">
        <p className="text-sm text-gray-900">
          {client.category.replace('_', ' ').charAt(0).toUpperCase() + client.category.slice(1)}
        </p>
      </td>
      
      <td className="px-4 py-4">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
          {client.status}
        </span>
      </td>
      
      <td className="px-4 py-4">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(client.priority)}`}>
          {client.priority}
        </span>
      </td>
      
      <td className="px-4 py-4">
        <div className="text-sm">
          <p className="text-gray-900">
            {client.activeProjects} active
          </p>
          <p className="text-xs text-gray-500">
            {client.totalProjects} total
          </p>
        </div>
      </td>
      
      <td className="px-4 py-4">
        <div className="text-sm">
          <p className="text-gray-900 font-medium">
            {formatCurrency(client.totalProjectValue)}
          </p>
          <p className="text-xs text-gray-500">
            {client.paymentTerms.replace('_', ' ')}
          </p>
        </div>
      </td>
      
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/app/clients/${client.id}`)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate(`/app/clients/${client.id}/edit`)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(client.id)}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}