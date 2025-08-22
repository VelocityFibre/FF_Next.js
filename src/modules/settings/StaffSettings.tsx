import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Users, Building, GitBranch } from 'lucide-react';
import { 
  StaffPosition, 
  StaffDepartment,
  PositionConfig,
  DepartmentConfig,
  getPositionLevel
} from '@/types/staff-hierarchy.types';

export function StaffSettings() {
  const [activeTab, setActiveTab] = useState<'positions' | 'departments' | 'hierarchy'>('positions');
  const [positions, setPositions] = useState<PositionConfig[]>([]);
  const [departments, setDepartments] = useState<DepartmentConfig[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Staff Organization Settings</h1>
          <p className="text-gray-600 mt-2">Manage positions, departments, and reporting structure</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('positions')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'positions'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="w-4 h-4 inline-block mr-2" />
                Positions
              </button>
              <button
                onClick={() => setActiveTab('departments')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'departments'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Building className="w-4 h-4 inline-block mr-2" />
                Departments
              </button>
              <button
                onClick={() => setActiveTab('hierarchy')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'hierarchy'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <GitBranch className="w-4 h-4 inline-block mr-2" />
                Reporting Hierarchy
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'positions' && (
              <PositionsTab 
                positions={positions}
                onAdd={() => setShowAddModal(true)}
                onEdit={setEditingItem}
                onDelete={(id) => setPositions(positions.filter(p => p.id !== id))}
                onInitialize={initializePositions}
              />
            )}
            
            {activeTab === 'departments' && (
              <DepartmentsTab 
                departments={departments}
                onAdd={() => setShowAddModal(true)}
                onEdit={setEditingItem}
                onDelete={(id) => setDepartments(departments.filter(d => d.id !== id))}
                onInitialize={initializeDepartments}
              />
            )}
            
            {activeTab === 'hierarchy' && (
              <HierarchyTab />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Positions Tab Component
function PositionsTab({ positions, onAdd, onEdit, onDelete, onInitialize }: any) {
  // Group positions by level
  const positionsByLevel = positions.reduce((acc: any, pos: PositionConfig) => {
    const level = `Level ${pos.level}`;
    if (!acc[level]) acc[level] = [];
    acc[level].push(pos);
    return acc;
  }, {});

  const levelNames: Record<number, string> = {
    1: 'Executive',
    2: 'C-Suite',
    3: 'Heads/Directors',
    4: 'Managers',
    5: 'Senior Staff',
    6: 'Mid Level',
    7: 'Support',
    8: 'Other'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Position Management</h2>
        <div className="space-x-2">
          {positions.length === 0 && (
            <button
              onClick={onInitialize}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Initialize Default Positions
            </button>
          )}
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Position
          </button>
        </div>
      </div>

      {Object.entries(positionsByLevel).map(([level, levelPositions]: [string, any]) => {
        const levelNum = parseInt(level.replace('Level ', ''));
        return (
          <div key={level} className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              {levelNames[levelNum]} ({level})
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {levelPositions.map((position: PositionConfig) => (
                  <div
                    key={position.id}
                    className="bg-white rounded-lg p-3 border border-gray-200 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium text-gray-900">{position.name}</span>
                      {position.department && (
                        <span className="text-sm text-gray-500 ml-2">({position.department})</span>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => onEdit(position)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(position.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Departments Tab Component
function DepartmentsTab({ departments, onAdd, onEdit, onDelete, onInitialize }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Department Management</h2>
        <div className="space-x-2">
          {departments.length === 0 && (
            <button
              onClick={onInitialize}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Initialize Default Departments
            </button>
          )}
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept: DepartmentConfig) => (
          <div key={dept.id} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900">{dept.name}</h3>
              <div className="flex space-x-1">
                <button
                  onClick={() => onEdit(dept)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(dept.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              {dept.headEmployeeName && (
                <p>Head: {dept.headEmployeeName}</p>
              )}
              {dept.parentDepartment && (
                <p>Parent: {dept.parentDepartment}</p>
              )}
              <p>Employees: {dept.employeeCount || 0}</p>
              <p className={`inline-block px-2 py-1 rounded text-xs ${
                dept.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {dept.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Hierarchy Tab Component
function HierarchyTab() {
  const [hierarchy, setHierarchy] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch staff and build hierarchy
  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      // Import staffService dynamically to avoid circular imports
      const { staffService } = await import('@/services/staffService');
      const allStaff = await staffService.getAll();
      
      // Build hierarchy tree
      const hierarchyTree = buildHierarchyTree(allStaff);
      setHierarchy(hierarchyTree);
    } catch (error) {
      console.error('Error fetching hierarchy:', error);
    } finally {
      setLoading(false);
    }
  };

  // Build hierarchy tree structure
  const buildHierarchyTree = (staff: any[]) => {
    const staffMap = new Map();
    const roots: any[] = [];

    // Create staff map
    staff.forEach(person => {
      staffMap.set(person.id, {
        ...person,
        children: []
      });
    });

    // Build parent-child relationships
    staff.forEach(person => {
      if (person.reportsTo) {
        const manager = staffMap.get(person.reportsTo);
        if (manager) {
          manager.children.push(staffMap.get(person.id));
        } else {
          // If manager not found, treat as root
          roots.push(staffMap.get(person.id));
        }
      } else {
        // No manager - this is a root node
        roots.push(staffMap.get(person.id));
      }
    });

    return roots;
  };

  // Load hierarchy on component mount
  React.useEffect(() => {
    fetchHierarchy();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Organizational Hierarchy</h2>
        <button
          onClick={fetchHierarchy}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <GitBranch className="w-4 h-4 mr-2" />
          Refresh Hierarchy
        </button>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800">
          The reporting hierarchy is built from the "Reports To" relationships in staff profiles.
          Click on staff members to view their details or edit reporting relationships.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading organizational hierarchy...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {hierarchy.length > 0 ? (
            <div className="space-y-4">
              {hierarchy.map(root => (
                <HierarchyNode key={root.id} person={root} level={0} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <GitBranch className="w-12 h-12 mx-auto mb-3" />
              <p>No staff members found</p>
              <p className="text-sm mt-2">Add staff members to see the organizational hierarchy</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Hierarchy Node Component
function HierarchyNode({ person, level }: { person: any; level: number }) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
  const hasChildren = person.children && person.children.length > 0;

  const handleNavigate = () => {
    window.open(`/app/staff/${person.id}`, '_blank');
  };

  return (
    <div className="relative">
      <div 
        className={`flex items-center p-3 rounded-lg border transition-colors cursor-pointer hover:bg-gray-50 ${
          level === 0 ? 'border-blue-200 bg-blue-50' : 
          level === 1 ? 'border-green-200 bg-green-50' :
          'border-gray-200 bg-white'
        }`}
        style={{ marginLeft: `${level * 24}px` }}
        onClick={handleNavigate}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="mr-2 p-1 rounded hover:bg-gray-200"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        
        {/* Staff Avatar */}
        <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
          level === 0 ? 'bg-blue-600 text-white' :
          level === 1 ? 'bg-green-600 text-white' :
          'bg-gray-600 text-white'
        }`}>
          <span className="text-sm font-medium">
            {person.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
          </span>
        </div>

        {/* Staff Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{person.name}</span>
            {level === 0 && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Executive
              </span>
            )}
            {level === 1 && (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Manager
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {person.position} • {person.department?.replace('_', ' ')}
          </div>
          {hasChildren && (
            <div className="text-xs text-gray-500 mt-1">
              {person.children.length} direct report{person.children.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Status Badge */}
        <span className={`px-2 py-1 text-xs rounded-full ${
          person.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
          person.status === 'ON_LEAVE' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {person.status?.replace('_', ' ') || 'Unknown'}
        </span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-2">
          {person.children.map((child: any) => (
            <HierarchyNode key={child.id} person={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}