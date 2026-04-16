import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loader-overlay',
  imports: [MatProgressSpinnerModule, AsyncPipe],
  templateUrl: './loader-overlay.component.html',
  styleUrl: './loader-overlay.component.scss'
})
export class LoaderOverlayComponent {
  readonly isLoading$;

  constructor(private readonly loadingService: LoadingService) {
    this.isLoading$ = this.loadingService.isLoading$;
  }
}
