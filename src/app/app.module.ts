import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CongregacoesComponent } from './pages/congregacoes/congregacoes.component';
import { FornecedoresComponent } from './pages/fornecedores/fornecedores.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IconsComponent } from './components/icons/icons.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyPipe } from '@angular/common';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { HomeModule } from './pages/home/home.module';
import { DizimistasComponent } from './pages/relatorios/dizimistas/dizimistas.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

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
    CongregacoesComponent,
    FornecedoresComponent,
    IconsComponent,
    ToolbarComponent,
    DizimistasComponent,
    DashboardComponent,
],
  providers: [CurrencyPipe, HttpClientModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
