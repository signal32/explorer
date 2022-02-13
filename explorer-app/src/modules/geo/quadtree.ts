import {LatLng, LatLngBounds, LatLngBoundsLike} from '@/modules/geo/types';

const DEFAULT_DEPTH = 0;
const DEFAULT_WIDTH = 180 * 2;
const DEFAULT_HEIGHT = 90 * 2;

const defaultPosition = new LatLng(0,0);

export enum Side {
    NE,
    SE,
    SW,
    NW,
}

export class Quad<T> {

    value?: T;

    private parent?: Quad<T>;
    private children: Map<Side, Quad<T>>;
    private position: LatLng;
    private width: number;
    private height: number;
    private depth: number;

    constructor(value?: T, parent?: Quad<T>, position: LatLng = defaultPosition,
                width: number = DEFAULT_WIDTH, height: number = DEFAULT_HEIGHT, depth: number = DEFAULT_DEPTH) {
        this.children = new Map<Side, Quad<T>>();
        this.value = value;
        this.parent = parent;
        this.position = position;
        this.width = width;
        this.height = height;
        this.depth = depth;
    }

    find(area: LatLngBoundsLike, depth: number): Quad<T>[] {
        if (this.depth >= depth && this.withinArea(area) && this.childrenWithinArea(area).length == 0) {
            return [this];
        }

        let quads: Quad<T>[] = [];
        this.childrenWithinArea(area).forEach(child => {
            quads.push(...child.find(area, depth));
        })
        return quads;
    }

    findOrCreate(area: LatLngBoundsLike, depth: number): Quad<T>[] {
        if (this.depth >= depth && this.withinArea(area)) { return [this] }

        if (this.withinArea(area) && this.childrenWithinArea(area).length == 0) { this.initChildren() }

        let quads: Quad<T>[] = [];
        this.childrenWithinArea(area).forEach(child => {
            quads.push(...child.findOrCreate(area, depth));
        })
        return quads;
    }

    /**
     * Create a representation of this quad as a {LatLngBounds}
     */
    asArea(): LatLngBounds {
        return new LatLngBounds(
            new LatLng(this.position.lat + this.height/2, this.position.lng + this.width/2),
            new LatLng(this.position.lat - this.height/2, this.position.lng - this.width/2)
        );
    }

    setQuad(quad: Quad<T>, side: Side) {
        quad.parent = this;
        quad.depth = this.depth + 1;
        quad.width = this.width / 2;
        quad.height = this.height / 2;

        switch (side) {
            case Side.NE: quad.position = new LatLng(this.position.lat + (this.height/4), this.position.lng + (this.width/4)); break;
            case Side.SE: quad.position = new LatLng(this.position.lat - (this.height/4), this.position.lng + (this.width/4)); break;
            case Side.SW: quad.position = new LatLng(this.position.lat - (this.height/4), this.position.lng - (this.width/4)); break;
            case Side.NW: quad.position = new LatLng(this.position.lat + (this.height/4), this.position.lng - (this.width/4)); break;
        }

        this.children.set(side, quad);
    }

    getQuad(side: Side): Quad<T> | undefined {
        return this.children.get(side);
    }

    isLeaf(): boolean {
        return this.children.size == 0;
    }

    private withinArea(area: LatLngBoundsLike): boolean {
        return this.asArea().intersects(area);
    }

    private childrenWithinArea(area: LatLngBoundsLike): Quad<T>[] {
        let quads: Quad<T>[] = [];
        this.children.forEach(quad => {
            if (quad.withinArea(area)) quads.push(quad);
        })
        return quads;
    }

    private initChildren(): any {
        if (!this.children.has(Side.NE)) this.setQuad(new Quad<T>(), Side.NE);
        if (!this.children.has(Side.SE)) this.setQuad(new Quad<T>(), Side.SE);
        if (!this.children.has(Side.SW)) this.setQuad(new Quad<T>(), Side.SW);
        if (!this.children.has(Side.NW)) this.setQuad(new Quad<T>(), Side.NW);
    }

}







