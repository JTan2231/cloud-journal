import * as config from '../config.js';
import React from 'react';
import WordProcessor from '../components/word_processor.jsx';

import {
    Navigate,
    useLocation
} from 'react-router-dom';

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
            navEntries: false,
            navCollections: false,
            navLogin: props.location.state.userid === undefined,
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

    viewEntryRepository() {
        this.setState({ navEntries: true });
    }

    viewCollectionRepository() {
        this.setState({ navCollections: true });
    }

    viewAccount() {
        this.setState({ navAccount: true });
    }

    logout() {
        this.setState({
            navLogin: true,
            userSelection: { userid: null, username: null },
        });
    }

    navigation(condition, path, state) {
        return (
            <span>
                { condition && 
                  (<Navigate to={ path } state={ state } replace={ true } />) }
            </span>
        );
    }

    render() {
        const state = {
            userid: this.state.userSelection.userid,
            username: this.state.userSelection.username
        };

        return (
            <div>
                { this.navigation(this.state.navEntries, "/entries/", state) }
                { this.navigation(this.state.navCollections, "/collections/", state) }
                { this.navigation(this.state.navLogin, "/", state) }
                { this.navigation(this.state.navAccount, "/account/", state) }

                <div style={{ 'margin': '0px 0px 30px 0px' }}>
                    <span>Logged in as { this.state.userSelection.username }</span>
                    <br />
                    <div>
                        <span>Account: </span>
                        <button onClick={ this.viewAccount.bind(this) }>
                            Account settings
                        </button>
                        <button onClick={ this.logout.bind(this) }>
                            Log out
                        </button>
                    </div>
                    <div>
                        <span>Repositories: </span>
                        <button onClick={ this.viewEntryRepository.bind(this) }>
                            Entries
                        </button>
                        <button onClick={ this.viewCollectionRepository.bind(this) }>
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
