import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { Employee } from '../../../core/models/employee.model';
import { CanComponentDeactivate } from '../../../core/guards/pending-changes.guard';
import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EmployeeFormFieldsComponent } from '../components/employee-form-fields/employee-form-fields.component';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-add-employee',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    EmployeeFormFieldsComponent
  ],
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.scss'
})
export class AddEmployeeComponent implements CanComponentDeactivate {
  readonly departments = ['Engineering', 'HR', 'Finance', 'Sales', 'Operations'];
  readonly statuses = ['Active', 'Inactive'];
  readonly employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Intern'];
  readonly currencies = ['INR', 'USD', 'EUR', 'GBP'];
  readonly addressTypes = ['Permanent', 'Current', 'Other'];

  submitted = false;

  readonly form;

  constructor(
    private readonly fb: FormBuilder,
    private readonly employeeService: EmployeeService,
    private readonly router: Router,
    private readonly notificationService: NotificationService,
    private readonly dialog: MatDialog
  ) {
    this.form = this.fb.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      designation: ['', Validators.required],
      department: ['', Validators.required],
      dob: ['', Validators.required],
      education: [''],
      joiningDate: ['', Validators.required],
      experience: [0, [Validators.required, Validators.min(0)]],
      employmentType: ['Full-time', Validators.required],
      status: ['Active', Validators.required],
      salary: [0, [Validators.required, Validators.min(1)]],
      bonus: [0, [Validators.required, Validators.min(0)]],
      currency: ['INR', Validators.required],
      address: this.fb.array([this.createAddressForm()])
    });
  }

  get addressArray(): FormArray<FormGroup> {
    return this.form.controls.address;
  }

  addAddress(): void {
    this.addressArray.push(this.createAddressForm());
  }

  removeAddress(index: number): void {
    if (this.addressArray.length > 1) {
      this.addressArray.removeAt(index);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Employee = {
      ...(this.form.getRawValue() as Employee),
      experience: Number(this.form.value.experience),
      salary: Number(this.form.value.salary),
      bonus: Number(this.form.value.bonus),
      address: (this.form.value.address ?? []).map((item) => ({
        ...item,
        pincode: Number(item.pincode)
      }))
    };

    this.employeeService.createEmployee(payload).subscribe({
      next: () => {
        this.submitted = true;
        this.notificationService.success('Employee created successfully');
        this.form.markAsPristine();
        this.router.navigateByUrl('/employees');
      },
      error: () => {
        this.notificationService.error('Unable to create employee. Please try again.');
      }
    });
  }

  canDeactivate() {
    if (this.form.pristine || this.submitted) {
      return true;
    }

    return this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Unsaved Changes',
          message: 'You have unsaved changes. Leave this page anyway?',
          confirmText: 'Leave'
        }
      })
      .afterClosed();
  }

  private createAddressForm(): FormGroup {
    return this.fb.nonNullable.group({
      type: ['Permanent', Validators.required],
      line1: ['', Validators.required],
      line2: [''],
      city: ['', Validators.required],
      pincode: [0, [Validators.required, Validators.min(1000)]],
      state: ['', Validators.required]
    });
  }
}
