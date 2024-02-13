import { Component, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LancamentoService } from 'src/app/services/lancamentos/lancamento.service';
import { Account } from 'src/app/enums/account.enum';
import { Congregation } from 'src/app/enums/congregation.enum';
import { DocType } from 'src/app/enums/doc-type.enum';
import { FormCadastro } from 'src/app/enums/forms.enum';
import { Inflows } from 'src/app/enums/inflows.enum';
import { Outflows } from 'src/app/enums/outflows.enum';
import { Supliers } from 'src/app/enums/supliers.enum';

@Component({
  selector: 'app-lancamentos',
  templateUrl: './lancamentos.component.html',
  styleUrls: ['./lancamentos.component.sass'],
})

export class LancamentosComponent {

  formattedAmount: any;
  transactionForm!: FormGroup;
  formCadastro: any = Object.values(FormCadastro);

  docTypeValues = Object.values(DocType);
  inflowValues = Object.values(Inflows);
  outflowValues = Object.values(Outflows);
  congregations = Object.values(Congregation);
  supliers = Object.values(Supliers);
  accounts = Object.values(Account);

  selectedDocTypes = '';
  selectedInflows = '';
  selectedOutflows = '';
  selectedCongregations = '';
  selectedSuplier = '';

  private sub: any;

  constructor(
    private fb: FormBuilder,
    private lancamentoService: LancamentoService,
  ) {
    this.transactionForm = this.fb.group({
      recibo: [''],
      data_lan: [''],
      data_ven: [''],
      tipo_doc: [''],
      num_doc: [''],
      entrada: ['', Validators.required],
      saida: ['', Validators.required],
      cong: [''],
      forn: [''],
      dizimista: [''],
      obs: [''],
      valor: [''],
      conta: [''],
      situacao: [''],
      tipo_lanc: [''],
      historico: [''],
      status_lanc: [''],
    });


    this.transactionForm.get('valor')?.valueChanges
      .subscribe(() => {
        this.checkTypeDoc();
      })

    this.transactionForm.get('recibo')?.valueChanges
      .subscribe(() => {
        this.updateHistory();
      })

    this.transactionForm.get('obs')?.valueChanges
      .subscribe(() => {
        this.updateHistory();
      })

    this.transactionForm.get('entrada')?.valueChanges
      .subscribe(() => {
        this.updateHistory();
        this.checkTypeDoc();
      })

    this.transactionForm.get('saida')?.valueChanges
      .subscribe(() => {
        this.updateHistory();
        this.checkTypeDoc();
      })

    this.transactionForm.get('dizimista')?.valueChanges
      .subscribe(() => {
        this.updateHistory();
      })

    this.transactionForm.get('cong')?.valueChanges
      .subscribe(() => {
        this.updateHistory();
      })
  }

  get formControls() {
    return Object.keys(this.transactionForm.controls);
  }

  ngOnInit(): void {

  }

  onValueChanges($event: any) {
    console.log($event);
  }


  updateHistory() {
    const receipt = this.transactionForm.get('recibo')?.value;
    const obs = this.transactionForm.get('obs')?.value;
    const inf = this.transactionForm.get('entrada')?.value;
    const ouf = this.transactionForm.get('saida')?.value;
    const thn = this.transactionForm.get('dizimista')?.value;
    const cong = this.transactionForm.get('cong')?.value;

    const historico = `${obs} / ${inf} - ${thn} - ${cong} /  RECIBO: ${receipt}`;

    this.transactionForm.patchValue({ historico });
  }

  checkTypeDoc() {
    const infl = this.transactionForm.get('entrada')?.value;
    const outfl = this.transactionForm.get('saida')?.value;

    if (infl !== '-' && infl !== '') {
      const tipo_lanc = 'RECEITA';
      this.transactionForm.patchValue({ tipo_lanc });
    }

    if (outfl !== '-' && outfl !== '') {
      const tipo_lanc = 'DESPESA';
      this.transactionForm.patchValue({ tipo_lanc });
    }
  }

  submitForm() {
    if (this.transactionForm.valid) {      
      this.lancamentoService.addLancamento(this.transactionForm.value)
      .subscribe({
        next: () => console.log('COMPLETE'),
        error: (err) => console.log(err)
      });
    } else {
      // Handle validation errors or prevent submission
      console.log('Form is invalid. Please check the fields.');
    }
  }

}
