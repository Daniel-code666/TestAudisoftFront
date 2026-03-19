import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {
  readonly sidebar_open = signal(false);
  readonly loading_service = inject(LoadingService);
  readonly is_loading = this.loading_service.is_loading;

  ToggleSidebar(): void {
    this.sidebar_open.update(value => !value);
  }

  CloseSidebar(): void {
    this.sidebar_open.set(false);
  }
}