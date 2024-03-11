import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { LancamentoListComponent } from '../../components/lancamento-list/lancamento-list.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SnackBarComponent } from 'src/app/components/snack-bar/snack-bar.component';
import { LancamentoDeleteComponent } from 'src/app/components/lancamento-delete/lancamento-delete.component';
import { MatButtonModule } from '@angular/material/button';
import { LancamentoAddComponent } from '../../components/lancamento-add/lancamento-add.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { ObreirosComponent } from '../obreiros/obreiros.component';
import { DatepickerViewsSelectionExampleComponent } from "../../components/datepicker/datepicker-views-selection-example.component";
import { CrudButtonsComponent } from 'src/app/components/crud-buttons/crud-buttons.component';
import { DashboardComponent } from 'src/app/components/dashboard/dashboard.component';

import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePtBr from '@angular/common/locales/pt';
import { PaginatorComponent } from 'src/app/components/paginator/paginator.component';
import { RelatoriosComponent } from 'src/app/pages/relatorios/relatorios.component';

registerLocaleData(localePtBr);

@NgModule({
    declarations: [
        HomeComponent,
        LancamentoListComponent,
        SnackBarComponent,
        LancamentoDeleteComponent,
        LancamentoAddComponent,
        ObreirosComponent,
        CrudButtonsComponent,
        DashboardComponent,
        RelatoriosComponent,
        PaginatorComponent,
    ],
    exports: [
        HomeComponent,
        LancamentoListComponent,
        SnackBarComponent,
        LancamentoDeleteComponent,
        ObreirosComponent,
        CrudButtonsComponent,
        DashboardComponent,
        RelatoriosComponent,
        PaginatorComponent
    ],
    providers: [
        provideNgxMask(),
        { provide: LOCALE_ID, useValue: 'pt-BR'}
    ],
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
        DatepickerViewsSelectionExampleComponent,
        MatPaginatorModule,
    ]
})
export class HomeModule { }
