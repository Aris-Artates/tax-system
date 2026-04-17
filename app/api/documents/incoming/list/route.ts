import { NextResponse } from 'next/server';

import { authorize } from '@/lib/auth-guard';

export async function GET() {
  if (!(await authorize('document', 'can_view'))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
  }

  // Mock data simulating Supabase response for incoming documents
  const mockDocuments = [
    {
      id: 1,
      reference_no: 'DOC-2024-001',
      type: 'Tax Declaration Submission',
      sender: 'Juan Dela Cruz',
      received_date: '2024-10-15T09:30:00Z',
      status: 'Pending Review'
    },
    {
      id: 2,
      reference_no: 'DOC-2024-002',
      type: 'Payment Receipt',
      sender: 'Maria Santos',
      received_date: '2024-10-14T14:20:00Z',
      status: 'Pending Assignment'
    },
    {
      id: 3,
      reference_no: 'DOC-2024-003',
      type: 'Property Transfer Request',
      sender: 'Barangay Captain Poblacion',
      received_date: '2024-10-13T11:10:00Z',
      status: 'Reviewed'
    },
    {
      id: 4,
      reference_no: 'DOC-2024-004',
      type: 'Assessment Appeal',
      sender: 'Pedro Reyes',
      received_date: '2024-10-12T16:45:00Z',
      status: 'Pending Review'
    },
    {
      id: 5,
      reference_no: 'DOC-2024-005',
      type: 'Tax Exemption Application',
      sender: 'Sta. Rita Church',
      received_date: '2024-10-11T10:00:00Z',
      status: 'Filed'
    },
    {
      id: 6,
      reference_no: 'DOC-2024-006',
      type: 'Billing Adjustment Request',
      sender: 'Luzviminda Corp',
      received_date: '2024-10-10T13:30:00Z',
      status: 'Pending Assignment'
    },
    {
      id: 7,
      reference_no: 'DOC-2024-007',
      type: 'Delinquency Waiver',
      sender: 'Jose Rizal St. Resident Assoc.',
      received_date: '2024-10-09T08:15:00Z',
      status: 'Reviewed'
    }
  ];

  return NextResponse.json({
    documents: mockDocuments
  });
}

