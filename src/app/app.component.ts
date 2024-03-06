import { Component, OnInit } from '@angular/core';
import { LancamentoService } from './services/lancamentos/lancamento.service';

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

  pathArray =[
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
  ){}

  ngOnInit(): void {
    this.lancamentoService.getLancamentos()
    
  }
}
