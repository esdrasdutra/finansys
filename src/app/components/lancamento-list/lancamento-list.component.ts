import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { Lancamento } from 'src/app/models/Lancamento';
import { ComunicationService } from 'src/app/services/comunication.service';
import moment from 'moment';
moment.locale('pt-br');

@Component({
  selector: 'app-lancamento-list',
  templateUrl: './lancamento-list.component.html',
  styleUrls: ['./lancamento-list.component.sass']
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

  dataDespesas: Lancamento[] = [];
  dataReceitas: Lancamento[] = []

  selectedRowIndex = -1;

  displayedColumnsLancamento = [
    'recibo', 'data_lan', 'data_ven', 'valor', 'num_doc', 'entrada', 'saida', 'cong',
    'forn', 'dizimista', 'obs', 'tipo_doc', 'conta', 'situacao', 'historico', 'status_lanc'
  ]

  @Input() tipoLancFromParent!: any;
  @Output() idLanc = new EventEmitter<Lancamento>();
  constructor(
    private elementRef: ElementRef,
    private commService: ComunicationService,
  ) { }

  ngOnInit(): void {
    this.commService.fetchData('REGISTRO ON INIT');
  }

  ngAfterViewInit(): void {
    this.commService.fetchData('REGISTRO AfterViewInit');

    this.commService.lancamentoList$.subscribe(
      (data: any) => {
        this.dataDespesas = [];
        this.dataReceitas = [];
        data.forEach((el: any) => {
          if (el.data_lan) {           
            el.data_lan = moment(el.data_lan).format("DD/MM/YYYY");
          }
          if (el.data_ven) {           
            el.data_ven = moment(el.data_ven).format("DD/MM/YYYY");
          }

          if (el.tipo_lanc === "RECEITA") {
            this.dataReceitas.push(el);
          } else if (el.tipo_lanc === "DESPESA") {
            this.dataDespesas.push(el);
          }
        });

        this.dataSourceDespesas.data = this.dataDespesas.slice();
        this.dataSourceReceitas.data = this.dataReceitas.slice();
      });
  }

  onClickRow(row: any, event: any) {
    this.selectedRowIndex = row.id
    this.commService.setLancamento(row);
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
