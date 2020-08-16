import { Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';

import { HexoganalGridManagerService } from '../../../../services/hexoganal-grid.manager.service';
import { GridConfigFormManagerService } from '../../../../services/grid-config-form.manager.service';

@Component({
    selector: 'main-grid',
    templateUrl: './main-grid.component.html',
    styleUrls: ['./main-grid.component.css']
})
export class MainGridComponent implements OnDestroy {
    @ViewChild('svgWrapper')
    public svgWrapperRef: ElementRef;
    
    public domainNumber: number = 0;

    public probabilitySettingForm: FormGroup = new FormGroup({
        'probabilityInput': new FormControl('', [Validators.min(0.01), Validators.max(0.99), Validators.required])
    })

    public get isGridInit(): boolean {
        return this._hexoganalGridManagerService.isGridInit;
    }

    private configFormSubmitSubcscribtion: Subscription

    constructor(
        private _hexoganalGridManagerService: HexoganalGridManagerService,
        private _gridConfigFormManagerService: GridConfigFormManagerService
    ) {
        this.configFormSubmitSubcscribtion = this._gridConfigFormManagerService.submit.subscribe(([l, m, n]) => {
            this._hexoganalGridManagerService.initGrid(l, m, n, this.svgWrapperRef).subscribe();
        })
    }

    public ngOnDestroy(): void {
        this.configFormSubmitSubcscribtion.unsubscribe();
        this.configFormSubmitSubcscribtion = null;
    }
    
    public onSubmitProbabilitySettingsForm(): void {
        const probability = parseFloat(this.probabilitySettingForm.get('probabilityInput').value);
        this._hexoganalGridManagerService.autoFillGrid(probability);
        this.countDomains();
    }

    public countDomains(): void {
        this.domainNumber = this._hexoganalGridManagerService.getDomainsNumber();
    }
}