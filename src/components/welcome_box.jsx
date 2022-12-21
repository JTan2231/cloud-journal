import * as config from '../util/config.js';
import * as styles from '../util/styles.js';
import React from 'react';

export default class WelcomeBox extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        };

        this.marginDefault = 0.5;
        this.paddingDefault = 0.5;
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
                        <ul>
                            <li>Use the <u>library</u> to look through your saved entries</li>
                            <li>Use <u>explore</u> to see what others are posting</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}
