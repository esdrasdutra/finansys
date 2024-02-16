import { Component } from '@angular/core';
import { LancamentoService } from 'src/app/services/lancamentos/lancamento.service';
import { MatSort } from '@angular/material/sort';


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
