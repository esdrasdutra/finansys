import {Component, Input, ViewEncapsulation} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {provideMomentDateAdapter} from '@angular/material-moment-adapter';
import {MatDatepicker, MatDatepickerModule} from '@angular/material/datepicker';
import * as _moment from 'moment';
import {default as _rollupMoment, Moment} from 'moment';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MAT_DATE_LOCALE } from '@angular/material/core';

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM',
  },
  display: {
    dateInput: 'DD/MM',
    monthYearLabel: 'DD MM',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'DD MM',
  },
};

/** @title Datepicker emulating a Year and month picker */
@Component({
  selector: 'datepicker-selection',
  templateUrl: './datepicker-views-selection-example.component.html',
  styleUrls: ['./datepicker-views-selection-example.component.sass'],
  providers: [
    provideMomentDateAdapter(MY_FORMATS),
    { provide: MAT_DATE_LOCALE, useValue: 'pt' }
  ],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})


export class DatepickerViewsSelectionExampleComponent {
  
  @Input() controlName!: string;
  constructor(){}
  
  date = new FormControl(moment());

  setMonthAndYear(normalizedDayAndMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value ?? moment();
    ctrlValue.day(normalizedDayAndMonth.day());
    ctrlValue.month(normalizedDayAndMonth.month());
    this.date.setValue(ctrlValue);
    datepicker.close();
  }

}
