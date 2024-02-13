import { Component, EventEmitter, Inject, Output, SimpleChange } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LancamentoService } from 'src/app/services/lancamentos/lancamento.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Account } from 'src/app/enums/account.enum';
import { Congregation } from 'src/app/enums/congregation.enum';
import { DocType } from 'src/app/enums/doc-type.enum';
import { FormCadastro } from 'src/app/enums/forms.enum';
import { Inflows } from 'src/app/enums/inflows.enum';
import { Outflows } from 'src/app/enums/outflows.enum';
import { Supliers } from 'src/app/enums/supliers.enum';
import { LancamentoDeleteComponent } from 'src/app/components/lancamento-delete/lancamento-delete.component';
import { first } from 'rxjs';

@Component({
  selector: 'app-lancamento-add',
  templateUrl: './lancamento-add.component.html',
  styleUrls: ['./lancamento-add.component.sass'],
})

export class LancamentoAddComponent {
  isAddMode!: boolean;
  id!: number;

  transactionForm!: FormGroup;
  formCadastro: any = Object.values(FormCadastro);

  docTypeValues = Object.values(DocType);
  inflowValues = Object.values(Inflows);
  outflowValues = Object.values(Outflows);
  congregations = Object.values(Congregation);
  supliers = Object.values(Supliers);
  accounts = Object.values(Account);

  message: string = ""
  confirmButtonText = ""
  cancelButtonText = ""
  submitted!: boolean;

  constructor(
    private fb: FormBuilder,
    private lancamentoService: LancamentoService,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<LancamentoDeleteComponent>) {
    if (data) {
      this.message = data.message || this.message;
      if (data.buttonText) {
        this.confirmButtonText = data.buttonText.ok || this.confirmButtonText;
        this.cancelButtonText = data.buttonText.cancel || this.cancelButtonText;
      }

      if (data.lancamento) {
        this.id = data.lancamento.id;
      }

      this.isAddMode = !data.lancamento;
    }

    this.transactionForm = this.fb.group({
      id: [''],
      recibo: [''],
      data_lan: new FormControl(),
      data_ven: [''],
      tipo_doc: [''],
      num_doc: [''],
      entrada: ['-', Validators.required],
      saida: ['-', Validators.required],
      cong: [''],
      forn: [''],
      dizimista: [''],
      obs: [''],
      valor: ['', Validators.required],
      conta: [''],
      situacao: [''],
      tipo_lanc: [''],
      historico: [''],
      status_lanc: [''],
    });

    if (!this.isAddMode) {
      this.lancamentoService.getLancamentoById(data.lancamento)
        .pipe(first())
        .subscribe((x) => {
          this.transactionForm.patchValue(x)
        });
    }

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

    this.transactionForm.get('status_lanc')?.valueChanges
      .subscribe(() => {
        this.dayToDue();
      })
  }
  dayToDue() {
    console.log(this.formControls)
  }

  public get formControls() {
    return Object.keys(this.transactionForm.controls);
  }

  ngOnInit(): void {
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
    if (this.isAddMode) {
      this.addLancamento();
    } else {
      this.updateLancamento(this.transactionForm.value);
    }
  }

  private addLancamento() {
    console.log('ADD MODE');
    this.lancamentoService.addLancamento(this.transactionForm.value)
      .pipe(first())
      .subscribe({
        next: () => {
          console.log('COMPLETE')
        },
        error: (err) => console.log(err),
      });
  }

  private updateLancamento(updatedForm: any) {
    updatedForm.data_lan = new Date(updatedForm.data_lan).toISOString().slice(0, 10);
    updatedForm.data_ven = new Date(updatedForm.data_ven).toISOString().slice(0, 10);
    this.lancamentoService.updateLancamento(updatedForm)
      .pipe(first())
      .subscribe({
        next: () => {
          console.log('COMPLETE');
        },
        error: (err) => console.log(err),
      })
  }

  onConfirmClick(): void {
    this.submitForm();
    this.dialogRef.close(true);
  }

  // Método para lidar com a mudança de data emitida pelo componente filho
  handleDateChange(date: Date) {
    console.log(date);
  }
}
