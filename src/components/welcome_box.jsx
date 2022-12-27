import * as config from '../util/config.js';
import * as styles from '../util/styles.js';
import React from 'react';

export default class WelcomeBox extends React.Component {
    constructor(props) {
        super(props);

        this.actionTextStyle = {
            marginTop: '1em',
        };

        this.defaultActionText = (
            <>
                <div style={ this.actionTextStyle }>
                    An automated tool for saving and organizing your notes.
                    <span className="menuItem" onClick={ this.props.loginClick }> <u>Login</u> </span>
                    or 
                    <span className="menuItem" onClick={ this.props.newUserClick }> <u>create a new user</u> </span>
                    to get started.
                </div>
            </>
        );

        this.state = {
            actionText: this.defaultActionText,
        };

        this.marginDefault = 0.5;
        this.paddingDefault = 0.5;
    }

    getActionText(userid) {
        if (userid === -1) {
            return this.defaultActionText;
        }
        else {
            return (
                <ul>
                    <li>Use the <u className="menuItem" onClick={ this.props.libraryClick }>library</u> to look through your saved entries</li>
                    <li>Click <u className="menuItem" onClick={ this.props.collectionsClick }>collections</u> to create and view your generated collections of entries</li>
                </ul>
            );
        }
    }

    render() {
        const containerStyle = Object.assign({}, styles.libraryResults, {
            display: this.props.welcomeShowing ? 'flex' : 'none',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
            fontSize: '14px',
            width: '30em',

        });

        const textStyle = Object.assign({}, styles.text, {
            fontSize: '1.25em',
            margin: '',
            overflowWrap: 'break-word',
            margin: '0 0 0 2rem',
        });

        const headerStyle = Object.assign({}, textStyle, {
            fontSize: '2em',
            flexBasis: 'fit-content',
            margin: '0 0 1rem 1rem',
        });

        return (
            <div style={ containerStyle }>
                <div style={{ flexBasis: '100%', }}>
                    <div style={ headerStyle }>
                        Eidetic
                    </div>
                    <div style={ textStyle }>
                        <div>
                            AI-assisted knowledge indexing and organization.
                        </div>
                        { this.getActionText(this.props.userid) }
                    </div>
                </div>
            </div>
        );
    }
}
