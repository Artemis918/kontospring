import * as React from 'react'
import { MultiSelectLister } from './utils/multiselectlister';
import { KontoAssign } from './konten/kontoassign'
import { TemplateEditor } from './planing/templateeditor';
import "react-table/react-table.css";

type SendMessage = (m:string,error: boolean)=>void 

class BuchungsBeleg {
    id:number;
}

interface BuchenProps {
    sendmessage: SendMessage;
}

interface IState {
    plan: number;
    kontoassign: boolean;
    deftext: string;
    defkonto : number;
    defgroup: number
}

export class Buchen extends React.Component<BuchenProps,IState> {

    lister: MultiSelectLister<BuchungsBeleg>;
    
    constructor( props: BuchenProps ) {
        super( props )
        this.lister = undefined;
        this.state = { plan: undefined, kontoassign: false, deftext: "", defkonto:1, defgroup:1 }
        this.createPlan = this.createPlan.bind( this );
        this.onChange = this.onChange.bind( this );
        this.assignSelected = this.assignSelected.bind( this );
    }

    assignAuto() :void {
        fetch( 'http://localhost:8080/assign/all' ).then( response => response.json() );
        this.lister.reload();
    }

    assignKonto() :void {
        if ( this.lister.hasSelectedData() )
            this.setState( { kontoassign: true } );
    }

    assignManuell() :void {
    }

    assignSelected( k :number, t:string ):void {
        var self = this;
        if ( k != undefined ) {
            var request = { text: t, konto: k, ids: this.lister.getSelectedData().map( d => d.id ) };
            var self = this;
            var jsonbody = JSON.stringify( request );
            fetch( '/assign/tokonto', {
                method: 'post',
                body: jsonbody,
                headers: {
                    "Content-Type": "application/json"
                }
            } ).then( function( response ) {
                self.setState( { kontoassign: false } );
            } );
        }
    }

    createPlan() :void {
        var data : BuchungsBeleg[] = this.lister.getSelectedData();
        if ( data.length != 1 ) {
            this.props.sendmessage( "es muss genau ein Beleg selektiert sein", true );
        }
        else {
            this.setState( { plan: data[0].id } )
        }
    }

    onChange() :void {
        this.setState( { plan: undefined } );
    }

    render() :JSX.Element {
        var columns = [{
            Header: 'Datum',
            accessor: 'date',
            width: '150'
        }, {
            Header: 'Empf./Absender',
            accessor: 'partner',
            width: '400'
        }, {
            Header: 'Detail',
            accessor: 'details',
            width: '30%'
        }, {
            Header: 'Betrag',
            accessor: 'betrag',
            width: '150',
            Cell: (row: any) => (

                <div style={{
                    color: row.value >= 0 ? 'green' : 'red',
                    textAlign: 'right'
                }}>
                    {( row.value / 100 ).toFixed( 2 )}
                </div>

            )
        }];

        if ( this.state.plan !== undefined ) {
            return <TemplateEditor beleg={this.state.plan} onChange={() => this.onChange()} />
        }
        return (
            <div>
                <button className="button" onClick={( e ) => this.assignAuto()}> Automatisch </button>
                <button className="button" onClick={( e ) => this.assignKonto()}> Konto </button>
                <button className="button" onClick={( e ) => this.assignManuell()}> Manuell </button>
                <button className="button" onClick={( e ) => this.createPlan()}> Planen </button>
                <div>
                    <MultiSelectLister<BuchungsBeleg> columns={columns}
                        url='http://localhost:8080/belege/unassigned'
                        ref={( ref ) => { this.lister = ref }} />
                </div>
                {this.state.kontoassign ? <KontoAssign 
                                          text={this.state.deftext}
                                          konto={this.state.defkonto}
                                          group={this.state.defgroup}
                                          handleAssign={( k, t ) => { this.assignSelected( k, t ) }} />
                                        : null
                }
            </div>
        )
    }
}