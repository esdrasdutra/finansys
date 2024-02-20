import { Component, OnInit } from '@angular/core';
import moment from 'moment';
moment.locale('pt-br');
import { Lancamento } from 'src/app/models/Lancamento';
import { ComunicationService } from 'src/app/services/comunication.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit {
  data: any = [];

  selectedMonth!: string;

  despesasList: Lancamento[] = [];
  receitasList: Lancamento[] = [];

  inflowByMonth: Lancamento[] = [];
  outflowByMonth: Lancamento[] = [];

  valorTotalReceita = 0;
  valorTotalDepesas = 0;

  meses = [
    'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ];

  saldoMensal: any;

  constructor(
    private commService: ComunicationService,
  ) { }

  ngOnInit(): void {
    this.commService.fetchData('Dashboard OnInit');

    this.commService.despesasList$.subscribe(
      (data: any) => {
        this.despesasList = data
      });

    this.commService.receitasList$.subscribe(
      (data: any) => {
        this.receitasList = data
      });
    this.selectDataByMonth('JANEIRO');      
  }

  onChange(event: any): void {
    this.valorTotalDepesas = 0;
    this.valorTotalDepesas = 0;
    this.inflowByMonth = [];
    this.outflowByMonth = [];

    console.log('BEFORE FUNCTION ', this.valorTotalDepesas, this.valorTotalReceita);
    this.selectDataByMonth(event.value);    
    console.log('AFTER FUNCTION ', this.valorTotalDepesas, this.valorTotalReceita);
  }

  selectDataByMonth(month: string): void {
    this.despesasList.forEach((el) => {
      let monthInt = 0;
      let monthStr = '';
      monthInt = moment(el.data_lan).month();
      monthStr = this.meses[monthInt];

      if (monthStr === month) {
        this.outflowByMonth.push(el);
      }
    });

    this.receitasList.forEach((el) => {
      let monthInt = 0;
      let monthStr = '';
      monthInt = moment(el.data_lan).month();
      monthStr = this.meses[monthInt];

      if (monthStr === month) {
        this.inflowByMonth.push(el);
      }
    });
    
    this.inflowByMonth.forEach((lanc: any) => {
      this.valorTotalReceita += parseFloat(lanc.valor);
    });

    this.outflowByMonth.forEach((lanc: any) => {
      this.valorTotalDepesas += parseFloat(lanc.valor);
    });
  }

}
