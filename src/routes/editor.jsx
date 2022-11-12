import React from 'react';
import WordProcessor from '../components/word_processor.jsx';

export default class Editor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loginClicked: false,
        };

        this.wordProcessor = React.createRef();

        this.usernameInput = React.createRef();
        this.passwordInput = React.createRef();
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
    }

    render() {
        const backgroundColor = 'rgba(136, 136, 136, 0.1)';
        const menuTextColor = 'rgb(191, 187, 187)';
        const borderColor = '1px solid rgba(188, 193, 189, 0.43)';

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
            fontFamily: 'Courier New',
            textAlign: 'center',
            cursor: 'default',
        }, boxStyle);

        const clicked = this.state.loginClicked;

        const transitionStyle = {
            transition: 'height 0.5s',
            height: clicked ? '1.75em' : '0',
            pointerEvents: this.state.loginClicked ? '' : 'none',
        };

        const inputBoxStyle = Object.assign({
            margin: '0.5em',
            overflowY: 'hidden',
        }, boxStyle, transitionStyle, { border: 'none' }); // this is jank; please find something better

        const inputStyle = Object.assign({
            padding: '0.25em 0.5em',
            color: menuTextColor,
            fontFamily: 'Courier New',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
        }, transitionStyle);

        const itemStyle = {
            margin: '0.66em',
        };

        const loginButtonStyle = Object.assign(boxStyle, transitionStyle, {
            border: 'none',
            overflowY: 'hidden',
            fontSize: '12px',
            fontFamily: 'Courier New',
            width: 'fit-content',
            margin: '0 0.5em 0.5em',
            float: 'right',
            cursor: 'default',
        });

        return (
            <div>
                <WordProcessor ref={ this.wordProcessor } />

                { /* NAVIGATION BOX */ }

                <div style={ positionStyle }>
                    <div style={ optionsStyle }>
                        <span style={ itemStyle } onClick={ (() => this.setState({ loginClicked: !this.state.loginClicked })).bind(this) }>login</span>
                        <span style={ itemStyle }>save</span>
                        <span style={ itemStyle }>search</span>
                    </div>

                    { /* LOGIN INPUT FIELDS */ }

                    <div style={{ margin: '1em' }}>
                        <div tabIndex="-1" style={ inputBoxStyle }>
                            <input type="text" ref={ this.usernameInput } placeholder="username" style={ inputStyle } />
                        </div>
                        <div tabIndex="-1" style={ inputBoxStyle }>
                            <input type="text" ref={ this.passwordInput } placeholder="password" style={ inputStyle } />
                        </div>
                        <div style={ loginButtonStyle } onClick={ this.userLoginAttempt.bind(this) }>
                            <div style={{ padding: '0.25em 0.5em' }}>login</div>
                        </div>
                    </div>

                    { /* END LOGIN FIELDS */ }

                </div>

                { /* END NAVIGATION BOX */ }

            </div>
        );
    }
}
