import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PorcentagemDirigentesComponent } from 'src/app/pages/relatorios/porcentagem-dirigentes/porcentagem-dirigentes.component';

const routes: Routes = [
  { path: '/dirigentes', component: PorcentagemDirigentesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RelatoriosRoutingModule { }
