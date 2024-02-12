import { EventEmitter, Injectable, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LancamentoAddComponent } from '../pages/lancamento-add/lancamento-add.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ComunicationService } from './comunication.service';
import { LancamentoDeleteComponent } from '../components/lancamento-delete/lancamento-delete.component';

@Injectable({
  providedIn: 'root',
})
export class ModalService {

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    ) { }

  openLancamentoModal(data: any): void {
    const dialogRef = this.dialog.open(LancamentoAddComponent, {
      data: data,
      width: '900px'
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {        
        this.snackBar.open('Lancamento Incluido com sucesso.', 'X', { duration: 1500})
      }
    });
    
  }

  editLancamentoModal(data:any): void {        
    const dialogRef = this.dialog.open(LancamentoAddComponent, {
      data: data,      
      width: '900px',
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.snackBar.open('Lancamento Editado com sucesso.', 'X', { duration: 1500})
      }
    })
  }

  deleteLancamentoModal(data: any): void {
    const dialogRef = this.dialog.open(LancamentoDeleteComponent, {
      data: data,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.snackBar.open('Lancamento Excluído com sucesso.', 'X', { duration: 1500})
      }
    })
  }
}