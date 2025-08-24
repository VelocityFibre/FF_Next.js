import { useState, useEffect } from 'react';
import { SOWListItem } from '../types/sow.types';

export function useSOWFilters(documents: SOWListItem[]) {
  const [filteredDocuments, setFilteredDocuments] = useState<SOWListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filterDocuments = () => {
    let filtered = [...documents];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.uploadedByName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    setFilteredDocuments(filtered);
  };

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, typeFilter, statusFilter]);

  return {
    filteredDocuments,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter
  };
}