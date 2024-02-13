import { Component, EventEmitter, Input, Output, ViewChild, ViewEncapsulation, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormControl, FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MatDatepicker, MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
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
    { provide: MAT_DATE_LOCALE, useValue: 'pt' },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatepickerViewsSelectionExampleComponent),
      multi: true
    }
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
  data_lan = new FormControl();
  value!: Date;

  @Output() dateChanged = new EventEmitter<any>();
  constructor(
    private fb: FormBuilder,
  ) { }

  date = new FormControl(moment());

  setMonthAndYear(normalizedDayAndMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.data_lan.value ?? moment();
    ctrlValue.day(normalizedDayAndMonth.day());
    ctrlValue.month(normalizedDayAndMonth.month());
    datepicker.close();
  }

  // Método para lidar com a mudança de data e emitir o evento para o componente pai
  handleDateChange(date: any) {
    console.log(date);
    this.dateChanged.emit(date);
  }

  onDateChange(event: MatDatepickerInputEvent<Date>) {
    console.log(event.value?.getDay());
  }
}
