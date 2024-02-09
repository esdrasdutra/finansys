import { Component } from '@angular/core';
import { LancamentosComponent } from 'src/app/pages/lancamentos/lancamentos.component';
import { LancamentoService } from 'src/app/services/lancamentos/lancamento.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';




@Component({
  selector: 'app-novo-lancamento',
  templateUrl: './novo-lancamento.component.html',
  styleUrls: ['./novo-lancamento.component.sass'],
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule],
})
export class NovoLancamentoComponent {

  save(): void {
    console.log('SALVANDO MODAL')
  }
}
