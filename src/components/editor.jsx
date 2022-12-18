import * as config from '../util/config.js';
import * as styles from '../util/styles.js';
import React from 'react';
import WordProcessor from './word_processor.jsx';
import TypingText from './typing_text.jsx';

import Library from './library.jsx';
import Similarities from './similarities.jsx';
import Explore from './explore.jsx';

import '../styles/menu_item.css';
import '../styles/library_item.css';

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
            exploreClicked: false,
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
            libraryClicked: false,
            libraryResults: [],
            entryPreviews: [],
            latestEntryPreviews: [],
            simResults: [],
            entryIdMap: new Map(),
            mounted: false,
        };

        this.setWordProcessorFromLibrary = (entryid) => {
            this.getEntryItemClick(this.state.userid, entryid);
        };

        this.wordProcessor = React.createRef();

        this.editorPrompt = React.createRef();

        this.usernameInput = React.createRef();
        this.passwordInput = React.createRef();

        this.newUsernameInput = React.createRef();
        this.newPasswordInput = React.createRef();

        this.libraryInput = React.createRef();
        this.libraryBox = React.createRef();

        this.simBox = React.createRef();

        this.explore = React.createRef();

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

        if (this.libraryInput.current) {
            this.libraryInput.current.value = '';
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

                this.getUserEntries(res.user_id);
                this.getLatestEntries(res.user_id);
                this.clearInputs();
            }
            else if (res.errors) {
                this.setState({ loginError: true });
            }
        });
    }

    userLogout() {
        this.clearInputs();
        this.clearImportChannelFields();
        this.wordProcessor.current.clear();
        this.setState({
            loggedInUser: '',
            userid: -1,
            loginError: false,
            libraryClicked: false,
            simClicked: false,
            channelClicked: false,
            simResults: [],
            libraryResults: [],
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

    getUserEntries(userid) {
        fetch(config.API_ROOT + 'entries/?user_id=' + userid, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(res => res.json()).then(res => {
            let entries = res.map(kp => ({ entryid: kp.id, preview: kp.text_preview }));

            this.setState({ entryPreviews: entries });
        });
    }

    getLatestEntries(userid) {
        fetch(`${config.API_ROOT}explore/?user_id=${userid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(res => res.json()).then(res => {
            let entries = res.map(kp => ({ entryid: kp.id, preview: kp.text_preview }));

            this.setState({ latestEntryPreviews: entries });
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
                    this.getUserEntries(this.state.userid);
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
                    this.getUserEntries(this.state.userid);
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

    toggleLibraryState() {
        if (this.state.libraryClicked) {
            this.libraryBox.current.reset();
        }

        return {
            libraryClicked: !this.state.libraryClicked,
            libraryResults: this.state.libraryClicked ? [] : this.state.libraryResults,
        };
    }

    toggleExploreState() {
        if (this.state.exploreClicked) {
            this.explore.current.reset();
        }

        return { exploreClicked: !this.state.exploreClicked, };
    }

    toggleSimState() {
        if (this.state.simClicked) {
            this.simBox.current.reset();
        }

        return {
            simClicked: !this.state.simClicked,
            simResults: this.state.simClicked ? [] : this.state.simResults
        };
    }

    closeOtherWindows(newState, currentWindow) {
        if (currentWindow !== 'similarities' && this.state.simClicked) {
            newState = Object.assign(newState, this.toggleSimState());
        }

        if (currentWindow !== 'library' && this.state.libraryClicked) {
            newState = Object.assign(newState, this.toggleLibraryState());
        }

        if (currentWindow !== 'explore' && this.state.exploreClicked) {
            newState = Object.assign(newState, this.toggleExploreState());
        }

        return newState;
    }

    libraryButtonClick() {
        let newState = this.toggleLibraryState();
        newState = this.closeOtherWindows(newState, 'library');

        if (!this.state.libraryClicked) {
            this.libraryBox.current.setPreviews();
        }

        if (this.state.channelClicked) {
            newState.channelClicked = false;
        }

        this.setState(newState);
    }

    exploreButtonClick() {
        let newState = this.toggleExploreState();
        newState = this.closeOtherWindows(newState, 'explore');

        if (!this.state.exploreClicked) {
            this.explore.current.setPreviews();
        }

        if (this.state.channelClicked) {
            newState.channelClicked = false;
        }

        this.setState(newState);
    }

    simButtonClick() {
        let newState = this.toggleSimState();
        newState = this.closeOtherWindows(newState, 'similarities');

        if (!this.state.simClicked) {
            this.getUserEntries(this.state.userid)
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

        if (this.state.libraryClicked) {
            newState = Object.assign(this.toggleLibraryState(), newState);
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

        const libraryProps = {
            userid: this.state.userid,
            entryPreviews: this.state.entryPreviews,
            libraryClicked: this.state.libraryClicked,
            libraryClick: this.setWordProcessorFromLibrary,
        };

        const similarityProps = {
            userid: this.state.userid,
            clicked: this.state.simClicked,
            entryPreviews: this.state.entryPreviews,
            setWordProcessor: this.setWordProcessorFromLibrary,
        };

        const exploreProps = {
            exploreClicked: this.state.exploreClicked,
            entryPreviews: this.state.latestEntryPreviews,
        };

        if (!libraryProps.libraryClicked && this.libraryBox.current) {
            this.libraryBox.current.clearResults();
        }

        const newUserStyle = Object.assign({}, styles.item, { display: this.state.loggedInUser.length > 0 ? 'none' : '' });

        const loggedInStyles = Object.assign({}, styles.item, { display: this.state.loggedInUser.length > 0 ? '' : 'none' });
 
        const loginGroupStyle = {
            margin: '1em auto',
            marginRight: '-1em',
            position: 'absolute',
            right: '0',
            zIndex: this.state.loginClicked ? 100 : -100,
        };

        const newUserGroupStyle = Object.assign({}, loginGroupStyle, { zIndex: this.state.newUserClicked ? 100 : -100, right: '', });
        const channelGroupStyle = Object.assign({}, loginGroupStyle, { zIndex: this.state.channelClicked ? 100 : -100, right: '', });
        const exportGroupStyle = Object.assign({}, loginGroupStyle, { zIndex: this.state.exportClicked ? 100 : -100, right: '', });

        const importStatusStyle = Object.assign({}, styles.textStyle, {
            color: this.state.importStatus === 'success' ? 'green' : 'red',
        });

        return (
            <div>
                { /* HEADER */ }

                <TypingText text={ typingTextValue } red={ this.state.userid === -1 } compareAll={ true } style={ styles.typingText } />
                <TypingText text="last saved: " style={ styles.lastSaved } />
                <TypingText text={ this.state.lastSaved } red={ this.state.lastSaved === 'unsaved' } compareAll={ true } style={ styles.time } />

                { /* END HEADER */ }

                <div style={{ display: 'flex' }}>
                    <WordProcessor ref={ this.wordProcessor }/>

                    { /* TODO: Please God make this a separate component */ }
                    { /* NAVIGATION BOX */ }

                    <div style={ styles.position }>
                        <div style={ styles.options }>
                            <span class="menuItem" style={ newUserStyle } onClick={ this.newUserClick.bind(this) }>new user</span>
                            <span class="menuItem" style={ styles.item } onClick={ this.loginButtonClick.bind(this) }>
                                { this.state.loggedInUser.length > 0 ? 'logout' : 'login' }
                            </span>
                            <span class="menuItem" style={ loggedInStyles } onClick={ this.newEntryClick.bind(this) }>new entry</span>
                            <span class="menuItem" style={ loggedInStyles } onClick={ this.saveButtonClick.bind(this) }>save</span>
                            <span class="menuItem" style={ loggedInStyles } onClick={ this.libraryButtonClick.bind(this) }>library</span>
                            <span class="menuItem" style={ loggedInStyles } onClick={ this.exploreButtonClick.bind(this) }>explore</span>
                            <span class="menuItem" style={ loggedInStyles } onClick={ this.simButtonClick.bind(this) }>similarities</span>
                            <span class="menuItem" style={ loggedInStyles } onClick={ this.importChannelClick.bind(this) }>import</span>
                            <span class="menuItem" style={ loggedInStyles } onClick={ this.exportButtonClick.bind(this) }>export</span>
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


                        <Library ref={ this.libraryBox } { ...libraryProps } />
                        <Similarities ref={ this.simBox } { ...similarityProps } />
                        <Explore ref={ this.explore } { ...exploreProps } />

                    </div>

                    { /* END NAVIGATION BOX */ }
                </div>

            </div>
        );
    }
}
