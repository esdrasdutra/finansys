import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LancamentoListComponent } from './components/lancamento-list/lancamento-list.component';
import { BalanceteComponent } from './pages/balancete/balancete.component';
import { CongregacoesComponent } from './pages/congregacoes/congregacoes.component';
import { FornecedoresComponent } from './pages/fornecedores/fornecedores.component';
import { ObreirosComponent } from './pages/obreiros/obreiros.component';
import { LancamentoAddComponent } from './components/lancamento-add/lancamento-add.component';
import { RelatoriosComponent } from './pages/relatorios/relatorios.component';
import { PorcentagemDirigentesComponent } from './pages/relatorios/porcentagem-dirigentes/porcentagem-dirigentes.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, 
  { path: 'home', component: HomeComponent }, 
  { path: 'lancamentos', component: LancamentoAddComponent },
  { path: 'registros', component: LancamentoListComponent},
  { path: 'balancete', component: BalanceteComponent},  
  { path: 'obreiros', component: ObreirosComponent},
  { path: 'congregacoes', component: CongregacoesComponent},
  { path: 'fornecedores', component: FornecedoresComponent},
  { path: 'relatorios', component: RelatoriosComponent},
  { path: 'dirigentes', component: PorcentagemDirigentesComponent },
  { path: 'dashboards', component: DashboardComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
