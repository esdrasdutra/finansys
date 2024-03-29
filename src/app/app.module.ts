import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BalanceteComponent } from './pages/balancete/balancete.component';
import { CongregacoesComponent } from './pages/congregacoes/congregacoes.component';
import { FornecedoresComponent } from './pages/fornecedores/fornecedores.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IconsComponent } from './components/icons/icons.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyPipe } from '@angular/common';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { HomeModule } from './pages/home/home.module';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HomeModule,
    MatButtonModule,
    NgxMaskDirective,
    NgxMaskPipe,
    HttpClientModule,
  ],  
  declarations: [
    AppComponent,
    BalanceteComponent,
    CongregacoesComponent,
    FornecedoresComponent,
    IconsComponent,
    ToolbarComponent,
],
  providers: [CurrencyPipe, HttpClientModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
