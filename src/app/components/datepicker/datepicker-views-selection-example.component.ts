import { Component, EventEmitter, Input, Output, ViewChild, ViewEncapsulation, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormControl, FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MatDatepicker, MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { ComunicationService } from 'src/app/services/comunication.service';

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM',
  },
  display: {
    dateInput: 'DD/MM',
    monthYearLabel: 'DD/MM',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'DD/MM',
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

  @Output() dateChanged = new EventEmitter<any>();
  constructor(
    private fb: FormBuilder,
    private commService: ComunicationService,
  ) { }

  setMonthAndYear(normalizedDayAndMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.data_lan.value ?? moment();
    ctrlValue.day(normalizedDayAndMonth.day());
    ctrlValue.month(normalizedDayAndMonth.month());
    datepicker.close();
  }

  onDateChange(event: MatDatepickerInputEvent<Date>) {
    const date = event.value?.toISOString().slice(0,10)
    const target = event.targetElement.id;

    this.commService.setDate({date: date, target: target});
  }
}
