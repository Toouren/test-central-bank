import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { GridConfigFormManagerService } from '../../../../services/grid-config-form.manager.service';

@Component({
    selector: 'config-grid-form',
    templateUrl: './config-grid-form.component.html',
    styleUrls: ['./config-grid-form.component.css']
})
export class ConfigGridFormComponent {
    public configForm: FormGroup;

    public get isFormValid(): boolean {
        return this.configForm.valid;
    }

    constructor(
        private _gridConfigFormManagerService: GridConfigFormManagerService
    ) {
        this.configForm = this._gridConfigFormManagerService.configForm;
    }

    public onSubmitForm() {
        this._gridConfigFormManagerService.onSubmit();
    }
}