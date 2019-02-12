
// =====================================================
export class BuchungsBeleg {
    id: number;
    eingang: Date;
    beleg: Date;
    wertstellung: Date;
    art: number;
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
        this.beleg = new Date();
        this.wertstellung = new Date();
        this.art = 8;
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
    kontogroup: number;
    konto: number;
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
        this.kontogroup = 1;
        this.konto = 1;
        this.wert = 0;
        this.patterndto = new Pattern();
        this.matchstyle = 0;
    }
}

//=====================================================
export class Template {
    id?: number;
    gueltigVon: Date;
    gueltigBis: Date;
    start: Date;
    vardays: number;
    anzahl: number;
    rythmus: number;
    description: string;
    kontogroup: number;
    konto: number;
    position: number;
    wert: number;
    pattern: Pattern;
    shortdescription: string;
    matchstyle: number;
    previous: number;

    constructor() {
        var date = new Date();
        this.id = undefined;
        this.gueltigVon = date;
        this.gueltigBis = undefined;
        this.start = date;
        this.vardays = 4;
        this.anzahl = 1;
        this.rythmus = 1;
        this.description = 'Neue Vorlage';
        this.kontogroup = 1;
        this.konto = 1;
        this.position = 1;
        this.wert = 0;
        this.pattern = new Pattern();
        this.shortdescription = 'neu';
        this.matchstyle = 0;
        this.previous = undefined;
    }
}

//=====================================================
export class  Zuordnung {
    id: number;
    detail: string;
    description: string;
    sollwert?: number;
    istwert: number;
    committed: boolean;
    plan?: number;
    beleg: number;
    konto: number;
    group?: number;
}


//=====================================================
export interface EnumDTO {
    text: string;
    value: number;
}