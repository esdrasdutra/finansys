import { Component } from '@angular/core';
import { LancamentoService } from '../..//services/lancamentos/lancamento.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { LancamentoAddComponent } from '../..//components/lancamento-add/lancamento-add.component';




@Component({
  selector: 'app-novo-lancamento',
  templateUrl: './novo-lancamento.component.html',
  styleUrls: ['./novo-lancamento.component.sass'],
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule],
})
export class NovoLancamentoComponent {
  constructor(){

  }

  save(): void {
    console.log('SALVANDO MODAL')
  }
}
