import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Employee, EmployeeAddress } from '../../../../core/models/employee.model';
import { EmployeeService } from '../../../../core/services/employee.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { EmployeeFormFieldsComponent } from '../employee-form-fields/employee-form-fields.component';

@Component({
  selector: 'app-update-employee-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    EmployeeFormFieldsComponent
  ],
  templateUrl: './update-employee-dialog.component.html',
  styleUrl: './update-employee-dialog.component.scss'
})
export class UpdateEmployeeDialogComponent {
  readonly departments = ['Engineering', 'HR', 'Finance', 'Sales', 'Operations'];
  readonly statuses = ['Active', 'Inactive'];
  readonly employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Intern'];
  readonly currencies = ['INR', 'USD', 'EUR', 'GBP'];
  readonly addressTypes = ['Permanent', 'Current', 'Other'];

  readonly form;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly employeeService: EmployeeService,
    private readonly dialogRef: MatDialogRef<UpdateEmployeeDialogComponent, boolean>,
    private readonly notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public readonly employee: Employee
  ) {
    this.form = this.formBuilder.nonNullable.group({
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
      address: this.formBuilder.array(
        (employee.address ?? []).length > 0
          ? employee.address.map((addr) => this.buildAddressGroup(addr))
          : [this.buildAddressGroup()]
      )
    });

    this.form.patchValue({
      name: employee.name,
      designation: employee.designation,
      department: employee.department,
      dob: employee.dob,
      education: employee.education,
      joiningDate: employee.joiningDate,
      experience: employee.experience,
      employmentType: employee.employmentType,
      status: employee.status,
      salary: employee.salary,
      bonus: employee.bonus,
      currency: employee.currency
    });
  }

  get addressArray(): FormArray<FormGroup> {
    return this.form.controls.address as FormArray<FormGroup>;
  }

  addAddress(): void {
    this.addressArray.push(this.buildAddressGroup());
  }

  removeAddress(index: number): void {
    if (this.addressArray.length > 1) {
      this.addressArray.removeAt(index);
    }
  }

  submit(): void {
    if (this.form.invalid || !this.employee.id) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    this.employeeService.updateEmployee(this.employee.id, {
      ...formValue,
      experience: Number(formValue.experience),
      salary: Number(formValue.salary),
      bonus: Number(formValue.bonus),
      status: formValue.status as Employee['status'],
      employmentType: formValue.employmentType as Employee['employmentType'],
      currency: formValue.currency as Employee['currency'],
      address: formValue.address.map((addr) => ({
        type: addr['type'] as EmployeeAddress['type'],
        line1: addr['line1'],
        line2: addr['line2'],
        city: addr['city'],
        state: addr['state'],
        pincode: Number(addr['pincode'])
      }))
    }).subscribe({
      next: () => {
        this.notificationService.success('Employee updated successfully');
        this.dialogRef.close(true);
      },
      error: () => {
        this.notificationService.error('Unable to update employee. Please try again.');
      }
    });
  }

  private buildAddressGroup(addr?: Partial<EmployeeAddress>): FormGroup {
    return this.formBuilder.nonNullable.group({
      type: [addr?.type ?? 'Permanent', Validators.required],
      line1: [addr?.line1 ?? '', Validators.required],
      line2: [addr?.line2 ?? ''],
      city: [addr?.city ?? '', Validators.required],
      pincode: [addr?.pincode ?? 0, [Validators.required, Validators.min(1000)]],
      state: [addr?.state ?? '', Validators.required]
    });
  }
}
