import * as config from '../config.js';
import React from 'react';
import WordProcessor from '../components/word_processor.jsx';
import NavigationBar from './navigation_bar.jsx';

import { useLocation } from 'react-router-dom';

function locationHookWrapper(component) {
    return function WrappedComponent(props) {
        const loc = useLocation();
        return <Entries {...props} location={ loc } />;
    }
}

class Entries extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userSelection: {
                userid: props.location.state.userid,
                username: props.location.state.username
            },
            entryList: [],
        };

        this.entryList = [];

        this.wordProcessor = React.createRef();
        this.saveButton = React.createRef();

        this.newEntryName = React.createRef();

        this.collectionNameInput = React.createRef();
        this.existingCollectionError = React.createRef();

        this.collectionEntryButton = React.createRef();
        this.entryListDropdown = React.createRef();
    }

    componentDidMount() {
        this.fetchEntries(this.state.userSelection.userid);
    }

    loadEntryListHTML() {
        const entryList = this.state.entryList;
        console.log("entryList: ", entryList);
        var entryListHTML = [];
        const func = this.entryClick.bind(this);

        if (entryList.length > 0) {
            for (const entry of entryList) {
                entryListHTML.push((
                    <tr>
                        <td style={{ border: '1px solid black' }} 
                            onClick={ () => func(entry.id) }>
                            { entry.title }
                        </td>
                    </tr>
                ));
            }
        }
        else {
            var optionsList = [];
            for (var i = 0; i < this.state.entryList.length; i++) {
                const entry = this.state.entryList[i];
                optionsList.push(( 
                    <option value={ entry.id }>{ entry.title }</option>
                ));
            }

            entryListHTML.push((
                <tr>
                    <td style={{ border: '1px solid black' }}>
                        <select ref={ this.entryListDropdown } style={{ width: '100%' }}>
                            { optionsList }
                        </select>
                    </td>
                </tr>
            ));
        }

        this.setState({ entryListHTML: entryListHTML });
    }

    fetchEntries(userid) {
        fetch(config.API_ROOT + 'entries/' + '?user_id=' + userid, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => res.json()).then(res => {
            this.setState({ entryList: res });
            this.loadEntryListHTML();
        });
    }

    entryClick(entryid) {
        fetch(config.API_ROOT + 'entries/' + '?id=' + entryid, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => res.json()).then(res => {
            this.setState({ entrySelection: res.title });
        });
    }

    render() {
        return (
            <div>
                <NavigationBar />
                <table style={{ borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td>
                                <b>Entries</b>
                            </td>
                        </tr>
                        { this.state.entryListHTML }
                    </tbody>
                </table>
            </div>
        );
    }
}

export default locationHookWrapper(Entries);
