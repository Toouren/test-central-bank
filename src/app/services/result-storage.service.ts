import { Injectable } from "@angular/core";

import { IResultStorageInterface } from "../interfaces/result-storage.interface";

@Injectable()
export class ResultStorageService {

    public get storage(): IResultStorageInterface[] {
        return this._storage;
    }

    private _storage: IResultStorageInterface[] = [];

    public addNewRecord(record: IResultStorageInterface) {
        if (this._storage.length >= 10) {
            this._storage = this._storage.slice(1);
        }
        this._storage.push(record);
    } 

}