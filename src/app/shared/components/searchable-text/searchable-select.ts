import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  computed,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SearchableSelectItem {
  id: number;
  label: string;
}

@Component({
  selector: 'app-searchable-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './searchable-select.html',
  styleUrl: './searchable-select.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchableSelectComponent implements OnChanges {
  @Input() label = '';
  @Input() placeholder = 'Buscar...';
  @Input() items: SearchableSelectItem[] = [];
  @Input() selected_id = 0;
  @Input() empty_text = 'No hay resultados.';
  @Input() required = false;

  @Output() selected_id_change = new EventEmitter<number>();

  readonly search_text = signal('');
  readonly display_text = signal('');
  readonly is_open = signal(false);

  readonly filtered_items = computed(() => {
    const query = this.search_text().trim().toLowerCase();

    if (!query) {
      return this.items;
    }

    return this.items.filter(item =>
      item.label.toLowerCase().includes(query)
    );
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selected_id'] || changes['items']) {
      this.SyncDisplayTextWithSelection();
    }
  }

  private SyncDisplayTextWithSelection(): void {
    if (!this.selected_id) {
      this.display_text.set('');
      return;
    }

    const selected_item = this.items.find(item => item.id === this.selected_id);

    if (!selected_item) {
      this.display_text.set('');
      return;
    }

    this.display_text.set(selected_item.label);
  }

  Open(): void {
    this.is_open.set(true);

    if (this.selected_id > 0) {
      this.search_text.set('');
    }
  }

  Close(): void {
    this.is_open.set(false);
    this.search_text.set('');
    this.SyncDisplayTextWithSelection();
  }

  Toggle(): void {
    if (this.is_open()) {
      this.Close();
      return;
    }

    this.Open();
  }

  OnInputChange(value: string): void {
    this.display_text.set(value);
    this.search_text.set(value);
    this.is_open.set(true);
  }

  SelectItem(item_id: number): void {
    const selected_item = this.items.find(item => item.id === item_id);

    this.selected_id_change.emit(item_id);
    this.search_text.set('');
    this.display_text.set(selected_item?.label ?? '');
    this.is_open.set(false);
  }

  ClearSelection(): void {
    this.selected_id_change.emit(0);
    this.search_text.set('');
    this.display_text.set('');
    this.is_open.set(false);
  }
}