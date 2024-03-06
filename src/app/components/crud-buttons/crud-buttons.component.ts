import { Component } from '@angular/core';
import { ComunicationService } from 'src/app/services/comunication.service';
import { LancamentoService } from 'src/app/services/lancamentos/lancamento.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-crud-buttons',
  templateUrl: './crud-buttons.component.html',
  styleUrls: ['./crud-buttons.component.sass']
})
export class CrudButtonsComponent {
  lanc!: any;

  constructor(
    private modalService: ModalService,
    private lancamentoService: LancamentoService,
  ){

  }

  ngAfterViewInit(){    
    this.lancamentoService.selectedLancamento$.subscribe(
      (data: any) => {
        this.lanc = data
      }
    );
  }

  addLancamentoModal() {
    this.modalService.openLancamentoModal({
      message: 'LANÇANDO NOVA MOVIMENTAÇÃO',
      buttonText: {
        ok: 'LANÇAR',
        cancel: 'CANCELAR'
      }
    });
  }

  editLancamento(): void {
    if (!this.lanc) {
      return
    }
    this.modalService.editLancamentoModal({
      message: 'EDITANDO LANÇAMENTO',
      buttonText: {
        ok: 'EDITAR',
        cancel: 'CANCELAR'
      },
      lancamento: this.lanc,
    });
  }

  deleteLancamento(): void {
    if (!this.lanc) {
      return
    }
    this.modalService.deleteLancamentoModal(this.lanc);

  }
}
