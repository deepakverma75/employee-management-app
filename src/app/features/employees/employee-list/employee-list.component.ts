import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { Employee, EmployeeFilters } from '../../../core/models/employee.model';
import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { EmployeeDatePipe } from '../../../shared/pipes/employee-date.pipe';
import { EmployeeSalaryPipe } from '../../../shared/pipes/employee-salary.pipe';
import { UpdateEmployeeDialogComponent } from '../components/update-employee-dialog/update-employee-dialog.component';

@Component({
  selector: 'app-employee-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatButtonToggleModule,
    MatChipsModule,
    EmployeeDatePipe,
    EmployeeSalaryPipe
  ],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  employees: Employee[] = [];
  displayedColumns = ['name', 'department', 'designation', 'joiningDate', 'salary', 'status', 'actions'];

  viewMode: 'table' | 'card' = 'table';
  total = 0;
  pageSize = 5;
  pageIndex = 0;
  currentSort: Sort = { active: '', direction: '' };

  filterOptions = {
    departments: [] as string[],
    designations: [] as string[],
    statuses: ['Active', 'Inactive']
  };

  flippedCards = new Set<string>();

  readonly filterForm;

  constructor(
    private readonly fb: FormBuilder,
    private readonly employeeService: EmployeeService,
    private readonly dialog: MatDialog,
    private readonly notificationService: NotificationService
  ) {
    this.filterForm = this.fb.nonNullable.group({
      search: [''],
      department: [''],
      designation: [''],
      status: ['']
    });
  }

  ngOnInit(): void {
    this.filterForm.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadEmployees();
      });

    this.loadFilterOptions();
    this.loadEmployees();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEmployees();
  }

  setView(view: 'table' | 'card'): void {
    this.viewMode = view;
  }

  onSortChange(sort: Sort): void {
    this.currentSort = sort;
    this.employees = this.getSortedEmployees([...this.employees]);
  }

  openEditDialog(employee: Employee): void {
    this.dialog
      .open(UpdateEmployeeDialogComponent, {
        data: employee,
        width: '720px'
      })
      .afterClosed()
      .subscribe((updated) => {
        if (updated) {
          this.loadEmployees();
        }
      });
  }

  confirmDelete(employee: Employee): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Delete Employee',
          message: `Are you sure you want to delete ${employee.name}?`,
          confirmText: 'Delete'
        }
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed && employee.id) {
          this.employeeService.deleteEmployee(employee.id).subscribe({
            next: () => {
              this.notificationService.success('Employee deleted successfully');
              this.loadEmployees();
            },
            error: () => {
              this.notificationService.error('Unable to delete employee. Please try again.');
            }
          });
        }
      });
  }

  toggleCard(employeeId: string | undefined): void {
    if (!employeeId) {
      return;
    }

    if (this.flippedCards.has(employeeId)) {
      this.flippedCards.delete(employeeId);
      return;
    }

    this.flippedCards.add(employeeId);
  }

  isFlipped(employeeId: string | undefined): boolean {
    return employeeId ? this.flippedCards.has(employeeId) : false;
  }

  private loadEmployees(): void {
    const filters = this.filterForm.getRawValue() as EmployeeFilters;
    this.employeeService.getEmployees(this.pageIndex + 1, this.pageSize, filters).subscribe({
      next: (response) => {
        this.employees = this.getSortedEmployees([...response.data]);
        this.total = response.total;
      },
      error: () => {
        this.notificationService.error('Unable to fetch employees. Please refresh and try again.');
      }
    });
  }

  private loadFilterOptions(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (response) => {
        const employees = response.data;
        this.filterOptions.departments = [...new Set(employees.map((emp) => emp.department))].sort();
        this.filterOptions.designations = [...new Set(employees.map((emp) => emp.designation))].sort();
      },
      error: () => {
        this.notificationService.error('Unable to load filter options. Please refresh and try again.');
      }
    });
  }

  private getSortedEmployees(items: Employee[]): Employee[] {
    const { active, direction } = this.currentSort;
    if (!active || direction === '') {
      return items;
    }

    const factor = direction === 'asc' ? 1 : -1;

    const valueByColumn: Record<string, (employee: Employee) => string | number> = {
      name: (employee) => employee.name.toLowerCase(),
      joiningDate: (employee) => new Date(employee.joiningDate).getTime(),
      salary: (employee) => employee.salary,
      status: (employee) => employee.status.toLowerCase()
    };

    const getValue = valueByColumn[active];
    if (!getValue) {
      return items;
    }

    return items.sort((a, b) => {
      const left = getValue(a);
      const right = getValue(b);

      const compare =
        typeof left === 'string' && typeof right === 'string'
          ? left.localeCompare(right)
          : Number(left) - Number(right);

      return compare * factor;
    });
  }
}
