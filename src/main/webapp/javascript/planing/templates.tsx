import * as React from 'react'
import { TemplateEditor } from './templateeditor'
import { SingleSelectLister, ColumnInfo, CellInfo } from '../utils/singleselectlister'
import { Template } from '../utils/dtos'

type SendMessage = ( message: string, error: boolean ) => void;

interface TemplateProps {
    sendmessage: SendMessage;
}

export class Templates extends React.Component<TemplateProps, {}> {

    lister: SingleSelectLister<Template>;
    editor: TemplateEditor;
    columns: ColumnInfo<Template>[];

    constructor( props: TemplateProps ) {
        super( props );
        this.state = {};
        this.refreshlist = this.refreshlist.bind( this );
        this.refresheditor = this.refresheditor.bind( this );
        this.lister = undefined;
        this.editor = undefined;
        this.columns = [{
            header: 'Gültig von',
            getdata: ( d: Template ): string => { return d.gueltigVon.toLocaleDateString( 'de-DE' ) },
        }, {
            header: 'Gültig bis',
            getdata: ( d: Template ): string => { return d.gueltigBis != null ? d.gueltigBis.toLocaleDateString( 'de-DE' ):"" },
        }, {
            header: 'Rhythmus',
            getdata: ( d: Template ): string => { return d.rythmus.toString( 10 ) }
        }, {
            header: 'Beschreibung',
            getdata: ( d: Template ): string => { return d.shortdescription; }
        }, {
            header: 'Betrag',
            cellrender: ( cellinfo : CellInfo<Template> ) => (
                <div style={{
                    color: cellinfo.data.wert >= 0 ? 'green' : 'red',
                    textAlign: 'right'
                }}>
                    {( cellinfo.data.wert / 100 ).toFixed( 2 )}
                </div>
            )
        }]
    }

    refreshlist(): void {
        this.lister.reload();
    }

    refresheditor( template: Template ): void {
        this.editor.setTemplate( template.id );
    }

    render(): JSX.Element {
        return (
            <table style={{ border: '1px solid black' }}>
                <tbody>
                    <tr>
                        <td style={{ width: '20%', border: '1px solid black' }}>
                            <TemplateEditor ref={( ref ) => { this.editor = ref; }} onChange={this.refreshlist} />
                        </td>
                        <td style={{ width: '80%' }}>
                            <SingleSelectLister<Template> ref={( ref ) => { this.lister = ref; }}
                                handleChange={this.refresheditor}
                                url='templates/list'
                                columns={this.columns} />
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }

}