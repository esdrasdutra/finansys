import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LancamentosComponent } from '../pages/lancamentos/lancamentos.component';

@Injectable({
  providedIn: 'root',
})
export class ModalService {

  constructor(public dialog: MatDialog) { }

  openLancamentoModal(): void {
    this.dialog.open(LancamentosComponent, {
      width: '700px'
    });
  }
}