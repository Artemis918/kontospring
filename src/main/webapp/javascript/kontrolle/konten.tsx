import * as React from 'react'
import { MultiSelectLister, ColumnInfo, CellInfo } from '../utils/multiselectlister'
import { KontenTree } from './kontentree'
import { MonthSelect } from '../utils/monthselect'
import { KontenSelector } from '../utils/kontenselector'
import { Zuordnung, Template } from '../utils/dtos'
import { myParseJson } from '../utils/misc'
import * as css from './css/konten.css'


type SendMessageCallback = ( msg: string, error: boolean ) => void;

interface KontenProps {
    sendmessage: SendMessageCallback;
}

interface IState {
    selectedKonto: number;
    selectedGroup: number;
    month: number;
    year: number;
}

export class Konten extends React.Component<KontenProps, IState> {

    columns: ColumnInfo<Zuordnung>[];
    lister: React.RefObject<MultiSelectLister<Zuordnung>>;

    constructor( props: KontenProps ) {
        super( props );
        var currentTime = new Date();
        this.state = {
            selectedKonto: undefined,
            selectedGroup: undefined,
            month: currentTime.getMonth() + 1,
            year: currentTime.getFullYear()
        };
        this.lister = React.createRef();
        this.columns = [
            {
                header: 'Beschreibung',
                getdata: ( z: Zuordnung ) => { return z.detail }
            },
            {
                header: 'Soll',
                cellrender: ( cell: CellInfo<Zuordnung> ) => {
                    if ( cell.data.sollwert == 0 ) {
                        return null;
                    }
                    else {
                        return (
                            <div style={{ textAlign: 'right' }}>
                                {( cell.data.sollwert / 100 ).toFixed( 2 )}
                            </div>
                        )
                    }
                }
            },
            {
                header: 'Ist',
                cellrender: ( cell: CellInfo<Zuordnung> ) => {
                    return (
                        <div style={{ textAlign: 'right', backgroundColor: this.getColor( cell.data ) }}>
                            {( cell.data.beleg == 0 ) ? '--' : ( cell.data.istwert / 100 ).toFixed( 2 )}
                        </div>
                    )
                },
            },
            {
                header: 'ok',
                cellrender: ( cell: CellInfo<Zuordnung> ) => {
                    if ( cell.data.beleg != 0 && cell.rownum != -1 )
                        return (
                            <input type='checkbox'
                                checked={cell.data.committed}
                                onClick={() => this.commitAssignment( cell.data )} />
                        )
                },
            }
        ];

        this.commitAssignment = this.commitAssignment.bind( this );
        this.commitSelected = this.commitSelected.bind( this );
        this.commitAll = this.commitAll.bind( this );
        this.removeAssignment = this.removeAssignment.bind( this );
        this.replanAssignment = this.replanAssignment.bind( this );
    }

    getColor( z: Zuordnung ): string {
        if ( z.beleg == 0 || z.plan == 0 )
            return 'lightgrey';
        else if ( z.sollwert > z.istwert )
            return 'red';
        else
            return 'green';
    }

    commit( z: Zuordnung[] ): void {
        var ids: number[] = z.map( ( za: Zuordnung ) => { return za.id; } );
        var self: Konten = this;
        fetch( '/assign/commit', {
            method: 'post',
            body: JSON.stringify( ids ),
            headers: {
                "Content-Type": "application/json"
            }
        } ).then( function( response ) {
            self.lister.current.reload();
        } );
    }

    commitAssignment( a: Zuordnung ): void {
        var self: Konten = this;
        fetch( '/assign/invertcommit/' + a.id )
            .then( function( response ) {
                self.lister.current.reload();
            } );
    }

    commitSelected(): void {
        this.commit( this.lister.current.getSelectedData() );
        this.lister.current.reload();
    }

    commitAll(): void {
        this.commit( this.lister.current.getDataAll() );
        this.lister.current.reload();
    }

    replanAssignment(): void {
        var zuordnungen: Zuordnung[] = this.lister.current.getSelectedData();
        if ( zuordnungen.length != 1 ) {
            this.props.sendmessage( "es muss genau ein Eintrag selektiert sein", true );
        }
        else {
            var id: number = zuordnungen[0].id;
            var url: string = '/assign/replan/';

            if ( id == 0 || id == undefined ) {
                id = zuordnungen[0].plan;
                url = '/assign/endplan/';
            }

            if ( id != undefined ) {
                var self: Konten = this;
                fetch( url + id, { headers: { "Content-Type": "application/json" } } )
                    .then( ( response: Response ) => response.text() )
                    .then( () => self.lister.current.reload() );
            }
        }
    }

    removeAssignment(): void {
        var ids: number[] = this.lister.current.getSelectedData().map( ( za: Zuordnung ) => { return za.beleg; } );
        var self: Konten = this;
        fetch( '/assign/remove', {
            method: 'post',
            body: JSON.stringify( ids ),
            headers: {
                "Content-Type": "application/json"
            }
        } ).then( function( response ) {
            self.lister.current.reload();
        } );
    }

    createExt(): string {
        var date: string = '/' + this.state.year + '/' + this.state.month + '/';
        if ( this.state.selectedKonto != undefined ) {
            return 'getKonto' + date + this.state.selectedKonto;
        }
        else if ( this.state.selectedGroup != undefined ) {
            return 'getKontoGroup' + date + this.state.selectedGroup;
        }
        else {
            return 'getKontoGroup' + date + '1';
        }
    }

    createFooter( z: Zuordnung[] ): Zuordnung {
        var footer: Zuordnung = new Zuordnung();
        var istwert: number = 0;
        var sollwert: number = 0;
        z.map( ( zuordnung: Zuordnung ) => { istwert += zuordnung.istwert; if ( zuordnung.sollwert != undefined ) sollwert += zuordnung.sollwert; } )
        footer.detail = 'Summe';
        footer.istwert = istwert;
        footer.sollwert = sollwert;
        return footer;
    }

    render(): JSX.Element {
        return (
            <div>
                <div style={{ border: '1px solid black' }}>

                    <button onClick={() => this.commitSelected()}> Auswahl Bestätigen </button>
                    <button onClick={() => this.commitAll()}> Alles Bestätigen </button>
                    <button onClick={() => this.removeAssignment()}> Zuordnung lösen </button>
                    <button onClick={() => this.replanAssignment()}> Plan anpassen </button>
                </div>
                <table>
                    <tbody>
                        <tr>

                            <td style={{ border: '1px solid black', verticalAlign: 'top' }}>
                                <div className={css.monthselect}>
                                    <MonthSelect label='Monat: '
                                        onChange={( m: number, y: number ) => this.setState( { month: m, year: y } )}
                                        month={this.state.month}
                                        year={this.state.year} />
                                </div>
                                <KontenTree
                                    handleKGSelect={( kg: number ) => this.setState( { selectedGroup: kg, selectedKonto: undefined } )}
                                    handleKontoSelect={( k: number ) => this.setState( { selectedGroup: undefined, selectedKonto: k } )}
                                />
                            </td>
                            <td style={{ border: '1px solid black' }}>
                                <MultiSelectLister<Zuordnung>
                                    createFooter={this.createFooter}
                                    url='assign/'
                                    lines={28}
                                    ext={this.createExt()}
                                    columns={this.columns}
                                    ref={this.lister} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}