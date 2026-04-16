export interface EmployeeAddress {
  type: 'Permanent' | 'Current' | 'Other';
  line1: string;
  line2: string;
  city: string;
  pincode: number;
  state: string;
}

export type EmployeeStatus = 'Active' | 'Inactive';

export interface Employee {
  id?: string;
  name: string;
  designation: string;
  department: string;
  dob: string;
  address: EmployeeAddress[];
  education: string;
  joiningDate: string;
  experience: number;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  status: EmployeeStatus;
  salary: number;
  bonus: number;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
}

export interface EmployeeListResponse {
  total: number;
  page: number;
  limit: number;
  data: Employee[];
}

export interface EmployeeFilters {
  search: string;
  department: string;
  designation: string;
  status: string;
}
