import { Component, OnInit } from '@angular/core';
import { Lancamento } from 'src/app/models/Lancamento';
import { ComunicationService } from 'src/app/services/comunication.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit {
  data: any = [];
  valorDespesas = 0;
  valorReceitas = 0;

  saldoMensal: any;

  constructor(
    private commService: ComunicationService,
  ){}

  ngOnInit(){
  }

  ngAfterViewInit(){
    this.commService.despesas$.subscribe(
      (data: any) => {
        this.valorDespesas = data
      });

    this.commService.receitas$.subscribe(
      (data: any) => {
        this.valorReceitas = data
      });
  }
}
