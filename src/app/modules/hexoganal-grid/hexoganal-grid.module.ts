import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

import { GridConfigFormManagerService } from '../../services/grid-config-form.manager.service';
import { HexoganalGridManagerService } from '../../services/hexoganal-grid.manager.service';
import { ResultStorageService } from '../../services/result-storage.service';
import { ConfigGridFormComponent } from './components/config/config-grid-form.component';
import { MainGridComponent } from './components/main/main-grid.component';
import { ResultTableComponent } from './components/result-table/result-table.component';

import { HexoganalGridRoutingModule } from './hexoganal-grid.route.module';

@NgModule({
    declarations: [
        MainGridComponent,
        ConfigGridFormComponent,
        ResultTableComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        ReactiveFormsModule,
        HexoganalGridRoutingModule,
        MatProgressSpinnerModule,
    ],
    providers: [
        HexoganalGridManagerService,
        GridConfigFormManagerService,
        ResultStorageService
    ],
})
export class HexoganalGridModule { }
