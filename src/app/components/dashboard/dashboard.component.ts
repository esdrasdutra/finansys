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
  selectedYear!: string;

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

  anos = ['2023', '2024', '2025', '2026', '2027'];

  saldoMensal: any;
  mes_atual: string = '';
  ano_atual: string = '';
  currentMonth = moment();

  prevMonth = moment().add(-1, 'months');

  constructor(
    private commService: ComunicationService,
  ) { }

  ngOnInit(): void {
    let today = Date.now()
    const currentMonthIndex = moment(today).month();
    const currentYear = moment(today).year().toString();

    this.commService.despesasList$.subscribe(
      {
        next: (data) => {
          this.despesasList = data.filter((el: any) => {
            const dataLancamento = moment(el.data_lan);
            return (
              dataLancamento.year() === this.currentMonth.year()
            );
          });
        },
        error: (err) => console.log(err),
      }
    )

    this.commService.receitasList$.subscribe(
      {
        next: (data) => {
          this.receitasList = data.filter((el: any) => {
            const dataLancamento = moment(el.data_lan);
            return (
              dataLancamento.year() === this.currentMonth.year()
            );
          });
        },
        error: (err) => console.log(err),
      }
    )

    this.selectedMonth = this.meses[currentMonthIndex];
    this.selectedYear = currentYear;

    this.selectDataByMonth(this.selectedMonth, currentYear)
  }

  onChange(event: any): void {
    this.valorTotalDepesas = 0;
    this.valorTotalDepesas = 0;
    this.inflowByMonth = [];
    this.outflowByMonth = [];

    if (event.id === 'year-select') {
      this.selectDataByMonth(this.selectedMonth, event.value);
    } else {
      this.selectDataByMonth(event.value, this.selectedYear);
    }
  }

  selectDataByMonth(month: string, year: string): void {
    this.valorTotalDepesas = 0;
    this.valorTotalReceita = 0;
    this.despesasList.forEach((el: any) => {
      let monthInt = moment(el.data_lan).month();
      let yearStr = moment(el.data_lan).year().toString();

      let monthStr = this.meses[monthInt];

      console.log(yearStr, year);

      if (monthStr === month && yearStr === year) {
        this.outflowByMonth.push(el);
      }
    });

    this.receitasList.forEach((el: any) => {
      let monthInt = moment(el.data_lan).month();
      let yearStr = moment(el.data_lan).year().toString();

      let monthStr = this.meses[monthInt];

      if (monthStr === month && yearStr === year) {
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
