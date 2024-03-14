import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import moment from 'moment';
import { Lancamento } from '../../models/Lancamento';
import { LancamentoService } from '../../services/lancamentos/lancamento.service';
import { PaginatorIntl } from '../../services/paginator-intl.service';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.sass'],
  providers: [{provide: MatPaginatorIntl, useClass: PaginatorIntl}]
})
export class PaginatorComponent implements OnInit {
  currentPage = 1;
  pageSize = 20;
  dataDespesas!: Lancamento[];
  dataReceitas!: Lancamento[];

  @Output() _currentPage = new EventEmitter<number>();
  @Output() _pageSize = new EventEmitter<number>();
  constructor(
    private lancamentoService: LancamentoService,
  ) { }

  ngOnInit(): void {
    console.log(this.currentPage);
    
  }
  
  handlePageEvent(pageEvent: PageEvent){
    this.currentPage = pageEvent.pageIndex;
    this.pageSize = pageEvent.pageSize;

    console.log('handgleEvent', pageEvent);
  }

}
