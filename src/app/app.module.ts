import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { CurrencyPipe } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LancamentosComponent } from './pages/lancamentos/lancamentos.component';
import { BalanceteComponent } from './pages/balancete/balancete.component';
import { CongregacoesComponent } from './pages/congregacoes/congregacoes.component';
import { FornecedoresComponent } from './pages/fornecedores/fornecedores.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IconsComponent } from './components/icons/icons.component';
import { ObreirosComponent } from './pages/obreiros/obreiros.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { NovoLancamentoComponent } from './components/dialog/novo-lancamento/novo-lancamento.component';
import { HomeModule } from './pages/home/home.module';

@NgModule({
  declarations: [
    AppComponent,
    LancamentosComponent,
    BalanceteComponent,
    CongregacoesComponent,
    FornecedoresComponent,
    IconsComponent,
    ObreirosComponent,
    ToolbarComponent,
],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HomeModule,
    ReactiveFormsModule,    
    MatButtonModule,
    NgxMaskDirective, 
    NgxMaskPipe,    
    HttpClientModule,   
    NovoLancamentoComponent,
  ],
  providers: [provideNgxMask(), CurrencyPipe, HttpClientModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
