import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

import { Lancamento } from 'src/app/models/Lancamento';
import { FormCadastro } from 'src/enums/forms.enum';
import { ModalService } from 'src/app/services/modal.service';
import { ComunicationService } from 'src/app/services/comunication.service';

@Component({
  selector: 'app-registros',
  templateUrl: './registros.component.html',
  styleUrls: ['./registros.component.sass']
})
export class RegistrosComponent implements OnInit {

  columnMapping: { [key: string]: string } = {
    'recibo': 'RECIBO',
    'data_lan': 'LANÇAMENTO',
    'data_ven': 'VENCIMENTO',
    'tipo_doc': 'TIPO DOCUMENTO',
    'num_doc': 'Nº DOCUMENTO',
    'entrada': 'ENTRADAS',
    'saida': 'SAÍDAS',
    'cong': 'CONGREGAÇÃO',
    'forn': 'FORNECEDOR',
    'dizimista': 'NOME DO DIZIMISTA',
    'obs': 'OBS:.',
    'valor': 'VALOR',
    'conta': 'CONTA',
    'situacao': 'SITUAÇÃO',
    'historico': 'HISTÓRICO',
    'status_lanc': 'SITUAÇÃO'
  };

  title = null;

  dataSourceDespesas = new MatTableDataSource<Lancamento>();
  dataSourceReceitas = new MatTableDataSource<Lancamento>();

  dataDespesas: Lancamento[] = [];
  dataReceitas: Lancamento[] = []

  selectedRowIndex = -1;
  displayedColumnsLancamento!: string[];

  @Input() tipoLancFromParent!: any;
  @Output() idLanc = new EventEmitter<Lancamento>();
  lanc: any;
  constructor(
    private elementRef: ElementRef,
    private commService: ComunicationService,
    private modalService: ModalService,
  ) { }

  ngOnInit(): void {
    this.commService.refreshData();

    this.commService.dataChanged.subscribe({
      next: (data: any) => {
        data.forEach((el: any) => {
          if (el.tipo_lanc === "RECEITA") {
            this.dataReceitas.push(el);
            this.displayedColumnsLancamento = [
              'recibo', 'data_lan', 'data_ven', 'tipo_doc', 'num_doc', 'entrada', 'cong',
              'forn', 'dizimista', 'obs', 'valor', 'conta', 'situacao', 'historico', 'status_lanc'
            ]
          } else if (el.tipo_lanc === "DESPESA") {
            this.dataDespesas.push(el);
            this.displayedColumnsLancamento = [
              'recibo', 'data_lan', 'data_ven', 'tipo_doc', 'num_doc', 'saida', 'cong',
              'forn', 'dizimista', 'obs', 'valor', 'conta', 'situacao', 'historico', 'status_lanc'
            ]
          }
        })
        
      },
    });

    this.dataSourceDespesas.data = this.dataDespesas;
    this.dataSourceReceitas.data = this.dataReceitas;
  }


  onClickRow(row: any, event: any) {
    this.selectedRowIndex = row.id
    this.lanc = row;
    console.log(row.id);
    event.stopPropagation();
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.selectedRowIndex = -1; // Reseta o índice da linha selecionada
    }
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
    this.modalService.editLancamentoModal({
      message: 'EDITANDO LANÇAMENTO',
      buttonText: {
        ok: 'EDITAR',
        cancel: 'CANCELAR'
      },
      lancamento: this.lanc
    });
  }

  deleteLancamento(): void {
    this.modalService.deleteLancamentoModal(this.selectedRowIndex);

  }
}
