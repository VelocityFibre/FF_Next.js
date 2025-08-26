#!/bin/bash

# Create GitHub issue for customizable workflow system
gh issue create \
  --title "[FF2-FEATURE] Customizable Project Workflow Task Management System" \
  --label "FF2,P1-HIGH,feature,project-management,customization" \
  --body "$(cat << 'ISSUE_BODY'
## 🎯 PROJECT WORKFLOW TASK MANAGEMENT SYSTEM

**Priority:** P1-HIGH
**Type:** Feature Implementation  
**Module:** Project Management
**Epic:** Project Lifecycle Management

## 📋 Overview

Implement a comprehensive, **CUSTOMIZABLE** project workflow task management system based on the legacy Angular application analysis. This system provides structured project progression through **user-configurable** workflow phases with mandatory task completion tracking.

## 🛠️ **CUSTOMIZATION REQUIREMENTS (CRITICAL)**

**User Story:** As a system administrator, I need to customize project workflows to match our specific business processes, removing unnecessary complexity and adapting the system to our actual operations.

### **🎛️ System Settings - Workflow Management**

#### **Workflow Configuration Interface**
- [ ] **Settings Page:** `/app/settings/workflow` - Comprehensive workflow editor
- [ ] **Phase Management:** Create, edit, delete, reorder workflow phases
- [ ] **Step Management:** CRUD operations for steps within phases  
- [ ] **Task Management:** Add, remove, edit individual tasks
- [ ] **Drag & Drop Interface:** Visual reordering of phases, steps, and tasks
- [ ] **Template Management:** Save/load different workflow templates

#### **Administrative Controls**
```typescript
interface WorkflowManagement {
  // Phase Operations
  createPhase(name: string, description: string, position: number): Promise<Phase>;
  updatePhase(id: string, updates: Partial<Phase>): Promise<Phase>;
  deletePhase(id: string): Promise<void>;
  reorderPhases(phaseIds: string[]): Promise<void>;
  
  // Step Operations  
  createStep(phaseId: string, step: StepCreate): Promise<Step>;
  updateStep(id: string, updates: Partial<Step>): Promise<Step>;
  deleteStep(id: string): Promise<void>;
  reorderSteps(phaseId: string, stepIds: string[]): Promise<void>;
  
  // Task Operations
  createTask(stepId: string, task: TaskCreate): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  reorderTasks(stepId: string, taskIds: string[]): Promise<void>;
  
  // Template Operations
  saveAsTemplate(name: string, workflow: Workflow): Promise<Template>;
  loadTemplate(templateId: string): Promise<Workflow>;
  cloneWorkflow(workflowId: string, name: string): Promise<Workflow>;
}
```

## 🔍 **Legacy Analysis Complete**

Based on analysis of `C:\Jarvis\AI Workspace\FibreFlow_Firebase`, the system implements:

- **4-Tier Hierarchy:** Project → Phase → Step → Task
- **192 Predefined Tasks** across 5 main phases (**CUSTOMIZABLE**)
- **Template-Based Workflow** ensuring project consistency
- **Advanced Task Features:** Progress tracking, dependencies, time tracking, assignments

**Full Analysis:** See `LEGACY_TASK_MANAGEMENT_ANALYSIS.md`

## 🏗️ **System Architecture (Customizable)**

### **Default Workflow Phases (5 Main Phases) - FULLY EDITABLE**
1. **Planning Phase** (96 tasks, 12 steps) - *Can be simplified/removed*
   - Commercial Planning, Legal Planning, Technical Planning
   - Site surveys, permits, resource allocation
   
2. **Initiate Project** (24 tasks, 6 steps) - *Can be customized*
   - Project kickoff, team formation
   - Initial setup and preparation
   
3. **Work in Progress** (24 tasks, 6 steps) - *Core phase, customizable*
   - Active implementation and development
   - Progress monitoring and adjustments
   
4. **Handover** (24 tasks, 6 steps) - *Optional for some project types*
   - System delivery and knowledge transfer
   - Documentation and training
   
5. **Full Acceptance** (24 tasks, 6 steps) - *Can be removed if not needed*
   - Final testing and validation  
   - Project closure and sign-off

### **Customization Features**
- **Remove Unnecessary Phases:** Delete entire phases not needed for business
- **Streamline Steps:** Combine or remove redundant steps
- **Task Reduction:** Remove tasks that don't add value to process
- **Custom Workflows:** Create completely new workflows from scratch
- **Reorder Everything:** Drag & drop to reorganize phases, steps, tasks

## 🎨 **Workflow Editor Components**

### **Main Workflow Editor Interface**
```typescript
<WorkflowEditor>
  <PhaseManager
    phases={workflowPhases}
    onReorder={handlePhaseReorder}
    onEdit={handlePhaseEdit}
    onDelete={handlePhaseDelete}
  />
  
  <StepManager
    selectedPhase={selectedPhase}
    steps={phaseSteps}
    onReorder={handleStepReorder}
    onEdit={handleStepEdit}
    onDelete={handleStepDelete}
  />
  
  <TaskManager
    selectedStep={selectedStep}
    tasks={stepTasks}
    onReorder={handleTaskReorder}
    onEdit={handleTaskEdit}
    onDelete={handleTaskDelete}
  />
</WorkflowEditor>
```

### **Drag & Drop Features**
- [ ] **Phase Reordering:** Drag phases to change execution order
- [ ] **Step Movement:** Move steps between phases or reorder within phase
- [ ] **Task Shuffling:** Reorganize tasks within steps or move between steps
- [ ] **Visual Feedback:** Clear drop zones and reordering indicators
- [ ] **Constraint Validation:** Prevent invalid moves (dependencies)

## 📊 **Enhanced Database Schema for Customization**

