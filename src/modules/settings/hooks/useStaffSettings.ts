import { useState } from 'react';
import { 
  StaffPosition, 
  StaffDepartment,
  PositionConfig,
  DepartmentConfig,
  getPositionLevel
} from '@/types/staff-hierarchy.types';

export function useStaffSettings() {
  const [positions, setPositions] = useState<PositionConfig[]>([]);
  const [departments, setDepartments] = useState<DepartmentConfig[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PositionConfig | DepartmentConfig | null>(null);

  // Initialize with default positions
  const initializePositions = () => {
    const defaultPositions = Object.values(StaffPosition).map(pos => ({
      id: pos.replace(/\s+/g, '_').toUpperCase(),
      name: pos,
      level: getPositionLevel(pos),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    setPositions(defaultPositions);
  };

  // Initialize with default departments
  const initializeDepartments = () => {
    const defaultDepartments = Object.values(StaffDepartment).map(dept => ({
      id: dept.replace(/\s+/g, '_').toUpperCase(),
      name: dept,
      isActive: true,
      employeeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    setDepartments(defaultDepartments);
  };

  // Position operations
  const addPosition = (position: PositionConfig) => {
    setPositions([...positions, position]);
  };

  const updatePosition = (id: string, updates: Partial<PositionConfig>) => {
    setPositions(positions.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
    ));
  };

  const deletePosition = (id: string) => {
    setPositions(positions.filter(p => p.id !== id));
  };

  // Department operations
  const addDepartment = (department: DepartmentConfig) => {
    setDepartments([...departments, department]);
  };

  const updateDepartment = (id: string, updates: Partial<DepartmentConfig>) => {
    setDepartments(departments.map(d => 
      d.id === id ? { ...d, ...updates, updatedAt: new Date() } : d
    ));
  };

  const deleteDepartment = (id: string) => {
    setDepartments(departments.filter(d => d.id !== id));
  };

  return {
    // State
    positions,
    departments,
    showAddModal,
    editingItem,
    
    // State setters
    setShowAddModal,
    setEditingItem,
    
    // Position operations
    initializePositions,
    addPosition,
    updatePosition,
    deletePosition,
    
    // Department operations
    initializeDepartments,
    addDepartment,
    updateDepartment,
    deleteDepartment
  };
}