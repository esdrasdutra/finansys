import { Component, Injectable } from '@angular/core';
import { LancamentoService } from '../..//services/lancamentos/lancamento.service';
import { FILTROS, MESES } from 'src/app/entities/relatorios/relatorios';
import { Lancamento } from 'src/app/models/Lancamento';
import { ComunicationService } from 'src/app/services/comunication.service';
import moment from 'moment';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';

@Injectable()
export class MyCustomPaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>();

  firstPageLabel = 'Primeira Página';
  itemsPerPageLabel = 'Itens por página';
  lastPageLabel = 'Última Página';

  // You can set labels to an arbitrary string too, or dynamically compute
  // it through other third-party internationalization libraries.
  nextPageLabel = 'Avançar';
  previousPageLabel = 'Voltar';

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return 'Página 1 de 1';
    }
    const amountPages = Math.ceil(length / pageSize);
    return `Página ${page + 1} de ${amountPages}`;
  }
}

@Component({
  selector: 'app-Home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
  providers: [LancamentoService, {provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl}]
})
export class HomeComponent {
  length!: number;
  pageSize!: number;
  pageIndex!: number;
  pageSizeOptions = [10, 20, 50];

  inputValue: string = '';
  filtros = FILTROS;
  meses = MESES;
  filtroMes = '';
  dataDespesas!: Lancamento[];
  dataReceitas!: Lancamento[];
  currentMonth = moment();
  prevMonth = moment().add(-1, 'months');

  constructor(
    private lancamentoService: LancamentoService,
    private commService: ComunicationService,
  ) { }

  ngOnInit(): void {
    this.lancamentoService.getLancamentos(
      {
        "perPage": 21,
        "page": 1,
        "order": "desc"
      }
    ).subscribe((data) => {    
      this.commService.setDespesas(data.saídas, 'Home Component');
      this.commService.setReceitas(data.entradas, 'Home Component');
      this.length = data.length
    });

    this.commService.despesasList$.subscribe(data => this.dataDespesas = data);
    this.commService.receitasList$.subscribe(data => this.dataReceitas = data);
  }

  handlePageEvent(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;

    this.lancamentoService.getLancamentos(
      {
        "perPage": this.pageSize,
        "page": this.pageIndex + 1,
        "order": "desc"
      }
    ).subscribe((data) => {    
      this.commService.setDespesas(data.saídas, 'Home Component');
      this.commService.setReceitas(data.entradas, 'Home Component');
      this.length = data.pages
    });

    this.commService.despesasList$.subscribe(data => this.dataDespesas = data);
    this.commService.receitasList$.subscribe(data => this.dataReceitas = data);
  }

  onKey(event: any) {
    this.inputValue = event.target.value;
    console.log(this.inputValue);
  }

  handleChange(event: any) {
    this.filtroMes = event.target.value;
    console.log(this.filtroMes);
  }
}
