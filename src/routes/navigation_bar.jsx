import React from 'react';

import { Navigate } from 'react-router-dom';

export default class NavigationBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            navEntries: false,
            navCollections: false,
            navAccount: false,
            navLogin: false,
            userSelection: { userid: null, username: null },
        };
    }

    viewEntryRepository() {
        this.setState({ navEntries: true });
    }

    viewCollectionRepository() {
        this.setState({ navCollections: true });
    }

    viewAccount() {
        this.setState({ navAccount: true });
    }

    logout() {
        this.setState({
            navLogin: true,
            userSelection: { userid: null, username: null },
        });
    }

    navigation(condition, path, state) {
        return (
            <span>
                { condition && 
                  (<Navigate to={ path } state={ state } replace={ true } />) }
            </span>
        );
    }

    render() {
        const state = {
            userid: this.state.userSelection.userid,
            username: this.state.userSelection.username
        };

        return (
            <div>
                { this.navigation(this.state.navEntries, "/entries/", state) }
                { this.navigation(this.state.navCollections, "/collections/", state) }
                { this.navigation(this.state.navLogin, "/", state) }
                { this.navigation(this.state.navAccount, "/account/", state) }

                <div style={{ 'margin': '0px 0px 30px 0px' }}>
                    <br />
                    <div>
                        <span>Account: </span>
                        <button onClick={ this.viewAccount.bind(this) }>
                            Account settings
                        </button>
                        <button onClick={ this.logout.bind(this) }>
                            Log out
                        </button>
                    </div>
                    <div>
                        <span>Repositories: </span>
                        <button onClick={ this.viewEntryRepository.bind(this) }>
                            Entries
                        </button>
                        <button onClick={ this.viewCollectionRepository.bind(this) }>
                            Collections
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
