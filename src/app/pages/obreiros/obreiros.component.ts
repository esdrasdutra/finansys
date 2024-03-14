import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { Obreiros } from '../..//models/Obreiros';
import { ObreirosService } from '../..//services/obreiros/obreiros.service';

@Component({
  selector: 'app-obreiros',
  templateUrl: './obreiros.component.html',
  styleUrls: ['./obreiros.component.sass']
})
export class ObreirosComponent {
  transactionForm: FormGroup;
  private sub: any;
  title = null;
  all = new BehaviorSubject<Obreiros[]>([]);
  data: Obreiros[] = [];

  constructor(
    private fb: FormBuilder,
    private obreirosService: ObreirosService,
    ) {

    this.transactionForm = this.fb.group({
      name: [''],
      cong: [''],
      func: [''],
    });
  }

  ngOnInit(): void {
    this.obreirosService.getObreiro().subscribe(
      (data) => {
        console.log(data)
        this.data = data.data;
        this.all.next(this.data);
      },
      (error) => {
        console.log(error.error);
      });
  }

  submitForm() {
    if (this.transactionForm.valid) {
      // Handle form submission logic here
      // Access form values using this.transactionForm.value
      console.log(this.transactionForm.value);
    } else {
      // Handle validation errors or prevent submission
      console.log('Form is invalid. Please check the fields.');
    }
  }

}
