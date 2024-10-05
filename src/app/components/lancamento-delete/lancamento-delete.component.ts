import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { first } from 'rxjs';
import { LancamentoService } from '../..//services/lancamentos/lancamento.service';
import { Lancamento } from 'src/app/models/Lancamento';
import { ComunicationService } from 'src/app/services/comunication.service';

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
    private commService: ComunicationService,    
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<LancamentoDeleteComponent>,
    private lancamentoService: LancamentoService) {
    if (data) {
      this.idLancamento = data;
      this.message = data.message || this.message;
      if (data.buttonText) {
        this.confirmButtonText = data.buttonText.ok || this.confirmButtonText;
        this.cancelButtonText = data.buttonText.cancel || this.cancelButtonText;
      }
    }
  }

  private deleteLancamento(idLancamento: any) {
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
