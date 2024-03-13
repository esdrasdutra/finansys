import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { Congregation } from 'src/app/enums/congregation.enum';
import { Lancamento } from 'src/app/models/Lancamento';
import { LancamentoService } from 'src/app/services/lancamentos/lancamento.service';
import { PaginatorIntl } from 'src/app/services/paginator-intl.service';

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
    this.lancamentoService.getLancamentos(this.currentPage, this.pageSize).subscribe(
      (data: any) => {
        this.dataDespesas = [];
        this.dataReceitas = [];
        
        data.forEach((el: any) => {
          if (el.data_lan || el.data_ven) {           
            el.data_lan = moment(el.data_lan).format("DD/MM/YYYY");
            el.data_ven = moment(el.data_ven).format("DD/MM/YYYY")
          }

          if (el.tipo_lanc === "RECEITA") {
            this.dataReceitas.push(el);
          } else if (el.tipo_lanc === "DESPESA") {
            this.dataDespesas.push(el);
          }
        });
        
        this.lancamentoService.setDespesas(this.dataDespesas);
        this.lancamentoService.setReceitas(this.dataReceitas);
    });    
  }
  
  handlePageEvent(pageEvent: PageEvent){
    this.currentPage = pageEvent.pageIndex;
    this.pageSize = pageEvent.pageSize;

    this.lancamentoService.getLancamentos(this.currentPage + 1, this.pageSize).subscribe(
      (data: any) => {
        this.dataDespesas = [];
        this.dataReceitas = [];
        
        data.forEach((el: any) => {
          if (el.data_lan || el.data_ven) {           
            el.data_lan = moment(el.data_lan).format("DD/MM/YYYY");
            el.data_ven = moment(el.data_ven).format("DD/MM/YYYY")
          }

          if (el.tipo_lanc === "RECEITA") this.dataReceitas.push(el);
          if (el.tipo_lanc === "DESPESA") this.dataDespesas.push(el);
      
          this.lancamentoService.setReceitas(this.dataReceitas);          
          this.lancamentoService.setDespesas(this.dataDespesas);
        });
    }); 

    console.log('handgleEvent', pageEvent);
  }

}
