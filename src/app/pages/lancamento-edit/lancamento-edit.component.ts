import { Component, Inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-lancamento-edit',
  templateUrl: './lancamento-edit.component.html',
  styleUrls: ['./lancamento-edit.component.sass']
})
export class LancamentoEditComponent {
  message: string = ""
  confirmButtonText: string = "";
  cancelButtonText: string = "";
  editForm!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<LancamentoEditComponent>
  ){
    if (data) {
      this.message = data.message || this.message;

      if (data.buttonText) {
        this.confirmButtonText = data.buttonText.ok
        this.cancelButtonText = data.buttonText.cancel
      }
    }
  }

  submitForm(): void {
    console.log('Form Submetido!');
  }

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }
}
