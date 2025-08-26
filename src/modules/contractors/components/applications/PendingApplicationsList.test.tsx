/**
 * PendingApplicationsList Component Tests
 * Basic tests to ensure component renders and functions properly
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PendingApplicationsList } from './PendingApplicationsList';

// 🟢 WORKING: Mock the contractor service
vi.mock('@/services/contractorService', () => ({
  contractorService: {
    getAll: vi.fn().mockResolvedValue([
      {
        id: '1',
        companyName: 'Test Company',
        contactPerson: 'John Doe',
        email: 'john@test.com',
        phone: '+1234567890',
        status: 'pending',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        onboardingProgress: 50,
        documentsExpiring: 0,
        ragOverall: 'green'
      }
    ])
  }
}));

// 🟢 WORKING: Mock hooks
vi.mock('@/hooks/useDashboardData', () => ({
  useContractorsDashboardData: () => ({
    stats: {},
    trends: {},
    formatNumber: (n: number) => n.toString(),
    formatCurrency: (n: number) => `$${n}`,
    formatPercentage: (n: number) => `${n}%`,
    loadDashboardData: vi.fn()
  })
}));

// 🟢 WORKING: Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('PendingApplicationsList', () => {
  it('should render without crashing', () => {
    render(
      <TestWrapper>
        <PendingApplicationsList />
      </TestWrapper>
    );

    // Check for main heading
    expect(screen.getByText('Pending Applications')).toBeInTheDocument();
  });

  it('should render quick stats cards', () => {
    render(
      <TestWrapper>
        <PendingApplicationsList />
      </TestWrapper>
    );

    // Check for stats cards
    expect(screen.getByText('Total Applications')).toBeInTheDocument();
    expect(screen.getByText('Pending Review')).toBeInTheDocument();
    expect(screen.getByText('Under Review')).toBeInTheDocument();
    expect(screen.getByText('Avg Processing Days')).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    render(
      <TestWrapper>
        <PendingApplicationsList />
      </TestWrapper>
    );

    // Check for action buttons
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('should render with initial filters', () => {
    const initialFilter = {
      status: ['pending'] as const,
      companyName: 'Test Company'
    };

    render(
      <TestWrapper>
        <PendingApplicationsList initialFilter={initialFilter} />
      </TestWrapper>
    );

    expect(screen.getByText('Pending Applications')).toBeInTheDocument();
  });

  it('should render with custom page size', () => {
    render(
      <TestWrapper>
        <PendingApplicationsList pageSize={25} />
      </TestWrapper>
    );

    expect(screen.getByText('Pending Applications')).toBeInTheDocument();
  });
});