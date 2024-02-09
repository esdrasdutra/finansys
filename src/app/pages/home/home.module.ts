import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RegistrosComponent } from '../../components/registros/registros.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';



@NgModule({
  declarations: [ HomeComponent, RegistrosComponent ],
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatDialogModule,
    FormsModule,
  ],
  exports: [
    HomeComponent,
    RegistrosComponent,
  ]
})
export class HomeModule { }
