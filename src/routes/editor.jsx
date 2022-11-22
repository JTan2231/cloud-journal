import * as config from '../config.js';
import * as styles from '../styles.js';
import React from 'react';
import WordProcessor from '../components/word_processor.jsx';
import TypingText from '../components/typing_text.jsx';

import Search from './search.jsx';

export default class Editor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loginClicked: false,
            newUserClicked: false,
            simClicked: false,
            loggedInUser: '',
            userid: -1,
            entryid: -1,
            loginError: false,
            newUserError: false,
            lastSaved: '',
            searchClicked: false,
            searchResults: [],
            entryPreviews: [],
            simResults: [],
        };

        this.textStyle = {
            margin: '1em',
            color: 'rgb(191, 187, 187)',
            fontFamily: 'Courier New',
            fontSize: '14px',
        };

        this.wordProcessor = React.createRef();

        this.usernameInput = React.createRef();
        this.passwordInput = React.createRef();

        this.newUsernameInput = React.createRef();
        this.newPasswordInput = React.createRef();

        this.searchInput = React.createRef();
    }

    loginButtonClick() {
        if (!this.state.newUserClicked) {
            this.setState({ loginClicked: !this.state.loginClicked, loginError: false });

            this.usernameInput.current.focus();
            this.usernameInput.current.select();
        }
    }

    userLoginAttempt() {
        /* TODO
         *
         * make whatever REST request needed to login
         * update an unmade div somewhere on the page saying you're logged in as {user}
         * close the login fields
         * replace login button with logout button
         *
         */

        const username = this.usernameInput.current.value;
        fetch(config.API_ROOT + 'authentication/', {
            method: 'POST',
            body: JSON.stringify({
                username: username,
                password: this.passwordInput.current.value,
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => res.json()).then(res => {
            if (res.authenticated) {
                this.setState({
                    loggedInUser: username,
                    userid: res.user_id,
                    loginError: false
                });

                this.getEntries(res.user_id);
            }
            else if (res.errors) {
                this.setState({ loginError: true });
            }
        });
    }

    getEntries(userid) {
        fetch(config.API_ROOT + 'entries/?user_id=' + userid, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(res => res.json()).then(res => {
            this.setState({ entryPreviews: res.map(kp => ({ entryid: kp.id, preview: kp.text_preview })) });
        });
    }

    createUserAttempt() {
        fetch(config.API_ROOT + 'users/', {
            method: 'POST',
            body: JSON.stringify({
                username: this.newUsernameInput.current.value,
                password: this.newPasswordInput.current.value,
            }),
            headers: {    
                'Content-Type': 'application/json',
            }
        }).then(res => res.json()).then(res => {
            if (res.errors) {
                this.setState({ newUserError: true });
            }
        });
    }

    formatEntryList(entries, indices) {
        var processed = [];

        if (indices === null || indices === undefined) {
            indices = [...Array(entries.length).keys()];
        }

        for (var i = 0; i < indices.length; i++) {
            processed.push(
                <div style={ this.textStyle }>
                    <span>{ indices[i]+1 }. { entries[indices[i]].preview }</span>
                </div>
            );
        }

        return processed;
    }

    formatSimResultsList() {
        var processed = [];

        for (var i = 0; i < this.state.simResults.length; i++) {
            let res = this.state.simResults[i];
            processed.push(
                <div style={ this.textStyle }>
                    <span>{ res.entryid }. { res.text_preview }</span>
                </div>
            );
        }

        return processed;
    }

    similarityEntryListFormat(entries) {
        var processed = [];
        for (var i = 0; i < entries.length; i++) {
            const kp = entries[i];

            processed.push(
                <div style={ this.textStyle } onClick={ (() => this.entrySimilarityQuery(kp.entryid)).bind(this) }>
                    <span>{ i+1 }. { kp.preview }</span>
                </div>
            );
        }

        return processed;
    }

    entryQuery() {
        const userid = this.state.userid;
        const query = this.searchInput.current.value;
        fetch(config.API_ROOT + 'queries/' + '?user_id=' + userid + '&query=' + encodeURIComponent(query) + '&return=False', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => res.json()).then(res => res.map(r => r.id - 1)).then(indices => {
            this.setState({ searchResults: this.formatEntryList(this.state.entryPreviews, indices) });
        });
    }

    entrySimilarityQuery(entryid) {
        fetch(config.API_ROOT + 'queries/?user_id=' + this.state.userid + '&qentry_id=' + entryid, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => res.json()).then(res => {
            this.setState({ simResults: res });
        });
    }

    loggedInTextChange(text) {
        return function() {
            this.setState({ title: text });
        };
    }

    loginKeyPress(e) {
        if (e.key === 'Enter') {
            this.userLoginAttempt();
        }
    }

    newUserKeyPress(e) {
        if (e.key === 'Enter') {
            this.createUserAttempt();
        }
    }

    searchKeyPress(e) {
        if (e.key === 'Enter') {
            this.entryQuery();
        }
    }

    saveButtonClick() {
        const userid = this.state.userid;
        const entryid = this.state.entryid;
        if (this.state.userid !== -1) {
            // TODO: this NEEDS some sort of sanitization to prevent HTML injections
            const rawHTML = this.wordProcessor.current.exportHTML();

            if (this.state.entryid === -1) {
                // create new entry
                fetch(config.API_ROOT + 'entries/', {
                    method: 'POST',
                    body: JSON.stringify({
                        user_id: this.state.userid,
                        title: 'placeholder',
                        raw_html: rawHTML,
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }).then(res => res.json()).then(res => {
                    this.setState({
                        entryid: res.entry_id,
                        lastSaved: new Date().toLocaleString(),
                    });
                });
            }
            else {
                // update existing entry
                fetch(config.API_ROOT + 'entries/?user_id=' + userid + '&entry_id=' + entryid, {
                    method: 'PUT',
                    body: JSON.stringify({
                        raw_html: rawHTML,
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }).then(res => {
                    this.setState({ lastSaved: new Date().toLocaleString() });
                });
            }
        }
        else if (this.state.loginClicked) {
            this.setState({ loginError: true });
        }
        else {
            this.loginButtonClick();
        }
    }

    searchButtonClick() {
        if (this.state.userid !== -1) {
            this.setState({ searchClicked: !this.state.searchClicked });

            this.searchInput.current.focus();
            this.searchInput.current.select();
        }
        else if (this.state.loginClicked) {
            this.setState({ loginError: true });
        }
        else {
            this.loginButtonClick();
        }
    }

    simButtonClick() {
        if (this.state.userid !== -1) {
            this.setState({ simClicked: !this.state.simClicked });
        }
        else if (this.state.loginClicked) {
            this.setState({ loginError: true });
        }
        else {
            this.loginButtonClick();
        }
    }

    newUserClick() {
        if (!this.state.loginClicked) {
            this.setState({ newUserClicked: !this.state.newUserClicked });

            this.newUsernameInput.current.focus();
            this.newUsernameInput.current.select();
        }
    }

    newEntryClick() {
        this.setState({ entryid: -1, lastSaved: '' });
        this.wordProcessor.current.clear();
    }

    addLoginConditions(styleArray, transitionCond, errorCond) {
        styleArray = styleArray.map(style => Object.assign({}, style, styles.transition(transitionCond)));
        return styleArray.map(style => Object.assign({}, style, { border: errorCond ? '1px solid red' : 'none' }));
    }

    addDisplay(style, cond) {
        return Object.assign({}, style, { display: cond ? '' : 'none' });
    }

    render() {
        const loginCond = this.state.loginClicked && this.state.loggedInUser.length === 0;
        const newUserCond = this.state.newUserClicked && this.state.loggedInUser.length === 0;

        const [ loginInputBox,
                loginInput,
                loginButton ] = this.addLoginConditions([styles.loginInputBox, styles.loginInput, styles.loginButton],
                                                        loginCond, this.state.loginError);

        const [ newUserInputBox,
                newUserInput,
                newUserButton ] = this.addLoginConditions([styles.loginInputBox, styles.loginInput, styles.loginButton],
                                                          newUserCond, this.state.newUserError);


        const searchResults = this.addDisplay(styles.searchResults, this.state.searchClicked);
        const simResults = this.addDisplay(styles.searchResults, this.state.simClicked);

        const typingTextValue = this.state.loggedInUser.length > 0 ? 'logged in as ' + this.state.loggedInUser : 'not logged in';

        const searchProps = {
            userid: this.state.userid,
            entryPreviews: this.state.entryPreviews,
            searchClicked: this.state.searchClicked,
        };

        return (
            <div>

                { /* SEARCH BOX */ }

                <Search { ...searchProps } />

                { /* END SEARCH BOX */ }

                { /* SIMILARITY BOX */ }

                <div style={ simResults }>
                    <div style={ styles.boxSimResults }>
                        { this.similarityEntryListFormat(this.state.entryPreviews) }
                    </div>
                    <div style={ styles.simResultsBox }>
                        { this.formatSimResultsList() }
                    </div>
                </div>

                { /* END SIMILARITY BOX*/ }

                { /* HEADER */ }

                <div style={ styles.caret }>></div>
                <TypingText text={ typingTextValue } style={ styles.typingText } />
                <TypingText text="last saved: " style={ styles.lastSaved } />
                <TypingText text={ this.state.lastSaved } compareAll={ true } style={ styles.time } />

                { /* END HEADER */ }

                <WordProcessor ref={ this.wordProcessor } />

                { /* NAVIGATION BOX */ }

                <div style={ styles.position }>
                    <div style={ styles.options }>
                        <span style={ styles.item } onClick={ this.newUserClick.bind(this) }>new user</span>
                        <span style={ styles.item } onClick={ this.loginButtonClick.bind(this) }>login</span>
                        <span style={ styles.item } onClick={ this.newEntryClick.bind(this) }>new entry</span>
                        <span style={ styles.item } onClick={ this.saveButtonClick.bind(this) }>save</span>
                        <span style={ styles.item } onClick={ this.searchButtonClick.bind(this) }>search</span>
                        <span style={ styles.item } onClick={ this.simButtonClick.bind(this) }>similarities</span>
                    </div>

                    { /* LOGIN FIELDS */ }

                    <div style={{ margin: '1em' }}>
                        <div tabIndex="-1" style={ loginInputBox }>
                            <input type="text" ref={ this.usernameInput } onKeyPress={ this.loginKeyPress.bind(this) } placeholder="username" style={ loginInput } />
                        </div>
                        <div tabIndex="-1" style={ loginInputBox }>
                            <input type="text" ref={ this.passwordInput } onKeyPress={ this.loginKeyPress.bind(this) } placeholder="password" style={ loginInput } />
                        </div>
                        <div style={ loginButton } onClick={ this.userLoginAttempt.bind(this) }>
                            <div style={{ padding: '0.25em 0.5em' }}>></div>
                        </div>
                    </div>

                    { /* END LOGIN FIELDS */ }

                    { /* NEW USER FIELDS */ }

                    <div style={{ margin: '2.5em 1em' }}>
                        <div tabIndex="-1" style={ newUserInputBox }>
                            <input type="text" ref={ this.newUsernameInput } onKeyPress={ this.newUserKeyPress.bind(this) } placeholder="new username" style={ newUserInput } />
                        </div>
                        <div tabIndex="-1" style={ newUserInputBox }>
                            <input type="text" ref={ this.newPasswordInput } onKeyPress={ this.newUserKeyPress.bind(this) } placeholder="new password" style={ newUserInput } />
                        </div>
                        <div style={ newUserButton } onClick={ this.createUserAttempt.bind(this) }>
                            <div style={{ padding: '0.25em 0.5em' }}>></div>
                        </div>
                    </div>

                    { /* END NEW USER FIELDS */ }

                </div>

                { /* END NAVIGATION BOX */ }

            </div>
        );
    }
}
