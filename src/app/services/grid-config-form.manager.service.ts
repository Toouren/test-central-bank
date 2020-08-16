import { Injectable } from "@angular/core";
import { FormControl, Validators, FormBuilder, FormGroup } from "@angular/forms";
import { Subject } from "rxjs/internal/Subject";

@Injectable()
export class GridConfigFormManagerService {

    public get configForm(): FormGroup {
        return this._configForm;
    }

    public get submit(): Subject<[number, number, number]> {
        return this._submit;
    }

    private _configForm: FormGroup;
    private _submit: Subject<[number, number, number]> = new Subject<[number, number, number]>();

    constructor(private _formBuilder: FormBuilder) {
        const lControl = new FormControl("", [Validators.max(30), Validators.min(1), Validators.required]);
        const mControl = new FormControl("", [Validators.max(30), Validators.min(1), Validators.required]);
        const nControl = new FormControl("", [Validators.max(30), Validators.min(1), Validators.required]);

        this._configForm = this._formBuilder.group({
            'lControl': lControl,
            'mControl': mControl,
            'nControl': nControl,
        });
    }

    public onSubmit(): void {
        const lValue = this._configForm.get('lControl').value;
        const mValue = this._configForm.get('mControl').value;
        const nValue = this._configForm.get('nControl').value;

        if (!lValue || !mValue || !nValue) {
            return;
        } else {
            this._submit.next([lValue, mValue, nValue])
        }
    }

}