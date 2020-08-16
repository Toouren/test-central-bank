import { Injectable, ElementRef } from '@angular/core';
import { SVG, Polygon } from '@svgdotjs/svg.js'

import { extendHex, defineGrid, Point } from 'honeycomb-grid';
import { Observable } from 'rxjs/internal/Observable';

import { ResultStorageService } from './result-storage.service'; 

@Injectable()
export class HexoganalGridManagerService {

    public isGridInit = false;

    private _domainDict = {};
    private _polygonArray: Polygon[][] = [];
    private _width: number;
    private _height: number;
    private _probability: number;

    constructor(private _resultStorageService: ResultStorageService) { }

    public initGrid(L: number, M: number, N: number, svgWrapperRef: ElementRef): Observable<void> {

        return Observable.create(() => {
            svgWrapperRef.nativeElement.innerHTML = '';
            this._domainDict = {};
            this._width = L >= M ? N + Math.max(L, M) - 1 : N + Math.min(L, M) - 1;
            this._height = M + L - 1;
            const size = 10;
            const drawGroup = SVG().addTo(svgWrapperRef.nativeElement).size('100%', (Math.sqrt(3) * size * this._height).toString()).group();
            const exteneddHex = extendHex({ size });
            const grid = defineGrid(exteneddHex).parallelogram({ width: this._width, height: this._height });
            this._polygonArray = new Array(this._width).fill(0).map(() => new Array(this._height));

            grid.forEach((hex) => {
                const coordsSum = hex.q + hex.r;
                const pointsArray: Point[] = hex.corners();
                const points = pointsArray.map((point: Point) => `${point.x},${point.y}`).join(' ');
                if (coordsSum >= L - 1 && coordsSum < M + L + N - 2) {
                    const polygon = new Polygon({ points })
                        .data({ coords: { q: hex.q, r: hex.r } })
                        .fill('#fff')
                        .stroke({ width: 1, color: '#999' })
                        .translate(hex.toPoint().x, hex.toPoint().y)

                    polygon.click(() => {
                        this._probability = 0;

                        if (polygon.data('checked')) {
                            this.removePolygonFromDomain(polygon);
                            const color = '#fff';
                            const domainColorKey = polygon.data('color').toUpperCase();
                            polygon.fill({ color })
                            polygon.data({ checked: false, color })
                            this.restructDomain(domainColorKey);
                            if (this._domainDict[domainColorKey].length === 0) {
                                delete this._domainDict[domainColorKey];
                            }
                        } else {
                            const color = this.getColorForPolygon(polygon);
                            if (this._domainDict[color]) {
                                this._domainDict[color].push(polygon);
                            } else {
                                this._domainDict[color] = [polygon];
                            }
                            polygon.fill({ color })
                            polygon.data({ checked: true, color })
                        }
                    })
                    this._polygonArray[hex.q][hex.r] = polygon;
                    drawGroup.group().add(polygon)
                }
            })

            this.isGridInit = true;
        })
    }

    public getDomainsNumber(): number {
        const keys = Object.keys(this._domainDict) || [];
        let polygonNumber = 0;
        let checkedPolygonNumber = 0;

        this._polygonArray.forEach((polygons: Polygon[]) => {
            polygonNumber += polygons.length;
            polygons.forEach((polygon: Polygon) => {
                if (polygon.data('checked')) {
                    checkedPolygonNumber += 1;
                }
            })
        });

        this._resultStorageService.addNewRecord({
            probability: this._probability,
            domainNumber: keys.length,
            polygonNumber,
            checkedPolygonNumber
        })

        return keys.length;
    }

    public autoFillGrid(probability: number) {
        this._domainDict = {};
        this._probability = probability;

        const checkedDomains = [];
        const domains = [];
        this._polygonArray.forEach((polygons: Polygon[]) => {
            polygons.forEach((polygon: Polygon) => {
                const randomValue = this.getRandomArbitrary();
                if (randomValue <= probability) {
                    polygon.data({ checked: true });
                    checkedDomains.push(polygon);
                } else {
                    polygon.data({ checked: false, color: '#fff' });
                    polygon.fill({ color: '#fff' });
                }
            })
        })

        
        checkedDomains.forEach((polygon: Polygon) => {
            if (domains.every((value: Polygon[]) => value.indexOf(polygon) === -1)) {
                domains.push(this.getCheckedDomain(polygon));
            }
        });

        domains.forEach((polygons: Polygon[]) => {
            const newDomainGroupColor = this.getRandomColor();
            this._domainDict[newDomainGroupColor] = [];
            polygons.forEach((polygon: Polygon) => {
                this._domainDict[newDomainGroupColor].push(polygon);
                polygon.data({ color: newDomainGroupColor });
                polygon.fill({ color: newDomainGroupColor });
            })
        })
    }

