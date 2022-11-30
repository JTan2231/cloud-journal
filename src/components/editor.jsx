import * as config from '../util/config.js';
import * as styles from '../util/styles.js';
import React from 'react';
import WordProcessor from './word_processor.jsx';
import TypingText from './typing_text.jsx';

import Search from './search.jsx';

import '../styles/scroll.css';

export default class Editor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loginClicked: false,
            newUserClicked: false,
            simClicked: false,
            channelClicked: false,
            importStatus: '',
            loggedInUser: '',
            userid: -1,
            entryid: -1,
            loginError: false,
            newUserError: false,
            channelError: false,
            lastSaved: 'unsaved',
            searchClicked: false,
            searchResults: [],
            entryPreviews: [],
            simResults: [],
            entryIdMap: new Map(),
            mounted: false,
        };

        this.wordProcessor = React.createRef();

        this.editorPrompt = React.createRef();

        this.usernameInput = React.createRef();
        this.passwordInput = React.createRef();

        this.newUsernameInput = React.createRef();
        this.newPasswordInput = React.createRef();

        this.searchInput = React.createRef();
        this.searchBox = React.createRef();

        this.arenaChannelInput = React.createRef();
        this.importStatus = React.createRef();
    }

    componentDidMount() {
        this.wordProcessor.current.clear();
    }

    clearInputs() {
        this.usernameInput.current.value = '';
        this.passwordInput.current.value = '';
        this.newUsernameInput.current.value = '';
        this.newPasswordInput.current.value = '';

        if (this.searchInput.current) {
            this.searchInput.current.value = '';
        }
    }

    userLoginAttempt() {
        /* TODO
         *
         * make whatever REST request needed to login
         * update an unmade div somewhere on the page saying you're logged in as {user}
         * close the login fields
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
                    loginError: false,
                    loginClicked: false,
                });

                this.getEntries(res.user_id);
                this.clearInputs();
            }
            else if (res.errors) {
                this.setState({ loginError: true });
            }
        });
    }

    userLogout() {
        this.clearInputs();
        this.wordProcessor.current.clear();
        this.setState({
            loggedInUser: '',
            userid: -1,
            loginError: false,
            searchClicked: false,
            simClicked: false,
            simResults: [],
            searchResults: [],
            lastSaved: 'unsaved',
        });
    }

    getEntries(userid) {
        fetch(config.API_ROOT + 'entries/?user_id=' + userid, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(res => res.json()).then(res => {
            let entries = res.map(kp => ({ entryid: kp.id, preview: kp.text_preview }));

            let newIdMap = new Map();
            for (let i = 0; i < entries.length; i++) {
                const e = entries[i];
                newIdMap.set(e.entryid, i+1);
            }

            this.setState({ entryPreviews: entries, entryIdMap: newIdMap });
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
            else {
                this.setState({
                    loggedInUser: res.username,
                    userid: res.user_id,
                    loginError: false,
                    newUserError: false,
                    newUserClicked: false,
                });

                this.clearInputs();
            }
        });
    }

    formatEntryList(entries, indices) {
        let processed = [];

        if (indices === null || indices === undefined) {
            indices = [...Array(entries.length).keys()];
        }

        for (let i = 0; i < indices.length; i++) {
            processed.push(
                <div style={ styles.textStyle }>
                    <span>{ indices[i]+1 }. { entries[indices[i]].preview }</span>
                </div>
            );
        }

        return processed;
    }

    formatSimResultsList() {
        const boldStyle = {
            fontSize: '1.25em',
            fontWeight: '',
            color: 'white'
        };

        const entryStyle = Object.assign({}, styles.textStyle, {
            borderRadius: '0.5em',
            backgroundColor: 'rgba(136, 136, 136, 0.15)',
            padding: '0.5em',
            margin: '0 0 1em 0',
        });

        let processed = [];

        for (let i = 0; i < this.state.simResults.length; i++) {
            let res = this.state.simResults[i];
            let words = res.text_preview.split(' ');
            let boldWords = words.slice(0, config.BOLD_LENGTH).join(' ');
            words = words.slice(config.BOLD_LENGTH, words.length).join(' ');

            processed.push(
                <div style={ entryStyle }>
                    <span style={ boldStyle }>{ boldWords }</span> { words }
                </div>
            );
        }

        if (processed.length === 0) {
            processed = (<div style={ styles.textStyle }>{ `Click an entry on the left to see the rest of your entries ranked in order of relevance.` }</div>);
        }

        return processed;
    }

    similarityEntryListFormat(entries) {
        const boldStyle = {
            fontSize: '1.25em',
            fontWeight: '',
            color: 'white'
        };

        const entryStyle = Object.assign({}, styles.textStyle, {
            borderRadius: '0.5em',
            backgroundColor: 'rgba(136, 136, 136, 0.1)',
            padding: '0.5em',
            margin: '0 0 1em 0',
        });

        let processed = [];
        for (let i = 0; i < entries.length; i++) {
            const kp = entries[i];

            let words = kp.preview.split(' ');
            let boldWords = words.slice(0, config.BOLD_LENGTH).join(' ');
            words = words.slice(config.BOLD_LENGTH, words.length).join(' ');

            processed.push(
                <div style={ entryStyle } onClick={ (() => this.entrySimilarityQuery(kp.entryid)).bind(this) }>
                    <span style={ boldStyle }>{ boldWords }</span> { words }
                </div>
            );
        }

        if (processed.length === 0) {
            processed = (<div style={ styles.textStyle }>{ `There's nothing here...` }</div>);
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

    arenaChannelImport() {
        let channel = this.arenaChannelInput.current.value.split('/');
        channel = channel[channel.length-1];

        fetch(config.API_ROOT + 'imports/', {
            method: 'POST',
            body: JSON.stringify({
                user_id: this.state.userid,
                channel: channel,
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => res.json()).then(res => {
            if (res.errors) {
                this.setState({ importStatus: 'error' });
                this.importStatus.current.textContent = res.errors;
            }
            else {
                this.setState({ importStatus: 'success' });
                this.importStatus.current.textContent = res;
            }
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

    arenaChannelKeyPress(e) {
        if (e.key === 'Enter') {
            this.arenaChannelImport();
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

    toggleSearchState() {
        return {
            searchClicked: !this.state.searchClicked,
            searchResults: this.state.searchClicked ? [] : this.state.searchResults,
        };
    }

    searchButtonClick() {
        let newState = this.toggleSearchState();
        if (this.state.simClicked) {
            newState = Object.assign(newState, this.toggleSimState());
        }

        this.setState(newState);

        this.searchInput.current.focus();
        this.searchInput.current.select();
    }

    toggleSimState() {
        return {
            simClicked: !this.state.simClicked,
            simResults: this.state.simClicked ? [] : this.state.simResults
        };
    }

    simButtonClick() {
        let newState = this.toggleSimState();
        if (!this.state.simClicked) {
            this.getEntries(this.state.userid)
        }

        if (this.state.searchClicked) {
            newState = Object.assign(newState, this.toggleSearchState());
        }

        this.setState(newState);
    }

    loginButtonClick() {
        if (this.state.loggedInUser.length > 0) {
            this.userLogout();
        }
        else {
            let newState = {
                loginClicked: !this.state.loginClicked,
                loginError: false,
            };

            if (this.state.newUserClicked) {
                newState = Object.assign(newState, { newUserClicked: !this.state.newUserClicked, newUserError: false });
            }

            this.setState(newState);

            this.usernameInput.current.focus();
            this.usernameInput.current.select();
        }
    }

    newUserClick() {
        let newState = {
            newUserClicked: !this.state.newUserClicked,
            newUserError: false,
        };

        // close/cleanup the login fields
        if (this.state.loginClicked) {
            Object.assign(newState, { loginClicked: !this.state.loginClicked, loginError: false });
        }

        this.setState(newState);

        this.newUsernameInput.current.focus();
        this.newUsernameInput.current.select();
    }

    newEntryClick() {
        this.setState({ entryid: -1, lastSaved: 'unsaved' });
        this.wordProcessor.current.clear();
    }

    importChannelClick() {
        if (this.state.channelClicked) {
            this.importStatus.current.textContent = '';
            this.arenaChannelInput.current.value = '';
        }

        this.setState({ channelClicked: !this.state.channelClicked });
    }

    addLoginConditions(styleArray, transitionCond, errorCond) {
        let newStyleArray = styleArray.map(style => Object.assign({}, style, styles.transition(transitionCond)));

        newStyleArray = newStyleArray.map(style => Object.assign({}, style, { border: 'none' }));
        // this is probably unmaintainable
        newStyleArray[0] = Object.assign({}, newStyleArray[0], { border: errorCond ? '1px solid red' : 'none' });

        return newStyleArray;
    }

    addDisplay(style, cond) {
        return Object.assign({}, style, { display: cond ? '' : 'none' });
    }

    // TODO: This function is disgusting looking. Needs to be cleaned.
    //       Some of these can probably be offloaded into other components.
    render() {
        const loginCond = this.state.loginClicked && this.state.loggedInUser.length === 0;
        const newUserCond = this.state.newUserClicked && this.state.loggedInUser.length === 0;
        const channelCond = this.state.channelClicked && this.state.loggedInUser.length > 0;

        const [ loginInputBox,
                loginInput,
                loginButton ] = this.addLoginConditions([styles.loginInputBox, styles.loginInput, styles.loginButton],
                                                        loginCond, this.state.loginError);

        const [ newUserInputBox,
                newUserInput,
                newUserButton ] = this.addLoginConditions([styles.loginInputBox, styles.loginInput, styles.loginButton],
                                                          newUserCond, this.state.newUserError);

        const [ channelInputBox,
                channelInput,
                channelButton ] = this.addLoginConditions([styles.loginInputBox, styles.loginInput, styles.loginButton],
                                                          channelCond, this.state.channelError);

        const searchResults = this.addDisplay(styles.searchResults, this.state.searchClicked);
        const simResults = this.addDisplay(styles.searchResults, this.state.simClicked);

        const typingTextValue = this.state.loggedInUser.length > 0 ? 'logged in as ' + this.state.loggedInUser : 'not logged in';

        const searchProps = {
            userid: this.state.userid,
            entryPreviews: this.state.entryPreviews,
            searchClicked: this.state.searchClicked,
        };

        if (!searchProps.searchClicked && this.searchBox.current) {
            this.searchBox.current.clearResults();
        }

        const newUserStyle = Object.assign({}, styles.item, { display: this.state.loggedInUser.length > 0 ? 'none' : '' });

        const loggedInStyles = Object.assign({}, styles.item, { display: this.state.loggedInUser.length > 0 ? '' : 'none' });
 
        const loginGroupStyle = {
            margin: '1em auto',
            position: 'absolute',
            zIndex: this.state.loginClicked ? 100 : -100,
        };

        const newUserGroupStyle = Object.assign({}, loginGroupStyle, { zIndex: this.state.newUserClicked ? 100 : -100 });
        const channelGroupStyle = Object.assign({}, loginGroupStyle, { zIndex: this.state.channelClicked ? 100 : -100 });

        const importStatusStyle = Object.assign({}, styles.textStyle, {
            color: this.state.importStatus === 'success' ? 'green' : 'red',
        });

        return (
            <div>

                { /* SEARCH BOX */ }

                <Search ref={ this.searchBox } { ...searchProps } />

                { /* END SEARCH BOX */ }

                { /* SIMILARITY BOX */ }

                <div style={ simResults }>
                    <div className="scrollBar" style={ styles.boxSimResults }>
                        { this.similarityEntryListFormat(this.state.entryPreviews) }
                    </div>
                    <div style={ styles.simResultsBox }>
                        { this.formatSimResultsList() }
                    </div>
                </div>

                { /* END SIMILARITY BOX*/ }

                { /* HEADER */ }

                <TypingText text={ typingTextValue } red={ this.state.userid === -1 } compareAll={ true } style={ styles.typingText } />
                <TypingText text="last saved: " style={ styles.lastSaved } />
                <TypingText text={ this.state.lastSaved } red={ this.state.lastSaved === 'unsaved' } compareAll={ true } style={ styles.time } />

                { /* END HEADER */ }

                <WordProcessor ref={ this.wordProcessor } />

                { /* NAVIGATION BOX */ }

                <div style={ styles.position }>
                    <div style={ styles.options }>
                        <div>
                            <span style={ newUserStyle } onClick={ this.newUserClick.bind(this) }>new user</span>
                            <span style={ styles.item } onClick={ this.loginButtonClick.bind(this) }>
                                { this.state.loggedInUser.length > 0 ? 'logout' : 'login' }
                            </span>
                            <span style={ loggedInStyles } onClick={ this.newEntryClick.bind(this) }>new entry</span>
                            <span style={ loggedInStyles } onClick={ this.saveButtonClick.bind(this) }>save</span>
                            <span style={ loggedInStyles } onClick={ this.searchButtonClick.bind(this) }>search</span>
                            <span style={ loggedInStyles } onClick={ this.simButtonClick.bind(this) }>similarities</span>
                        </div>
                        <div style={{ marginTop: this.state.userid === -1 ? '' : '0.5em' }}>
                            <span style={ loggedInStyles } onClick={ this.importChannelClick.bind(this) }>import</span>
                        </div>
                    </div>

                    { /* TODO: Make these into components */ }

                    { /* LOGIN FIELDS */ }

                    <div style={ loginGroupStyle }>
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

                    <div style={ newUserGroupStyle }>
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

                    { /* IMPORT FIELDS */ }

                    <div style={ channelGroupStyle }>
                        <span><div tabIndex="-1" style={ channelInputBox }>
                            <input type="text" ref={ this.arenaChannelInput } onKeyPress={ this.arenaChannelKeyPress.bind(this) } placeholder="are.na channel url" style={ channelInput } />
                        </div></span>
                        <span ref={ this.importStatus } style={ importStatusStyle } />
                    </div>

                    { /* END IMPORT FIELDS */ }

                </div>

                { /* END NAVIGATION BOX */ }

            </div>
        );
    }
}
