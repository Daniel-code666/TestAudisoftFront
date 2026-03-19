import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmModalComponent {
  @Input() is_open = false;
  @Input() title = 'Confirmar acción';
  @Input() message = '¿Desea continuar?';
  @Input() confirm_text = 'Confirmar';
  @Input() cancel_text = 'Cancelar';
  @Input() confirm_button_class = 'btn btn-danger';

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  OnClose(): void {
    this.close.emit();
  }

  OnConfirm(): void {
    this.confirm.emit();
  }
}