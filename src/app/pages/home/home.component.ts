import { Component } from '@angular/core';
import { LancamentoService } from 'src/app/services/lancamentos/lancamento.service';

@Component({
  selector: 'app-Home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
  providers: [LancamentoService]
})
export class HomeComponent {
  constructor() { }

  ngOnInit(): void {
  }
}
