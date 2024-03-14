import { Component, OnInit } from '@angular/core';
import { LancamentoService } from './services/lancamentos/lancamento.service';
import moment from 'moment';
import { Lancamento } from './models/Lancamento';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  title = 'finan_Sys';

  nameArray = [
    "HOME",
    "BALANCETES",
    "OBREIROS",
    "CONGREGAÇÕES",
    "RELATORIOS"
  ]

  pathArray = [
    'assets/home_icon.svg',
    'assets/balancesheet_icon.svg',
    'assets/add_obreiro_icon.svg',
    'assets/add_cong_icon.svg',
    'assets/fornecedores_icons.svg',
  ]

  appRoutes = [
    "home",
    "balancete",
    "obreiros",
    "congregacoes",
    "relatorios"
  ]

  constructor(
    private lancamentoService: LancamentoService,
  ) { }

  ngOnInit(): void {
    this.lancamentoService.getLancamentos().subscribe(
      (data: any) => {
        let dataDespesas: Lancamento[] = [];
        let dataReceitas: Lancamento[] = [];
        data.forEach((el: any) => {
          if (el.tipo_lanc === "RECEITA") {
            dataReceitas.push(el);
          } else if (el.tipo_lanc === "DESPESA") {
            dataDespesas.push(el);
          }
        });
        localStorage.setItem('DESPESAS', JSON.stringify(dataDespesas));
        localStorage.setItem('RECEITAS', JSON.stringify(dataReceitas));
      });
  }

  handleChange(event: Event) {
    console.log(event);
  }
}
