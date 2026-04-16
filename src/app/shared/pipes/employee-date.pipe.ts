import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'employeeDate'
})
export class EmployeeDatePipe implements PipeTransform {
  private readonly datePipe = new DatePipe('en-US');

  transform(value: string | Date | null | undefined, format = 'dd MMM yyyy'): string {
    if (!value) {
      return '-';
    }

    return this.datePipe.transform(value, format) ?? '-';
  }
}
