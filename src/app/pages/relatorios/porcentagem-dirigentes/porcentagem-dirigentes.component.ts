import { Component } from '@angular/core';
import { FILTROS, MESES } from 'src/app/entities/relatorios/relatorios';
import { RelatoriosRoutingModule } from '../relatorios-routing.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-porcentagem-dirigentes',
  templateUrl: './porcentagem-dirigentes.component.html',
  styleUrls: ['./porcentagem-dirigentes.component.sass']
})
export class PorcentagemDirigentesComponent {
  filtros = FILTROS;
  meses = MESES;

  constructor(
    private router: Router,
  ){}

  navigateTo(){
    const url = this.router.createUrlTree(['/dirigentes'], { relativeTo: RelatoriosRoutingModule });
    this.router.navigateByUrl('/dirigentes', url)
  }

  onKey(event: Event) {
    const inputValue = event.target as HTMLInputElement;
    console.log(inputValue);
  }

}
