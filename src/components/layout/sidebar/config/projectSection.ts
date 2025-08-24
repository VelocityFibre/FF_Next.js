/**
 * Project Management section configuration
 */

import {
  FolderOpen,
  CheckCircle,
  BarChart3,
  Camera,
  Cable,
  Droplets,
  FileSignature,
  Home
} from 'lucide-react';
import type { NavSection } from './types';

export const projectSection: NavSection = {
  section: 'PROJECT MANAGEMENT',
  items: [
    {
      to: '/app/projects',
      icon: FolderOpen,
      label: 'Projects',
      shortLabel: 'Proj',
      permissions: [],
    },
    {
      to: '/app/pole-capture',
      icon: Camera,
      label: 'Pole Capture',
      shortLabel: 'Poles',
      permissions: [],
    },
    {
      to: '/app/fiber-stringing',
      icon: Cable,
      label: 'Fiber Stringing',
      shortLabel: 'Fiber',
      permissions: [],
    },
    {
      to: '/app/drops',
      icon: Droplets,
      label: 'Drops Management',
      shortLabel: 'Drops',
      permissions: [],
    },
    {
      to: '/app/sow-management',
      icon: FileSignature,
      label: 'SOW Management',
      shortLabel: 'SOW',
      permissions: [],
    },
    {
      to: '/app/installations',
      icon: Home,
      label: 'Home Installations',
      shortLabel: 'Install',
      permissions: [],
    },
    {
      to: '/app/tasks',
      icon: CheckCircle,
      label: 'Task Management',
      shortLabel: 'Tasks',
      permissions: [],
    },
    {
      to: '/app/daily-progress',
      icon: BarChart3,
      label: 'Daily Progress',
      shortLabel: 'Daily',
      permissions: [],
    },
  ]
};