```sql
-- Enhanced schema with customization support
CREATE TABLE workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_custom BOOLEAN DEFAULT false,
  created_by UUID REFERENCES staff(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES workflow_templates(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false,
  created_by UUID REFERENCES staff(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID REFERENCES project_phases(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  estimated_hours INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false,
  created_by UUID REFERENCES staff(id)
);

CREATE TABLE task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID REFERENCES project_steps(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'Medium',
  estimated_hours INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL,
  is_mandatory BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false,
  created_by UUID REFERENCES staff(id)
);

-- Project-specific workflow assignments
CREATE TABLE project_workflow_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  template_id UUID REFERENCES workflow_templates(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID REFERENCES staff(id)
);
```

## 🎯 **Implementation Requirements**

### **Phase 1: Customization Foundation (Days 1-3)**
- [ ] **Enhanced database schema** with customization fields
- [ ] **Workflow template system** implementation
- [ ] **Basic CRUD operations** for phases, steps, tasks
- [ ] **Settings page structure** and routing (`/app/settings/workflow`)

### **Phase 2: Workflow Editor (Days 4-6)**
- [ ] **Drag & drop interface** for reordering
- [ ] **Visual workflow editor** components
- [ ] **Phase/step/task CRUD** interfaces
- [ ] **Template save/load** functionality
- [ ] **Bulk operations** for batch editing

### **Phase 3: Advanced Customization (Days 7-9)**
- [ ] **Conditional workflow logic** based on project type
- [ ] **Project type workflow mapping**
- [ ] **Workflow validation** and dependency checking
- [ ] **Import/export** workflow templates

### **Phase 4: Integration & Testing (Days 10-12)**
- [ ] **Integration** with existing project system
- [ ] **User permissions** for workflow editing
- [ ] **Migration tools** for existing projects
- [ ] **Performance optimization** for large workflows

## 👤 **User Experience Flow**

### **Administrator Journey**
1. **Navigate** to `/app/settings/workflow`
2. **View** current workflow structure (5 phases, 32 steps, 192 tasks)
3. **Identify** unnecessary phases/steps for their business
4. **Remove/Edit** phases like "Full Acceptance" if not needed
5. **Reorder** phases to match their actual process flow
6. **Simplify** steps by combining or removing redundant ones
7. **Customize** task lists to match their specific requirements
8. **Save** as custom template for future projects
9. **Apply** to existing projects or set as default

### **Project Manager Journey**  
1. **Create** new project with customized workflow
2. **See** only relevant phases/steps for their project type
3. **Assign** tasks based on simplified, relevant workflow
4. **Track** progress through customized phases
5. **Complete** project using streamlined process

## 🎯 **Business Benefits of Customization**

### **Immediate Value**
- **Remove Complexity:** Eliminate unnecessary 192-task overhead
- **Match Reality:** Align system with actual business processes
- **Improve Adoption:** Teams use system because it fits their workflow
- **Reduce Training:** Simpler, customized workflows easier to learn

### **Long-term Benefits**
- **Process Evolution:** Workflows can evolve as business grows
- **Multi-Industry:** Same system serves different industry needs
- **Scalability:** Add complexity only when/where needed
- **Competitive Advantage:** Faster project execution with optimized workflows

## ✅ **Success Criteria**

### **Functional Requirements**
- [ ] **Fully customizable workflows** with drag & drop interface
- [ ] **CRUD operations** for all workflow elements
- [ ] **Template system** for saving/loading custom workflows
- [ ] **Project type mapping** for automatic workflow assignment
- [ ] **Bulk operations** for efficient workflow management
- [ ] **Data migration** tools for existing projects
- [ ] **Validation system** preventing invalid configurations

### **User Experience Requirements**
- [ ] **Intuitive workflow editor** with visual drag & drop
- [ ] **Settings page integration** under `/app/settings/workflow`
- [ ] **Real-time preview** of workflow changes
- [ ] **Undo/redo functionality** for workflow editing
- [ ] **Template library** with pre-built workflow options
- [ ] **Search and filter** for large workflow management

## 🚀 **Implementation Timeline**

**Week 1: Customization Core (Days 1-4)**
- Enhanced database schema with customization support
- Basic workflow editor components
- CRUD operations for workflow elements
- Settings page integration

**Week 2: Advanced Editor (Days 5-9)**
- Drag & drop interface implementation
- Template system with save/load functionality
- Bulk operations and advanced editing features
- Workflow validation and dependency management

**Week 3: Polish & Deploy (Days 10-12)**
- Performance optimization for large workflows
- User acceptance testing with customization scenarios
- Documentation and admin training materials
- Production deployment with migration tools

## 📋 **Dependencies**
- ✅ Project management system (already implemented)
- ✅ Staff management system (already implemented)  
- ✅ User authentication and permissions (already implemented)
- ✅ Neon PostgreSQL connection (already working)
- 🔄 Settings page framework (to be implemented)

## ⚠️ **Implementation Considerations**

### **Data Migration Strategy**
- [ ] **Backup existing workflows** before allowing customization
- [ ] **Version control** for workflow changes with rollback capability
- [ ] **Impact analysis** showing what projects will be affected by changes
- [ ] **Gradual rollout** allowing testing of custom workflows

### **Validation & Safety**
- [ ] **Dependency checking** - prevent deletion of steps with dependencies
- [ ] **Project impact warnings** - alert when changes affect active projects
- [ ] **Workflow validation** - ensure logical flow and completeness
- [ ] **Rollback capabilities** - undo changes if issues arise

This enhanced approach transforms the 192-task system from a rigid framework into a flexible, customizable foundation that can be tailored to match specific business processes and complexity requirements.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
ISSUE_BODY
)"