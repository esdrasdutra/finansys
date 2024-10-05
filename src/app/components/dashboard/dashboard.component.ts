import { Component, OnInit } from '@angular/core';
import moment from 'moment';
moment.locale('pt-br');
import { Lancamento } from '../..//models/Lancamento';
import { ComunicationService } from 'src/app/services/comunication.service';

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
  mes_atual: string = '';

  constructor(
    private commService: ComunicationService,
  ) { }

  ngOnInit(): void {
    let today = Date.now()
    const currentMonthIndex = moment(today).month();

    this.commService.despesasList$.subscribe(
      {
        next: (data) => { this.despesasList = data },
        error: (err) => console.log(err),
      }
    )

    this.commService.receitasList$.subscribe(
      {
        next: (data) => { this.receitasList = data },
        error: (err) => console.log(err),
      }
    )
    
    this.selectedMonth = this.meses[currentMonthIndex];

    this.selectDataByMonth(this.selectedMonth)
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