    private getRandomArbitrary(min: number = 0.01, max: number = 0.99) {
        return Math.random() * (max - min) + min;
    }

    private getRandomColor(): string {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color.toUpperCase();
    }

    private getColorForPolygon(polygon: Polygon): string {
        const color = this.checkedNeighborColor(polygon) || this.getRandomColor();

        return color;
    }

    private getNeigborsCoords(polygon: Polygon): { q: number, r: number }[] {
        const { q, r } = polygon.data('coords');

        return [
            { q, r: r + 1 },
            { q: q + 1, r },
            { q, r: r - 1 },
            { q: q - 1, r },
            { q: q - 1, r: r + 1 },
            { q: q + 1, r: r - 1 }
        ]
    }

    private getCheckedNeighbors(polygon: Polygon): Polygon[] {
        const result = [];
        this.getNeigborsCoords(polygon).forEach(({ q, r }) => {
            try {
                if (this._polygonArray[q][r].data('checked')) {
                    result.push((this._polygonArray[q][r]));
                }
            } catch { }
        })

        return result;
    }

    private getCheckedDomain(polygon: Polygon, accum?: Set<Polygon>): Polygon[] {
        const result = accum || new Set([polygon]);
        const startedResultSize = result.size;

        const checkedNaighbors = this.getCheckedNeighbors(polygon);
        checkedNaighbors.forEach((naighborPolygon: Polygon) => {
            result.add(naighborPolygon);
        });

        const afterCheckedResultSize = result.size;

        if (startedResultSize === afterCheckedResultSize) {
            return Array.from(result);
        } else {
            checkedNaighbors.forEach((value: Polygon) => this.getCheckedDomain(value, result));
            return Array.from(result);
        }
    }

    private checkedNeighborColor(polygon: Polygon): string {
        let isFirstCheckedNaighbor = true;
        let color = '';

        this.getNeigborsCoords(polygon).forEach(neighbor => {
            try {
                const neighborPolygon = this._polygonArray[neighbor.q][neighbor.r];
                if (neighborPolygon && neighborPolygon.data('checked')) {
                    if (!isFirstCheckedNaighbor && neighborPolygon.data('color').toUpperCase() !== color.toUpperCase()) {
                        this.rewriteDomainColor(neighborPolygon.data('color').toUpperCase(), color.toUpperCase())

                        return;
                    }
                    color = neighborPolygon.data('color').toUpperCase();
                    isFirstCheckedNaighbor = false;
                }
            } catch {
                console.log('cathced');
            }
        })

        return color;
    }

    private rewriteDomainColor(rewritingDomainKey, newDomainKey) {
        this._domainDict[rewritingDomainKey].forEach((polygon: Polygon) => {
            polygon.fill({ color: newDomainKey });
            polygon.data({ color: newDomainKey });
            this._domainDict[newDomainKey].push(polygon);
        });
        delete this._domainDict[rewritingDomainKey];
    }

    private removePolygonFromDomain(polygon: Polygon) {
        const domainKey = polygon.data('color').toUpperCase();
        this._domainDict[domainKey] = this._domainDict[domainKey].filter((polygonInDomain: Polygon) => polygonInDomain !== polygon);
    }

    private restructDomain(domainKey: string) {
        const domainDictRecord = this._domainDict[domainKey];
        const newDomain = [];
        domainDictRecord.forEach((polygon: Polygon) => {
            if (newDomain.every((value: Polygon[]) => value.indexOf(polygon) === -1)) {
                newDomain.push(this.getCheckedDomain(polygon));
            }
        });
        if (newDomain.length > 1) {
            for (let i = 1; i <= newDomain.length - 1; i++) {
                const newDomainGroupColor = this.getRandomColor();
                this._domainDict[newDomainGroupColor] = [];
                newDomain[i].forEach((polygon: Polygon) => {
                    this.removePolygonFromDomain(polygon);
                    this._domainDict[newDomainGroupColor].push(polygon);
                    polygon.data({ color: newDomainGroupColor });
                    polygon.fill({ color: newDomainGroupColor });
                })
            }
        }
    }
}