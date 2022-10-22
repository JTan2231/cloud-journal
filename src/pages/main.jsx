import * as config from '../config.js';
import React from 'react';
import WordProcessor from '../components/word_processor.jsx';

export default class MainPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            usersLoaded: false,
            entriesLoaded: 0,
            userSelection: { userid: null, username: null },
            entrySelection: null,
            collectionSelection: { collectionid: null, name: null },
            entryList: [],
        };

        this.userList = [];
        this.entryList = [];

        this.wordProcessor = React.createRef();
        this.saveButton = React.createRef();

        this.username = React.createRef();
        this.password = React.createRef();
        this.passwordConfirm = React.createRef();
        this.userButton = React.createRef();
        this.existingUserError = React.createRef();

        this.newEntryName = React.createRef();

        this.usernameLogin = React.createRef();
        this.passwordLogin = React.createRef();
        this.loginButton = React.createRef();
        this.loginErrorText = React.createRef();

        this.collectionNameInput = React.createRef();
        this.collectionButton = React.createRef();
        this.existingCollectionError = React.createRef();

        this.collectionEntryButton = React.createRef();
        this.entryListDropdown = React.createRef();
    }

    componentDidMount() {
        this.userButton.current.disabled = true;
        this.loginButton.current.disabled = true;
        this.collectionButton.current.disabled = true;

        //this.fetchUsers();
    }

    userClick(userid, username) {
        this.setState({ userSelection: { userid, username } });
        this.passwordLogin.current.value = "";
        this.loginButton.current.disabled = false;
        this.fetchEntries(userid);
        this.fetchCollections(userid);
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

    passwordCheck() {
        const x = this.password.current.value;
        const y = this.passwordConfirm.current.value;

        this.buttonCheck(x === y);
    }

    buttonCheck(pwd) {
        if (pwd && this.username.current.value !== '') {
            this.userButton.current.disabled = false;
        }
        else {
            this.userButton.current.disabled = true;
        }
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

    createUser() {
        fetch(config.API_ROOT + 'users/', {
            method: 'POST',
            body: JSON.stringify({
                username: this.username.current.value,
                password: this.password.current.value,
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => res.json()).then(res => {
            if (res.errors) {
                this.existingUserError.current.textContent = "Error: " + res.errors;
            }
            else {
                this.existingUserError.current.textContent = "";
            }
        });
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

    fetchUsers() {
        fetch(config.API_ROOT + 'users/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => res.json()).then(res => {
            this.userList = [];
            const func = this.userClick.bind(this);
            for (const user of res) {
                this.userList.push((
                    <tr>
                        <td style={{ border: '1px solid black' }} 
                            onClick={ () => func(user.user_id, user.username) }>
                            { user.username }
                        </td>
                    </tr>
                ));
            }

            this.setState({ usersLoaded: true });
        });
    }

    loginClick() {
        const username = this.usernameLogin.current.value;
        fetch(config.API_ROOT + 'authentication/', {
            method: 'POST',
            body: JSON.stringify({
                username: username,
                password: this.passwordLogin.current.value,
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => res.json()).then(res => {
            if (res.authenticated) {
                this.loginButton.current.disabled = true;
                this.passwordLogin.current.value = "";
                this.loginErrorText.current.textContent = "";

                this.setState({ userSelection: {
                    userid: res.user_id,
                    username: username
                } });

                this.fetchEntries(res.user_id);
                this.fetchCollections(res.user_id);
            }
            else if (res.errors) {
                this.loginErrorText.current.textContent = res.errors;
            }
        });
    }

    loginInput() {
        const username = this.usernameLogin.current.value;
        const password = this.passwordLogin.current.value;
        if (username.length > 0 && password.length > 0) {
            this.loginButton.current.disabled = false;
        }
        else {
            this.loginButton.current.disabled = true;
        }
    }

    loginKeyPress(e) {
        if (e.key === 'Enter' && !this.loginButton.current.disabled) {
            this.loginClick();
        }
    }

    createUserKeyPress(e) {
        if (e.key === 'Enter' && !this.userButton.current.disabled) {
            this.createUser();
        }
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
        const disabled = {
            pointerEvents: 'none',
            opacity: 0.4,
        };

        const base = {};

        return (
            <div>
                <div>
                    <input ref={ this.username } type="text" id="username" name="username" maxlength="20" placeholder="new user" />
                    <input ref={ this.password } onInput={ this.passwordCheck.bind(this) } onKeyPress={ this.createUserKeyPress.bind(this) } type="text" id="password" name="password" maxlength="20" placeholder="password" />
                    <input ref={ this.passwordConfirm } onInput={ this.passwordCheck.bind(this) } onKeyPress={ this.createUserKeyPress.bind(this) } type="text" id="password_confirm" name="password_confirm" maxlength="20" placeholder="confirm password" />
                    <button ref={ this.userButton } onClick={ this.createUser.bind(this) }>
                        Create user
                    </button>
                </div>
                <div ref={ this.existingUserError } style={{ color: 'red' }}>
                    &nbsp;
                </div>

                <table style={{ borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td colspan="2">
                                <b>User Login</b>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <input type="text" ref={ this.usernameLogin } onInput={ this.loginInput.bind(this) } placeholder="username" />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <input type="text" ref={ this.passwordLogin } onInput={ this.loginInput.bind(this) } onKeyPress={ this.loginKeyPress.bind(this) } placeholder="password" />
                            </td>
                            <td>
                                <button ref={ this.loginButton } onClick={ this.loginClick.bind(this) }>
                                    Login
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div ref={ this.loginErrorText } style={{ color: 'red' }}>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

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

                <br />

                <h1>
                    Testing
                </h1>
                <div id="testing_div">
                    <input ref={ this.collectionNameInput } onInput={ this.createCollectionInput.bind(this) } type="text" maxlength="50" placeholder="collection name" />
                    <button ref={ this.collectionButton } onClick={ this.createCollection.bind(this) }>
                        Create collection
                    </button>
                    <br />
                    <div ref={ this.existingCollectionError }>
                    </div>
                </div>
            </div>
        );
    }
}
