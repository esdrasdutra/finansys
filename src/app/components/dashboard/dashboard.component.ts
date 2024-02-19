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

  meses = [
    'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ];

  saldoMensal: any;

  constructor(
    private commService: ComunicationService,
  ) { }

  ngOnInit() {
    this.commService.fetchData('Dashboard OnInit');

    this.commService.despesasList$.subscribe(
      (data: any) => {
        this.despesasList = data
      });

    this.commService.receitasList$.subscribe(
      (data: any) => {
        this.receitasList = data
      });
  }

  onChange(event: any) {
    this.selectedMonth = event.value;
    this.selectDataByMonth(event.value);
  }

  selectDataByMonth(month: string) {
    this.despesasList.forEach((el) => {
      let monthInt = moment(el.data_lan).month();
      let monthStr = this.meses[monthInt];

      if (monthStr === month) {
        this.outflowByMonth.push(el);
      }

      this.receitasList.forEach((el) => {
        let monthInt = moment(el.data_lan).month();
        let monthStr = this.meses[monthInt];

        if (monthStr === month) {
          this.inflowByMonth.push(el);
        }
      })
    })

    console.log('SELECT DESPESAS WHERE MONTH: ', this.outflowByMonth);
    console.log('SELECT * FROM RECEITAS WHERE MONTH: ', this.inflowByMonth);
  }
}
