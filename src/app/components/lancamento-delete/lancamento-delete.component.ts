import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { first } from 'rxjs';
import { LancamentoService } from '../..//services/lancamentos/lancamento.service';

@Component({
  selector: 'app-lancamento-delete',
  templateUrl: './lancamento-delete.component.html',
  styleUrls: ['./lancamento-delete.component.sass']
})
export class LancamentoDeleteComponent {
  message: string = "Você tem certeza?"
  confirmButtonText = "Sim"
  cancelButtonText = "Cancelar"
  idLancamento!: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<LancamentoDeleteComponent>,
    private lancamentoService: LancamentoService) {
    if (data) {
      console.log(data, 'ID LANCAMENTO IN THE INITIALIZATION');
      this.idLancamento = data;
      this.message = data.message || this.message;
      if (data.buttonText) {
        this.confirmButtonText = data.buttonText.ok || this.confirmButtonText;
        this.cancelButtonText = data.buttonText.cancel || this.cancelButtonText;
      }
    }
  }

  private deleteLancamento(idLancamento: any) {
    console.log(idLancamento, 'ID LANCAMENTO IN THE METHOD');

    this.lancamentoService.deleteLancamento(idLancamento)
      .pipe(first())
      .subscribe({
        next: () => {
          console.log('COMPLETE');
        },
        error: (err) => console.log(err),
      })
    
  }

  onConfirmClick(): void {
    this.deleteLancamento(this.idLancamento);    
    this.dialogRef.close(true);
  }
}
