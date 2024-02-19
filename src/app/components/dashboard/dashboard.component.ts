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

  valorTotalDespesa = 0;
  valorTotalReceita = 0;

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
  }

  onChange(event: any): void {
    this.valorTotalDespesa = 0;
    this.valorTotalReceita = 0;
    this.selectedMonth = event.value;
    this.selectDataByMonth(event.value);
    this.setTotalValores();
  }

  selectDataByMonth(month: string): void {
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
  }

  setTotalValores(): void{
    let valorTotalDespesa = 0;
    let valorTotalReceita = 0;

    this.inflowByMonth.forEach((lanc: any) => {
      if( lanc.tipo_lanc === "DESPESA") {
        valorTotalDespesa += parseFloat(lanc.valor);
        this.valorTotalDespesa = valorTotalDespesa;

      } else if (lanc.tipo_lanc === "RECEITA") {
        valorTotalReceita += parseFloat(lanc.valor);
        this.valorTotalReceita = valorTotalReceita;
      }
    });
  }
}
