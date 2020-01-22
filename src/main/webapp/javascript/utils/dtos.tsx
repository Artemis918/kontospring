
// =====================================================
export class AccountRecord {
    id: number;
    eingang: Date;
    creation: Date;
    wertstellung: Date;
    type: number;
    absender: string;
    empfaenger: string;
    wert: number;
    details: string;
    einreicherId: string;
    mandant: string;
    referenz: string;

    constructor() {
        this.id = undefined;
        this.eingang = new Date();
        this.creation = new Date();
        this.wertstellung = new Date();
        this.type = 8;
        this.absender = '';
        this.empfaenger = '';
        this.wert = 0;
        this.details = '';
        this.einreicherId = '';
        this.mandant = '';
        this.referenz = '';
    }
}

//=====================================================
export class Pattern {
    sender: string;
    receiver: string;
    referenceID: string;
    mandat: string;
    senderID: string;
    details: string;
    [key: string]: string;

    constructor() {
        this.sender = '';
        this.senderID = '';
        this.receiver = '';
        this.referenceID = '';
        this.details = '';
        this.mandat = '';
    }

}

//=====================================================
export class Plan {
    id: number;
    startdate: Date;
    plandate: Date;
    enddate: Date;
    position: number;
    description: string;
    shortdescription: string;
    category: number;
    subcategory: number;
    categoryname: string;
    subcategoryname: string;
    wert: number;
    patterndto: Pattern;
    matchstyle: number;

    constructor() {
        var date = new Date();
        this.id = undefined;
        this.startdate = date;
        this.plandate = date;
        this.enddate = date;
        this.position = 0;
        this.description = 'Neuer Plan';
        this.shortdescription = 'neu';
        this.category = 1;
        this.subcategory = 1;
        this.categoryname = '';
        this.subcategoryname = '';
        this.wert = 0;
        this.patterndto = new Pattern();
        this.matchstyle = 0;
    }
}

//=====================================================
export class Template {
    id?: number;
    validFrom: Date;
    validUntil: Date;
    start: Date;
    vardays: number;
    anzahl: number;
    rythmus: number;
    description: string;
    category: number;
    subcategory: number;
    categoryname: string;
    subcategoryname: string;
    position: number;
    value: number;
    pattern: Pattern;
    shortdescription: string;
    matchstyle: number;
    previous: number;

    constructor() {
        var date = new Date();
        this.id = undefined;
        this.validFrom = date;
        this.validUntil = undefined;
        this.start = date;
        this.vardays = 4;
        this.anzahl = 1;
        this.rythmus = 2;
        this.description = '';
        this.category = 1;
        this.subcategory = 1;
        this.categoryname = '';
        this.subcategoryname = '';
        this.position = 1;
        this.value = 0;
        this.pattern = new Pattern();
        this.shortdescription = '';
        this.matchstyle = 0;
        this.previous = undefined;
    }
}
//=====================================================

export class StatsDTO {
    max: number;
    min: number;
    data: StatsMonthDTO[];
}

export class StatsMonthDTO {
    day: Date;
    value: number;
    planvalue: number;
    forecast: number;
}

//=====================================================
export class  Assignment {
    id: number;
    detail: string;
    description: string;
    sollwert?: number;
    istwert: number;
    committed: boolean;
    plan?: number;
    accountrecord: number;
    subcategory: number;
    category?: number;
}

export interface SubCategory {
    id: number;
    shortdescription: string;
    description:string;
    art: number;
    category:number;
}

export interface Category {
    id: number;
    shortdescription: string;
    description: string;
}

//=====================================================
export interface EnumDTO {
    text: string;
    value: number;
}