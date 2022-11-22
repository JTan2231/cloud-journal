import * as config from '../config.js';
import React from 'react';
import WordProcessor from '../components/word_processor.jsx';
import TypingText from '../components/typing_text.jsx';

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

    render() {
        const backgroundColor = 'rgba(136, 136, 136, 0.1)';
        const menuTextColor = 'rgb(191, 187, 187)';
        const borderColor = '1px solid rgba(188, 193, 189, 0.43)';

        const fontFamily = 'Courier New';

        const positionStyle = {
            zIndex: '1',
            position: 'fixed',
            top: '0',
            right: '0',
            margin: '1em',
        };

        const boxStyle = {
            color: menuTextColor,
            backgroundColor: backgroundColor,
            border: borderColor,
            borderRadius: '0.5em',
        };

        const optionsStyle = Object.assign({
            padding: '0.5em 1.5em',
            fontSize: '14px',
            fontFamily: fontFamily,
            textAlign: 'center',
            cursor: 'default',
        }, boxStyle);

        const itemStyle = {
            margin: '0.66em',
            userSelect: 'none',
        };

        const loginCond = this.state.loginClicked && this.state.loggedInUser.length === 0;
        const newUserCond = this.state.newUserClicked && this.state.loggedInUser.length === 0;

        const transitionStyle = c => ({
            transition: 'height 0.5s',
            height: c ? '1.75em' : '0',
            pointerEvents: c ? '' : 'none',
        });

        const loginInputBoxStyle = Object.assign({
            margin: '0.5em',
            overflowY: 'hidden',
        }, boxStyle, transitionStyle(loginCond), { border: this.state.loginError ? '1px solid red' : 'none' }); // this is jank; please find something better

        const loginInputStyle = Object.assign({
            padding: '0.25em 0.5em',
            color: menuTextColor,
            fontFamily: fontFamily,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
        }, transitionStyle(loginCond));

        const loginButtonStyle = Object.assign({}, boxStyle, transitionStyle(loginCond), {
            border: 'none',
            overflowY: 'hidden',
            fontSize: '12px',
            fontFamily: fontFamily,
            width: 'fit-content',
            margin: '0 0.5em 0.5em',
            float: 'right',
            cursor: 'default',
        });

        const newUserInputBoxStyle = Object.assign({}, loginInputBoxStyle, transitionStyle(newUserCond), { border: this.state.newUserError ? '1px solid red' : 'none' });
        const newUserInputStyle = Object.assign({}, loginInputStyle, transitionStyle(newUserCond));
        const newUserButtonStyle = Object.assign({}, loginButtonStyle, transitionStyle(newUserCond));

        const typingTextStyle = {
            position: 'absolute',
            top: '0',
            left: '0',
            margin: '1em',
            fontFamily: fontFamily,
            zIndex: 2,
        };

        const lastSavedStyle = {
            position: 'absolute',
            top: '0',
            left: 'calc(50% - 10em)',
            margin: '1em',
            fontFamily: fontFamily,
            zIndex: 2,
            color: 'grey',
        };

        const timeStyle = {
            position: 'absolute',
            top: '0',
            left: 'calc(50% - 3em)',
            margin: '1em',
            fontFamily: fontFamily,
            zIndex: 2,
            color: 'green',
        };

        const caretStyle = {
            position: 'absolute',
            top: '0',
            left: '0',
            color: 'grey',
            fontFamily: fontFamily,
            zIndex: 2,
            margin: '4.3em 1.5em',
        };

        const searchResults = {
            position: 'absolute',
            width: '60%',
            height: '60%',
            zIndex: 3,
            backgroundColor: '#51515130',
            top: 'calc(50vh - 30%)',
            left: 'calc(50vw - 30%)',
            borderRadius: '0.5em',
            display: this.state.searchClicked ? '' : 'none',
        };

        const boxSearchStyle = Object.assign({}, boxStyle, {
            margin: '1em',
            transition: '',
            height: '',
            float: '',
            pointerEvents: '',
            position: 'absolute',
            zIndex: 4,
            overflowX: 'hidden',
            width: 'calc(100% - 2em)',
            height: '2em',
            border: 'none',
        });

        const boxInputStyle = Object.assign({}, loginInputStyle, {
            width: '100%',
            height: '',
            pointerEvents: '',
            border: 'none',
        });

        const resultsBoxStyle = Object.assign({}, boxSearchStyle, {
            height: 'calc(100% - 5em)',
            marginTop: '4em',
            overflow: 'scroll',
        });

        const simResults = Object.assign({}, searchResults, { display: this.state.simClicked ? '' : 'none' });
        const boxSimResults = Object.assign({}, boxSearchStyle, {
            height: 'calc(100% - 2em)',
            width: '25%',
        });

        const simResultsBox = Object.assign({}, resultsBoxStyle, {
            margin: '1em',
            marginTop: '1em',
            left: 'calc(25% + 1em)',
            width: 'calc(75% - 3em)',
            height: 'calc(100% - 2em)',
        });

        const typingTextValue = this.state.loggedInUser.length > 0 ? 'logged in as ' + this.state.loggedInUser : 'not logged in';

        return (
            <div>

                { /* SEARCH BOX */ }

                <div style={ searchResults }>
                    <div style={ boxSearchStyle }>
                        <input type="text" ref={ this.searchInput } onKeyPress={ this.searchKeyPress.bind(this) } placeholder="search" style={ boxInputStyle } />
                    </div>
                    <div style={ resultsBoxStyle }>
                        { this.state.searchResults }
                    </div>
                </div>

                { /* END SEARCH BOX */ }

                { /* SIMILARITY BOX */ }

                <div style={ simResults }>
                    <div style={ boxSimResults }>
                        { this.similarityEntryListFormat(this.state.entryPreviews) }
                    </div>
                    <div style={ simResultsBox }>
                        { this.formatSimResultsList() }
                    </div>
                </div>

                { /* END SIMILARITY BOX*/ }

                { /* HEADER */ }

                <div style={ caretStyle }>></div>
                <TypingText text={ typingTextValue } style={ typingTextStyle } />
                <TypingText text="last saved: " style={ lastSavedStyle } />
                <TypingText text={ this.state.lastSaved } compareAll={ true } style={ timeStyle } />

                { /* END HEADER */ }

                <WordProcessor ref={ this.wordProcessor } />

                { /* NAVIGATION BOX */ }

                <div style={ positionStyle }>
                    <div style={ optionsStyle }>
                        <span style={ itemStyle } onClick={ this.newUserClick.bind(this) }>new user</span>
                        <span style={ itemStyle } onClick={ this.loginButtonClick.bind(this) }>login</span>
                        <span style={ itemStyle } onClick={ this.newEntryClick.bind(this) }>new entry</span>
                        <span style={ itemStyle } onClick={ this.saveButtonClick.bind(this) }>save</span>
                        <span style={ itemStyle } onClick={this.searchButtonClick.bind(this) }>search</span>
                        <span style={ itemStyle } onClick={this.simButtonClick.bind(this) }>similarities</span>
                    </div>

                    { /* LOGIN FIELDS */ }

                    <div style={{ margin: '1em' }}>
                        <div tabIndex="-1" style={ loginInputBoxStyle }>
                            <input type="text" ref={ this.usernameInput } onKeyPress={ this.loginKeyPress.bind(this) } placeholder="username" style={ loginInputStyle } />
                        </div>
                        <div tabIndex="-1" style={ loginInputBoxStyle }>
                            <input type="text" ref={ this.passwordInput } onKeyPress={ this.loginKeyPress.bind(this) } placeholder="password" style={ loginInputStyle } />
                        </div>
                        <div style={ loginButtonStyle } onClick={ this.userLoginAttempt.bind(this) }>
                            <div style={{ padding: '0.25em 0.5em' }}>></div>
                        </div>
                    </div>

                    { /* END LOGIN FIELDS */ }

                    { /* NEW USER FIELDS */ }

                    <div style={{ margin: '2.5em 1em' }}>
                        <div tabIndex="-1" style={ newUserInputBoxStyle }>
                            <input type="text" ref={ this.newUsernameInput } onKeyPress={ this.newUserKeyPress.bind(this) } placeholder="new username" style={ newUserInputStyle } />
                        </div>
                        <div tabIndex="-1" style={ newUserInputBoxStyle }>
                            <input type="text" ref={ this.newPasswordInput } onKeyPress={ this.newUserKeyPress.bind(this) } placeholder="new password" style={ newUserInputStyle } />
                        </div>
                        <div style={ newUserButtonStyle } onClick={ this.createUserAttempt.bind(this) }>
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
