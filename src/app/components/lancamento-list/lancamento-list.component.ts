import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Lancamento } from '../..//models/Lancamento';
import moment from 'moment';
import { LancamentoService } from '../..//services/lancamentos/lancamento.service';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { PaginatorIntl } from '../..//services/paginator-intl.service';
import { ComunicationService } from 'src/app/services/comunication.service';
moment.locale('pt-br');

@Component({
  selector: 'app-lancamento-list',
  templateUrl: './lancamento-list.component.html',
  styleUrls: ['./lancamento-list.component.sass'],
  providers: [{provide: MatPaginatorIntl, useClass: PaginatorIntl}]
})
export class LancamentoListComponent implements OnInit {

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

  dataDespesas: any = [];
  dataReceitas: any = [];

  selectedRowIndex = -1;

  displayedColumnsLancamento = [
    'recibo', 'data_lan', 'data_ven', 'valor', 'num_doc', 'entrada', 'saida', 'cong',
    'forn', 'dizimista', 'obs', 'tipo_doc', 'conta', 'situacao', 'historico', 'status_lanc'
  ]

  @Input() tipoLancFromParent!: any;
  @Output() idLanc = new EventEmitter<Lancamento>();  
  constructor(
    private elementRef: ElementRef,
    private lancamentoService: LancamentoService,
    private commService: ComunicationService,
  ) { }

  ngOnInit(): void {
    let today = Date.now()

    this.commService.despesasList$.subscribe(
      {
        next: (data) => { 
          this.dataSourceDespesas.data = data.filter((el: any) => moment(el.data_lan).month() === 2 || moment(el.data_lan).month() === 3);
        },
        error: (err) => console.log(err),
      }
    )

    this.commService.receitasList$.subscribe(
      {
        next: (data) => {
          this.dataSourceReceitas.data = data.filter((el: any) => moment(el.data_lan).month() === 2 || moment(el.data_lan).month() === 3);
        },
        error: (err) => console.log(err),
      }
    )
  }

  onClickRow(row: any, event: any) {
    this.selectedRowIndex = row.id
    this.lancamentoService.setLancamento(row);
    event.stopPropagation();
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.selectedRowIndex = -1; // Reseta o índice da linha selecionada
    }
  }
}
