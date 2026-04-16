import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-employee-form-fields',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './employee-form-fields.component.html',
  styleUrl: './employee-form-fields.component.scss'
})
export class EmployeeFormFieldsComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) addressArray!: FormArray<FormGroup>;
  @Input({ required: true }) departments!: string[];
  @Input({ required: true }) statuses!: string[];
  @Input({ required: true }) employmentTypes!: string[];
  @Input({ required: true }) currencies!: string[];
  @Input({ required: true }) addressTypes!: string[];
  @Input() showSectionLabels = true;

  @Output() addAddressClicked = new EventEmitter<void>();
  @Output() removeAddressClicked = new EventEmitter<number>();

  addAddress(): void {
    this.addAddressClicked.emit();
  }

  removeAddress(index: number): void {
    this.removeAddressClicked.emit(index);
  }
}
