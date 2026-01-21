import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BalancoMensalCongregacaoComponent } from '../balanco-mensal-congregacao/balanco-mensal-congregacao.component';
import { DizimistasComponent } from '../dizimistas/dizimistas.component';


@NgModule({
  declarations: [
    BalancoMensalCongregacaoComponent,
    DizimistasComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    BalancoMensalCongregacaoComponent,
    DizimistasComponent
  ]
})
export class RelatoriosModule { }
