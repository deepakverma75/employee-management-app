import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private readonly snackBar: MatSnackBar) {}

  success(message: string): void {
    this.snackBar.open(`Success:\n${message}`, undefined, {
      duration: 4200,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['app-toast', 'app-toast-success']
    });
  }

  error(message: string): void {
    this.snackBar.open(`Error:\n${message}`, undefined, {
      duration: 4200,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['app-toast', 'app-toast-error']
    });
  }
}
