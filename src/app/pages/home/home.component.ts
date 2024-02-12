import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Lancamento } from 'src/app/models/Lancamento';
import { LancamentoService } from 'src/app/services/lancamentos/lancamento.service';
import { FormCadastro } from 'src/enums/forms.enum';
import { MatSort } from '@angular/material/sort';
import { ModalService } from 'src/app/services/modal.service';
import { ComunicationService } from 'src/app/services/comunication.service';


@Component({
  selector: 'app-Home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
  providers: [LancamentoService]
})
export class HomeComponent implements OnInit {
  @Output() outputLancDes = new EventEmitter<string>;
  @Output() outputLancRec = new EventEmitter<string>;
  @Input() lanc!: any;

  form = FormCadastro;
  form_values: any = Object.values(FormCadastro);
  title = null;
  data: Lancamento[] = [];

  lanc_despesas!: Lancamento[];
  lanc_receitas!: Lancamento[];
  constructor(
    private modalService: ModalService,
  ) { }

  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  ngOnInit(): void {
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

  getIdLanc(event: any) {
    console.log(event);
    this.lanc = event;
  }
}
