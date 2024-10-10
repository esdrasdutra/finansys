import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Lancamento } from '../..//models/Lancamento';
import moment from 'moment';
import { LancamentoService } from '../..//services/lancamentos/lancamento.service';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { PaginatorIntl } from '../..//services/paginator-intl.service';
import { ComunicationService } from 'src/app/services/comunication.service';
import { COLUMNMAPPING } from 'src/app/entities/relatorios/relatorios';
moment.locale('pt-br');

@Component({
  selector: 'app-lancamento-list',
  templateUrl: './lancamento-list.component.html',
  styleUrls: ['./lancamento-list.component.sass'],
  providers: [{provide: MatPaginatorIntl, useClass: PaginatorIntl}]
})
export class LancamentoListComponent {

  columnMapping = COLUMNMAPPING;

  title = null;

  dataSourceDespesas = new MatTableDataSource<Lancamento>();
  dataSourceReceitas = new MatTableDataSource<Lancamento>();

  selectedRowIndex = -1;

  displayedColumnsLancamento = [
    'recibo', 'data_lan', 'data_ven', 'valor', 'num_doc', 'entrada', 'saida', 'cong',
    'forn', 'dizimista', 'obs', 'tipo_doc', 'conta', 'situacao', 'historico', 'status_lanc'
  ];

  displayDespesas: boolean = true
  displayReceitas!: boolean

  @Input() tipoLancFromParent!: any;  
  @Input() dataDespesas!: Lancamento[];
  @Input() dataReceitas!: Lancamento[];
  @Input() filtroMes!: string;
  @Output() idLanc = new EventEmitter<Lancamento>();  
  constructor(
    private elementRef: ElementRef,
    private lancamentoService: LancamentoService,
  ) { }

  ngOnChanges(): void {
    console.log(this.dataReceitas);

    this.dataSourceDespesas.data = this.dataDespesas;
    this.dataSourceReceitas.data = this.dataReceitas;
  }

  onClickRow(row: any, event: any) {
    this.selectedRowIndex = row.id
    this.lancamentoService.setLancamento(row);
    event.stopPropagation();
  }

  changeTable(event: any) {
    if (event.target.innerText === 'DESPESAS') {
      this.displayDespesas = true
      this.displayReceitas = false
    }
    if (event.target.innerText === 'RECEITAS') {
      this.displayReceitas = true
      this.displayDespesas = false
    }
  }
    

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.selectedRowIndex = -1; // Reseta o índice da linha selecionada
    }
  }
}
