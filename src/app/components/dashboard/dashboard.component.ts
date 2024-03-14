import { Component, OnInit } from '@angular/core';
import moment from 'moment';
moment.locale('pt-br');
import { Lancamento } from '../..//models/Lancamento';
import { LancamentoService } from '../..//services/lancamentos/lancamento.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit {
  data: any = [];

  selectedMonth!: string;

  despesasList: any = [];
  receitasList: any = [];

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
    private lancamentoService: LancamentoService,
  ) { }

  ngOnInit(): void {
    this.despesasList = localStorage.getItem('DESPESAS');
    this.receitasList = localStorage.getItem('RECEITAS');

    this.despesasList = JSON.parse(this.despesasList);
    this.receitasList = JSON.parse(this.receitasList);

    console.log('INCINANDO DASHBOARD');
  }

  onChange(event: any): void {
    this.valorTotalDepesas = 0;
    this.valorTotalDepesas = 0;
    this.inflowByMonth = [];
    this.outflowByMonth = [];

    this.selectDataByMonth(event.value);    
  }

  selectDataByMonth(month: string): void {
    this.valorTotalDepesas = 0;
    this.valorTotalReceita = 0;
    this.despesasList.forEach((el: any) => {
      let monthInt = moment(el.data_lan).month();
      let monthStr = this.meses[monthInt];     

      if (monthStr === month) {
        this.outflowByMonth.push(el);
      }
    });

    this.receitasList.forEach((el: any) => {
      let monthInt = moment(el.data_lan).month();
      let monthStr = this.meses[monthInt];

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
