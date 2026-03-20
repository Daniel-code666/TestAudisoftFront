import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-modal.html',
  styleUrl: './error-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorModalComponent {
  @Input() is_open = false;
  @Input() title = 'Ocurrió un error';
  @Input() message = 'No fue posible completar la operación.';

  @Output() close = new EventEmitter<void>();

  OnClose(): void {
    this.close.emit();
  }
}