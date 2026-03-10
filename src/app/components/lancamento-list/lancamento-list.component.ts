import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Lancamento } from '../..//models/Lancamento';
import moment from 'moment';
import { LancamentoService } from '../..//services/lancamentos/lancamento.service';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { PaginatorIntl } from '../..//services/paginator-intl.service';
import { ComunicationService } from 'src/app/services/comunication.service';
import { Inflows } from '../../enums/inflows.enum';
import { Outflows } from '../../enums/outflows.enum';
import { Account } from '../../enums/account.enum';
moment.locale('pt-br');

@Component({
  selector: 'app-lancamento-list',
  templateUrl: './lancamento-list.component.html',
  styleUrls: ['./lancamento-list.component.sass'],
  providers: [{provide: MatPaginatorIntl, useClass: PaginatorIntl}]
})
export class LancamentoListComponent implements OnInit, OnChanges {

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

  currentMonth = moment();

  prevMonth = moment().add(-1, 'months');


  selectedRowIndex = -1;

  displayedColumnsLancamento = [
    'recibo', 'data_lan', 'data_ven', 'valor', 'num_doc', 'entrada', 'saida', 'cong',
    'forn', 'dizimista', 'obs', 'tipo_doc', 'conta', 'situacao', 'historico', 'status_lanc'
  ]

  @Input() tipoLancFromParent!: any;
  @Input() filterEntradaInput: string = '';
  @Input() filterSaidaInput: string = '';
  @Input() filterContaInput: string = '';
  @Input() filterSituacaoInput: string = '';
  @Input() filterTipoDocInput: string = '';
  @Output() idLanc = new EventEmitter<Lancamento>();  

  // Filtros
  filterEntrada: string = '';
  filterSaida: string = '';
  filterConta: string = '';
  filterSituacao: string = '';
  filterTipoDoc: string = '';

  // Opções para filtros
  inflowsOptions = Object.values(Inflows);
  outflowsOptions = Object.values(Outflows);
  accountOptions = Object.values(Account);
  situacaoOptions = ['PAGO', 'PENDENTE', 'VENCIDO']; // Ajustar conforme necessário
  tipoDocOptions = ['RECIBO', 'NOTA FISCAL', 'OUTROS']; // Ajustar conforme necessário

  constructor(
    private elementRef: ElementRef,
    private lancamentoService: LancamentoService,
    private commService: ComunicationService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filterEntradaInput']) {
      this.filterEntrada = this.filterEntradaInput;
    }
    if (changes['filterSaidaInput']) {
      this.filterSaida = this.filterSaidaInput;
    }
    if (changes['filterContaInput']) {
      this.filterConta = this.filterContaInput;
    }
    if (changes['filterSituacaoInput']) {
      this.filterSituacao = this.filterSituacaoInput;
    }
    if (changes['filterTipoDocInput']) {
      this.filterTipoDoc = this.filterTipoDocInput;
    }
    this.applyFilters();
  }

  ngOnInit(): void {
    this.commService.despesasList$.subscribe(
      {
        next: (data) => {
          this.dataDespesas = data;
          this.applyFilters();
        },
        error: (err) => console.log(err),
      }
    )

    this.commService.receitasList$.subscribe(
      {
        next: (data) => {
          this.dataReceitas = data;
          this.applyFilters();
        },
        error: (err) => console.log(err),
      }
    )
  }

  applyFilters(): void {
    // Filtrar despesas
    this.dataSourceDespesas.data = this.dataDespesas.filter((el: any) => {
      const dataLancamento = moment(el.data_lan);
      const matchesDate = (
        (dataLancamento.month() === this.prevMonth.month() || dataLancamento.month() === this.currentMonth.month()) 
        && dataLancamento.year() === this.currentMonth.year() - 1
      );
      const matchesEntrada = !this.filterEntrada || el.entrada === this.filterEntrada;
      const matchesSaida = !this.filterSaida || el.saida === this.filterSaida;
      const matchesConta = !this.filterConta || el.conta === this.filterConta;
      const matchesSituacao = !this.filterSituacao || el.situacao === this.filterSituacao;
      const matchesTipoDoc = !this.filterTipoDoc || el.tipo_doc === this.filterTipoDoc;
      return matchesDate && matchesEntrada && matchesSaida && matchesConta && matchesSituacao && matchesTipoDoc;
    });

    // Filtrar receitas
    this.dataSourceReceitas.data = this.dataReceitas.filter((el: any) => {
      const dataLancamento = moment(el.data_lan);
      const matchesDate = (
        (dataLancamento.month() === this.prevMonth.month() || dataLancamento.month() === this.currentMonth.month()) 
        && dataLancamento.year() === this.currentMonth.year() - 1
      );
      const matchesEntrada = !this.filterEntrada || el.entrada === this.filterEntrada;
      const matchesSaida = !this.filterSaida || el.saida === this.filterSaida;
      const matchesConta = !this.filterConta || el.conta === this.filterConta;
      const matchesSituacao = !this.filterSituacao || el.situacao === this.filterSituacao;
      const matchesTipoDoc = !this.filterTipoDoc || el.tipo_doc === this.filterTipoDoc;
      return matchesDate && matchesEntrada && matchesSaida && matchesConta && matchesSituacao && matchesTipoDoc;
    });
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
