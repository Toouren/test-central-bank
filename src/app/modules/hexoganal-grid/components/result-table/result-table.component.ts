import { Component } from '@angular/core';

import { ResultStorageService } from '../../../../services/result-storage.service';
import { IResultStorageInterface } from '../../../../interfaces/result-storage.interface';

@Component({
    selector: 'result-table',
    templateUrl: './result-table.component.html',
    styleUrls: ['./result-table.component.css']
})
export class ResultTableComponent {

    public get storage(): IResultStorageInterface[] {
        return this._resultStorageService.storage;
    }

    constructor(private _resultStorageService: ResultStorageService) {}



}