import * as config from '../config.js';
import React from 'react';
import { Navigate } from 'react-router-dom';

export default class LoginPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userid: null
        };

        this.userList = [];
        this.entryList = [];

        this.username = React.createRef();
        this.password = React.createRef();
        this.passwordConfirm = React.createRef();
        this.userButton = React.createRef();
        this.existingUserError = React.createRef();

        this.usernameLogin = React.createRef();
        this.passwordLogin = React.createRef();
        this.loginButton = React.createRef();
        this.loginErrorText = React.createRef();
    }

    componentDidMount() {
        this.userButton.current.disabled = true;
        this.loginButton.current.disabled = true;
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
                this.setState({ userid: res.user_id, username: username });
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

    createUserKeyPress(e) {
        if (e.key === 'Enter' && !this.userButton.current.disabled) {
            this.createUser();
        }
    }

    render() {
        const disabled = {
            pointerEvents: 'none',
            opacity: 0.4,
        };

        const state = {
            userid: this.state.userid,
            username: this.state.username,
        };

        const base = {};

        return (
            <div>
                <div>
                    { this.state.userid && (
                        <Navigate to="/home/" state={ state } replace={ true } /> )}
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
            </div>
        );
    }
}
