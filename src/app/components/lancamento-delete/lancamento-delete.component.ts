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
          this.lancamentoService.getLancamentos().subscribe(
            (data: any) => {
              let dataDespesas: Lancamento[] = [];
              let dataReceitas: Lancamento[] = [];
              data.forEach((el: any) => {
                if (el.tipo_lanc === "RECEITA") {
                  dataReceitas.push(el);
                } else if (el.tipo_lanc === "DESPESA") {
                  dataDespesas.push(el);
                }
              });
              this.commService.setDespesas(dataDespesas, 'DELET COMPONENT');
              this.commService.setReceitas(dataReceitas, 'DELET COMPONENT');
              
              localStorage.setItem('DESPESAS', JSON.stringify(dataDespesas));
              localStorage.setItem('RECEITAS', JSON.stringify(dataReceitas));
            });
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
