import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainGridComponent } from './components/main/main-grid.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'main',
    },
    {
        path: 'main',
        component: MainGridComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HexoganalGridRoutingModule { }