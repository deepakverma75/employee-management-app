import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'employeeSalary'
})
export class EmployeeSalaryPipe implements PipeTransform {
  transform(value: number, currencyCode: string): string {
    if (value == null || Number.isNaN(Number(value))) {
      return '-';
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'INR',
      maximumFractionDigits: 0
    }).format(value);
  }
}
