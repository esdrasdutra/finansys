import { Component } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.sass']
})
export class ToolbarComponent {
  nameArray = [
    "HOME",
    "BALANCETES",
    "OBREIROS",
    "CONGREGAÇÕES",
    "FORNECEDORES"
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
    "fornecedores"
  ]
}
