import * as config from '../config.js';
import React from 'react';
import WordProcessor from '../components/word_processor.jsx';

import { useLocation } from 'react-router-dom';

function locationHookWrapper(component) {
    return function WrappedComponent(props) {
        const loc = useLocation();
        return <HomePage {...props} location={ loc } />;
    }
}

class HomePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userSelection: { userid: props.location.state.userid, username: props.location.state.username },
            entriesLoaded: 0,
            entrySelection: null,
            collectionSelection: { collectionid: null, name: null },
            entryList: [],
        };

        this.userList = [];
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
        this.fetchCollections(this.state.userSelection.userid);
        this.collectionClick(-1, 'No collection');
    }

    loadEntryListHTML(entryList) {
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
            this.wordProcessor.current.loadHTML('Edit me');

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
                    <td>
                        <button onClick={ this.createCollectionEntry.bind(this) }
                                ref={ this.collectionEntryButton }>
                            Add Entry to Collection
                        </button>
                    </td>
                </tr>
            ));
        }

        const createEntryFunc = this.createEntry.bind(this);
        entryListHTML.push((
            <tr>
                <td>
                    <input type="text" ref={ this.newEntryName } defaultValue="Untitled" />
                </td>
                <td style={{ border: '1px solid black' }}
                    onClick={ () => createEntryFunc(this.state.userSelection.userid) }>
                    <button>Create Entry</button>
                </td>
            </tr>
        ));

        this.setState({ entryListHTML: entryListHTML });
    }

    createCollectionEntry() {
        const selCol = this.state.collectionSelection;
        fetch(config.API_ROOT + 'collectionentries/', {
            method: 'POST',
            body: JSON.stringify({
                collection_id: selCol.collectionid,
                entry_id: this.entryListDropdown.current.value,
                user_id: this.state.userSelection.userid
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => res.json()).then(res => {
            if (res.errors) {
                alert(res.errors);
            }
            else {
                this.collectionClick(selCol.collectionid, selCol.name);
            }
        });
    }

    fetchEntries(userid) {
        fetch(config.API_ROOT + 'entries/' + '?user_id=' + userid, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => res.json()).then(res => {
            console.log('fetchEntries', res);
            this.setState({ entryList: res });
        });
    }

    fetchCollections(userid) {
        fetch(config.API_ROOT + 'collections/' + '?user_id=' + userid, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => res.json()).then(res => {
            var collectionList = [];
            const func = this.collectionClick.bind(this);

            collectionList.push((
                <tr>
                    <td style={{ border: '1px solid black' }} 
                        onClick={ () => func(-1) }>
                        No collection
                    </td>
                </tr>
            ));

            if (res.length > 0) {
                for (const collection of res) {
                    collectionList.push((
                        <tr>
                            <td style={{ border: '1px solid black' }} 
                                onClick={ () => func(collection.collection_id, collection.name) }>
                                { collection.name }
                            </td>
                        </tr>
                    ));
                }
            }
            else {
                this.wordProcessor.current.loadHTML('Edit me');
            }

            collectionList.push((
                <tr>
                    <td>
                        <input type="text" ref={ this.collectionNameInput } defaultValue="Untitled" />
                    </td>
                    <td style={{ border: '1px solid black' }}
                        onClick={ this.createCollection.bind(this) }>
                        <button>Create Collection</button>
                    </td>
                </tr>
            ));

            this.setState({ collectionList: collectionList });
        });
    }

    entryClick(entryid) {
        fetch(config.API_ROOT + 'entries/' + '?id=' + entryid, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => res.json()).then(res => {
            this.wordProcessor.current.loadHTML(res.raw_html);
            this.setState({ entrySelection: res.title });
        });
    }

    collectionClick(collectionid, name) {
        if (collectionid === -1) {
            this.loadEntryListHTML(this.state.entryList);
            this.setState({
                collectionSelection: {
                    collectionid: collectionid,
                    name: 'No collection'
                }
            });
        }
        else {
            this.setState({
                collectionSelection: {
                    collectionid: collectionid,
                    name: name
                }
            });

            fetch(config.API_ROOT + 'collectionentries/?collection_id=' + collectionid, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }).then(res => res.json()).then(res => {
                console.log(res);

                const entryList = this.state.entryList;
                var entryListDisplay = [];
                var entryIds = [];
                for (const collectionEntry of res) {
                    entryIds.push(collectionEntry.id);
                }

                entryListDisplay = entryList.filter(entry => entryIds.includes(entry.id));
                console.log('display', entryListDisplay);
                this.loadEntryListHTML(entryListDisplay);
            });
        }
    }

    createEntry(userid) {
        const wrappedHTML = '<div>' + this.wordProcessor.current.exportHTML() + '</div>';
        fetch(config.API_ROOT + 'entries/', {
            method: 'POST',
            body: JSON.stringify({
                user_id: userid,
                title: this.newEntryName.current.value,
                raw_html: wrappedHTML,
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => res.json()).then(res => {
            this.fetchEntries(userid);
        });
    }

    saveEntry() {
        const id = this.state.entrySelection;
        var wrappedHTML = this.wordProcessor.current.exportHTML();
        var rawHTML;

        const parser = new DOMParser();
        const docBody = parser.parseFromString(wrappedHTML, "text/html").body;

        if (docBody.child && docBody.child.id === "wrapper") {
            rawHTML = wrappedHTML;
        }
        else {
            rawHTML = wrappedHTML.substring(18, wrappedHTML.length - 6);
        }

        fetch(config.API_ROOT + 'entries/?id=' + id, {
            method: 'PUT',
            body: JSON.stringify({
                raw_html: rawHTML,
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }

    createCollectionInput(e) {
        if (this.collectionNameInput.current.value !== '') {
            this.collectionButton.current.disabled = false;
        }
        else {
            this.collectionButton.current.disabled = true;
        }
    }

    createCollection() {
        fetch(config.API_ROOT + 'collections/', {
            method: 'POST',
            body: JSON.stringify({
                name: this.collectionNameInput.current.value,
                user_id: this.state.userSelection.userid
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => res.json()).then(res => {
            if (res.errors) {
                this.existingCollectionError.current.textContent = "Error: " + res.errors;
            }
            else {
                this.existingCollectionError.current.textContent = "";
                this.fetchCollections(this.state.userSelection.userid);
            }
        });
    }

    render() {
        return (
            <div>
                <div>
                    Selected user: { this.state.userSelection.username }
                </div>

                <table style={{ borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td>
                                <b>Collections</b>
                            </td>
                        </tr>
                        { this.state.collectionList }
                    </tbody>
                </table>

                <div>
                    Selection collection: { this.state.collectionSelection.name }
                </div>

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
                <br />

                <div>
                    Selected entry: { this.state.entrySelection }
                </div>
                <WordProcessor ref={ this.wordProcessor } />
                <button ref={ this.saveButton } onClick={ this.saveEntry.bind(this) }>
                    Save entry
                </button>
            </div>
        );
    }
}

export default locationHookWrapper(HomePage);
