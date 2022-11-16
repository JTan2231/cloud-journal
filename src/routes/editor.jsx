import * as config from '../config.js';
import React from 'react';
import WordProcessor from '../components/word_processor.jsx';
import TypingText from '../components/typing_text.jsx';

export default class Editor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loginClicked: false,
            loggedInUser: '',
            userid: -1,
            entryid: -1,
            loginError: false,
            newUserError: false,
            lastSaved: '',
            searchClicked: false,
            searchResults: [],
        };

        this.wordProcessor = React.createRef();

        this.usernameInput = React.createRef();
        this.passwordInput = React.createRef();

        this.newUsernameInput = React.createRef();
        this.newPasswordInput = React.createRef();

        this.searchInput = React.createRef();
    }

    loginButtonClick() {
        this.setState({ loginClicked: !this.state.loginClicked, loginError: false });

        this.usernameInput.current.focus();
        this.usernameInput.current.select();
    }

    createUserButtonClick() {
        this.setState({ newUserClicked: !this.state.newUserClicked, newUserError: false });

        this.newUsernameInput.current.focus();
        this.newUsernameInput.current.select();
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
            }
            else if (res.errors) {
                this.setState({ loginError: true });
            }
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

    entryQuery() {
        const userid = this.state.userid;
        const query = this.searchInput.current.value;
        fetch(config.API_ROOT + 'entries/' + '?user_id=' + userid + '&query=' + encodeURIComponent(query), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => res.json()).then(res => {
            var processed = [];

            for (const r of res) {
                processed.push(
                    <div style={{ margin: '1em' }} dangerouslySetInnerHTML={{ __html: r.raw_html }}>
                    </div>
                );
            }

            this.setState({ searchResults: processed });
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
            this.setState({ loginClicked: true });

            this.usernameInput.current.focus();
            this.usernameInput.current.select();
        }
    }

    searchButtonClick() {
        this.setState({ searchClicked: !this.state.searchClicked });

        this.searchInput.current.focus();
        this.searchInput.current.select();
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

        const cond = this.state.loginClicked && this.state.loggedInUser.length === 0;

        const transitionStyle = {
            transition: 'height 0.5s',
            height: cond ? '1.75em' : '0',
            pointerEvents: cond ? '' : 'none',
        };

        const inputBoxStyle = Object.assign({
            margin: '0.5em',
            overflowY: 'hidden',
        }, boxStyle, transitionStyle, { border: this.state.loginError ? '1px solid red' : 'none' }); // this is jank; please find something better

        const inputStyle = Object.assign({
            padding: '0.25em 0.5em',
            color: menuTextColor,
            fontFamily: fontFamily,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
        }, transitionStyle);

        const itemStyle = {
            margin: '0.66em',
            userSelect: 'none',
        };

        const loginButtonStyle = Object.assign(boxStyle, transitionStyle, {
            border: 'none',
            overflowY: 'hidden',
            fontSize: '12px',
            fontFamily: fontFamily,
            width: 'fit-content',
            margin: '0 0.5em 0.5em',
            float: 'right',
            cursor: 'default',
        });

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
            width: '40%',
            height: '40%',
            zIndex: 3,
            backgroundColor: '#51515130',
            top: 'calc(50vh - 20%)',
            left: 'calc(50vw - 20%)',
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
        });

        const boxInputStyle = Object.assign({}, inputStyle, {
            width: '100%',
            height: '',
            pointerEvents: ''
        });

        const resultsBoxStyle = Object.assign({}, boxSearchStyle, {
            height: 'calc(100% - 5em)',
            marginTop: '4em',
            overflow: 'scroll',
        });

        const typingTextValue = this.state.loggedInUser.length > 0 ? 'logged in as ' + this.state.loggedInUser : 'not logged in';

        return (
            <div>
                <div style={ searchResults }>
                    <div style={ boxSearchStyle }>
                        <input type="text" ref={ this.searchInput } onKeyPress={ this.searchKeyPress.bind(this) } style={ boxInputStyle } />
                    </div>
                    <div style={ resultsBoxStyle }>
                        { this.state.searchResults }
                    </div>
                </div>

                <div style={ caretStyle }>></div>
                <TypingText text={ typingTextValue } style={ typingTextStyle } />
                <TypingText text="last saved: " style={ lastSavedStyle } />
                <TypingText text={ this.state.lastSaved } compareAll={ true } style={ timeStyle } />
                <WordProcessor ref={ this.wordProcessor } />

                { /* NAVIGATION BOX */ }

                <div style={ positionStyle }>
                    <div style={ optionsStyle }>
                        <span style={ itemStyle } onClick={ this.loginButtonClick.bind(this) }>login</span>
                        <span style={ itemStyle } onClick={ this.saveButtonClick.bind(this) }>save</span>
                        <span style={ itemStyle } onClick={this.searchButtonClick.bind(this) }>search</span>
                    </div>

                    { /* LOGIN INPUT FIELDS */ }

                    <div style={{ margin: '1em' }}>
                        <div tabIndex="-1" style={ inputBoxStyle }>
                            <input type="text" ref={ this.usernameInput } onKeyPress={ this.loginKeyPress.bind(this) } placeholder="username" style={ inputStyle } />
                        </div>
                        <div tabIndex="-1" style={ inputBoxStyle }>
                            <input type="text" ref={ this.passwordInput } onKeyPress={ this.loginKeyPress.bind(this) } placeholder="password" style={ inputStyle } />
                        </div>
                        <div style={ loginButtonStyle } onClick={ this.userLoginAttempt.bind(this) }>
                            <div style={{ padding: '0.25em 0.5em' }}>></div>
                        </div>
                    </div>

                    <div style={{ margin: '2.5em 1em' }}>
                        <div tabIndex="-1" style={ Object.assign(inputBoxStyle, { overflowX: 'hidden' }) }>
                            <input type="text" ref={ this.newUsernameInput } onKeyPress={ this.newUserKeyPress.bind(this) } placeholder="new username" style={ inputStyle } />
                        </div>
                        <div tabIndex="-1" style={ inputBoxStyle }>
                            <input type="text" ref={ this.newPasswordInput } onKeyPress={ this.newUserKeyPress.bind(this) } placeholder="new password" style={ inputStyle } />
                        </div>
                        <div style={ loginButtonStyle } onClick={ this.createUserAttempt.bind(this) }>
                            <div style={{ padding: '0.25em 0.5em' }}>></div>
                        </div>
                    </div>

                    { /* END LOGIN FIELDS */ }

                </div>

                { /* END NAVIGATION BOX */ }

            </div>
        );
    }
}
