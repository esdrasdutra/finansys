import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { RegistrosComponent } from '../../components/registros/registros.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SnackBarComponent } from 'src/app/components/snack-bar/snack-bar.component';
import { LancamentoDeleteComponent } from 'src/app/components/lancamento-delete/lancamento-delete.component';
import { MatButtonModule } from '@angular/material/button';
import { LancamentoAddComponent } from '../lancamento-add/lancamento-add.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { ObreirosComponent } from '../obreiros/obreiros.component';
import { LancamentoEditComponent } from '../lancamento-edit/lancamento-edit.component';
import { DatepickerViewsSelectionExampleComponent } from "../../components/datepicker/datepicker-views-selection-example.component";
import { NewHomeComponent } from '../new-home/new-home.component';
import { CrudButtonsComponent } from 'src/app/components/crud-buttons/crud-buttons.component';
import { DashboardComponent } from 'src/app/components/dashboard/dashboard.component';


@NgModule({
    declarations: [
        HomeComponent,
        RegistrosComponent,
        SnackBarComponent,
        LancamentoDeleteComponent,
        LancamentoAddComponent,
        LancamentoEditComponent,
        ObreirosComponent,
        NewHomeComponent,
        CrudButtonsComponent,
        DashboardComponent,
    ],
    exports: [
        HomeComponent,
        RegistrosComponent,
        SnackBarComponent,
        LancamentoDeleteComponent,
        LancamentoEditComponent,
        ObreirosComponent,
        NewHomeComponent,
        CrudButtonsComponent,
        DashboardComponent,
    ],
    providers: [provideNgxMask(),],
    imports: [
        CommonModule,
        MatTabsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatSnackBarModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        NgxMaskDirective,
        NgxMaskPipe,
        DatepickerViewsSelectionExampleComponent
    ]
})
export class HomeModule { }
