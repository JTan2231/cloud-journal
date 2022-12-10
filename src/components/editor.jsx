import * as config from '../util/config.js';
import * as styles from '../util/styles.js';
import React from 'react';
import WordProcessor from './word_processor.jsx';
import TypingText from './typing_text.jsx';

import Search from './search.jsx';
import Similarities from './similarities.jsx';

import '../styles/menu_item.css';
import '../styles/search_item.css';

export default class Editor extends React.Component {
    constructor(props) {
        super(props);

        // TODO
        // clean this up
        // this is disgusting
        this.state = {
            loginClicked: false,
            newUserClicked: false,
            simClicked: false,
            channelClicked: false,
            exportClicked: false,
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

        this.setWordProcessorFromSearch = (entryid) => {
            this.getEntryItemClick(this.state.userid, entryid);
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

    getEntryItemClick(userid, entryid) {
        fetch(`${config.API_ROOT}entries/?user_id=${userid}&id=${entryid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(res => res.json()).then(res => {
            this.wordProcessor.current.clear();
            this.wordProcessor.current.loadHTML(res);
            this.wordProcessor.current.editorKeyPress();

            this.setState({ entryid: entryid });
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

    entryQuery() {
        const userid = this.state.userid;
        const query = this.searchInput.current.value;
        fetch(`${config.API_ROOT}queries/?user_id=${userid}&query=${encodeURIComponent(query)}&return=False`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => res.json()).then(res => res.map(r => r.id - 1)).then(indices => {
            this.setState({ searchResults: this.formatEntryList(this.state.entryPreviews, indices) });
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
                    // TODO: Make this happen with the initial request
                    this.getEntries(this.state.userid);
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
                    // TODO: Make this happen with the initial request
                    this.getEntries(this.state.userid);
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

        if (!this.state.searchClicked) {
            this.searchBox.current.setPreviews();
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

    clearImportChannelFields() {
        this.importStatus.current.textContent = '';
        this.arenaChannelInput.current.value = '';
    }

    importChannelClick() {
        let newState = {
            channelClicked: !this.state.channelClicked,
        };

        if (this.state.channelClicked) {
            this.clearImportChannelFields();
        }

        if (this.state.exportClicked) {
            newState.exportClicked = false;
        }

        this.setState(newState);
    }

    exportButtonClick() {
        let newState = {
            exportClicked: !this.state.exportClicked,
        };

        if (this.state.channelClicked) {
            newState.channelClicked = false;
            this.clearImportChannelFields();
        }

        this.setState(newState);
    }

    exportEntriesTypeWrapper(type) {
        return function() { this.exportEntries(type) };
    }

    exportEntries(type) {
        console.log(type);
        fetch(config.API_ROOT + 'exports/?user_id=' + this.state.userid + '&type=' + type, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/zip',
            }
        }).then(res => res.blob()).then(blob => {
            let file = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = file;

            let date = new Date();
            anchor.download = this.state.loggedInUser + '_' + date.toLocaleDateString() + '.zip';// + date.getMonth() + date.getDay() + date.getFullYear() + '.zip';

            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
        });
    }

    createLoginFieldStyles(transitionCond, errorCond) {
        let styleArray = [styles.loginInputBox, styles.loginInput, styles.loginButton];
        let newStyleArray = styleArray.map(style => Object.assign({}, style, styles.transition(transitionCond)));

        newStyleArray = newStyleArray.map(style => Object.assign({}, style, { border: 'none' }));
        // this is probably unmaintainable
        newStyleArray[0] = Object.assign({}, newStyleArray[0], { border: errorCond ? '1px solid red' : 'none' });

        return newStyleArray;
    }

    // TODO: This function is disgusting looking. Needs to be cleaned.
    //       Some of these can probably be offloaded into other components.
    render() {
        const loginCond = this.state.loginClicked && this.state.loggedInUser.length === 0;
        const newUserCond = this.state.newUserClicked && this.state.loggedInUser.length === 0;
        const channelCond = this.state.channelClicked && this.state.loggedInUser.length > 0;
        const exportCond = this.state.exportClicked && this.state.loggedInUser.length > 0;

        const [ loginInputBox,
                loginInput,
                loginButton ] = this.createLoginFieldStyles(loginCond, this.state.loginError);

        const [ newUserInputBox,
                newUserInput,
                newUserButton ] = this.createLoginFieldStyles(newUserCond, this.state.newUserError);

        const [ channelInputBox,
                channelInput, , ] = this.createLoginFieldStyles(channelCond, this.state.channelError);

        const [ , , exportButton ] = this.createLoginFieldStyles(exportCond, false);

        const typingTextValue = this.state.loggedInUser.length > 0 ? 'logged in as ' + this.state.loggedInUser : 'not logged in';

        const searchProps = {
            userid: this.state.userid,
            entryPreviews: this.state.entryPreviews,
            searchClicked: this.state.searchClicked,
            searchClick: this.setWordProcessorFromSearch,
        };

        const similarityProps = {
            userid: this.state.userid,
            clicked: this.state.simClicked,
            entryPreviews: this.state.entryPreviews,
            setWordProcessor: this.setWordProcessorFromSearch,
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
        const exportGroupStyle = Object.assign({}, loginGroupStyle, { zIndex: this.state.exportClicked ? 100 : -100 });

        const importStatusStyle = Object.assign({}, styles.textStyle, {
            color: this.state.importStatus === 'success' ? 'green' : 'red',
        });

        return (
            <div>

                { /* SEARCH BOX */ }

                <Search ref={ this.searchBox } { ...searchProps } />

                { /* END SEARCH BOX */ }

                { /* SIMILARITY BOX */ }

                <Similarities ref={ this.similarities } { ...similarityProps } />

                { /* END SIMILARITY BOX*/ }

                { /* HEADER */ }

                <TypingText text={ typingTextValue } red={ this.state.userid === -1 } compareAll={ true } style={ styles.typingText } />
                <TypingText text="last saved: " style={ styles.lastSaved } />
                <TypingText text={ this.state.lastSaved } red={ this.state.lastSaved === 'unsaved' } compareAll={ true } style={ styles.time } />

                { /* END HEADER */ }

                <WordProcessor ref={ this.wordProcessor }/>

                { /* NAVIGATION BOX */ }

                <div style={ styles.position }>
                    <div style={ styles.options }>
                        <div>
                            <span class="menuItem" style={ newUserStyle } onClick={ this.newUserClick.bind(this) }>new user</span>
                            <span class="menuItem" style={ styles.item } onClick={ this.loginButtonClick.bind(this) }>
                                { this.state.loggedInUser.length > 0 ? 'logout' : 'login' }
                            </span>
                            <span class="menuItem" style={ loggedInStyles } onClick={ this.newEntryClick.bind(this) }>new entry</span>
                            <span class="menuItem" style={ loggedInStyles } onClick={ this.saveButtonClick.bind(this) }>save</span>
                            <span class="menuItem" style={ loggedInStyles } onClick={ this.searchButtonClick.bind(this) }>search</span>
                            <span class="menuItem" style={ loggedInStyles } onClick={ this.simButtonClick.bind(this) }>similarities</span>
                        </div>
                        <div style={{ marginTop: this.state.userid === -1 ? '' : '0.5em' }}>
                            <span class="menuItem" style={ loggedInStyles } onClick={ this.importChannelClick.bind(this) }>import</span>
                            <span class="menuItem" style={ loggedInStyles } onClick={ this.exportButtonClick.bind(this) }>export</span>
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

                    { /* EXPORT FIELDS */ }

                    <div style={ exportGroupStyle }>
                        <span>
                            <div style={ Object.assign({}, exportButton, { height: '', padding: '0.5em' }) }
                                 onClick={ (this.exportEntriesTypeWrapper('raw')).bind(this) }>
                                raw
                            </div>
                            <div style={ Object.assign({}, exportButton, { height: '', padding: '0.5em' }) }
                                 onClick={ (this.exportEntriesTypeWrapper('text')).bind(this) }>
                                text
                            </div>
                        </span>
                    </div>

                    { /* END EXPORT FIELDS */ }

                </div>

                { /* END NAVIGATION BOX */ }

            </div>
        );
    }
}
