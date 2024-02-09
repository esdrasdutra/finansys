import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LancamentosComponent } from './pages/lancamentos/lancamentos.component';
import { HomeComponent } from './pages/home/home.component';
import { RegistrosComponent } from './components/registros/registros.component';
import { BalanceteComponent } from './pages/balancete/balancete.component';
import { CongregacoesComponent } from './pages/congregacoes/congregacoes.component';
import { FornecedoresComponent } from './pages/fornecedores/fornecedores.component';
import { ObreirosComponent } from './pages/obreiros/obreiros.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, 
  { path: 'home', component: HomeComponent }, 
  { path: 'lancamentos', component: LancamentosComponent },
  { path: 'registros', component: RegistrosComponent},
  { path: 'balancete', component: BalanceteComponent},  
  { path: 'obreiros', component: ObreirosComponent},
  { path: 'congregacoes', component: CongregacoesComponent},
  { path: 'fornecedores', component: FornecedoresComponent},
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
