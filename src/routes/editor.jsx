import * as config from '../config.js';
import React from 'react';
import WordProcessor from '../components/word_processor.jsx';

import { useLocation } from 'react-router-dom';

function locationHookWrapper(component) {
    return function WrappedComponent(props) {
        const loc = useLocation();
        return <Editor {...props} location={ loc } />;
    }
}

class Editor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userSelection: { userid: props.location.state.userid, username: props.location.state.username },
            entriesLoaded: 0,
            entrySelection: null,
        };

        this.wordProcessor = React.createRef();
        this.saveButton = React.createRef();

        this.entryName = React.createRef();
        this.collectionName = React.createRef();
    }

    componentDidMount() {
    }

    // PLACEHOLDER
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

    // PLACEHOLDER
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

    // TODO
    viewEntries() {
    }

    // TODO
    viewCollections() {
    }

    // TODO
    viewAccount() {
    }

    // TODO
    logout() {
    }

    render() {
        return (
            <div>
                <div style={{ 'margin': '0px 0px 30px 0px' }}>
                    <span>Logged in as { this.state.userSelection.username }</span>
                    <br />
                    <div>
                        <span>Account: </span>
                        <button onClick={ this.viewAccount }>
                            Account settings
                        </button>
                        <button onClick={ this.logout }>
                            Log out
                        </button>
                    </div>
                    <div>
                        <span>Repositories: </span>
                        <button onClick={ this.viewEntries }>
                            Entries
                        </button>
                        <button onClick={ this.viewCollections }>
                            Collections
                        </button>
                    </div>
                </div>

                <div>
                    <input ref={ this.entryName } type="text" id="entryName" name="entryName" maxlength="20" placeholder="Entry name" />
                    <input ref={ this.collectionName } type="text" id="collectionName" name="collectionName" maxlength="20" placeholder="Collection name" />
                    <button ref={ this.saveButton } onClick={ this.saveEntry.bind(this) }>
                        Save entry
                    </button>
                </div>
                <WordProcessor ref={ this.wordProcessor } />
            </div>
        );
    }
}

export default locationHookWrapper(Editor);
