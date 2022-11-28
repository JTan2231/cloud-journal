import * as config from '../util/config.js';
import * as styles from '../util/styles.js';
import React from 'react';

export default class Search extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.textStyle = {
            margin: '1em',
            color: 'rgb(191, 187, 187)',
            fontFamily: 'Courier New',
            fontSize: '14px',
        };

        this.searchInput = React.createRef();
    }

    formatEntryList(entries, indices) {
        var processed = [];

        if (indices === null || indices === undefined) {
            indices = [...Array(entries.length).keys()];
        }

        for (var i = 0; i < indices.length; i++) {
            processed.push(
                <div style={ this.textStyle }>
                    <span>{ indices[i]+1 }. { entries[indices[i]] }</span>
                </div>
            );
        }

        return processed;
    }

    entryQuery() {
        const userid = this.props.userid;
        const query = this.searchInput.current.value;
        fetch(config.API_ROOT + 'queries/' + '?user_id=' + userid + '&query=' + encodeURIComponent(query) + '&return=True', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => res.json()).then(res => res.map(r => ({
            id: r.id - 1,
            preview: r.text_preview
        }))).then(res => {
            const previews = res.map(r => r.preview);
            const indices = res.map(r => r.id);

            console.log(previews);

            this.setState({ searchResults: this.formatEntryList(previews, indices) });
        });
    }

    searchKeyPress(e) {
        if (e.key === 'Enter') {
            this.entryQuery();
        }
    }

    render() {
        const backgroundColor = 'rgba(136, 136, 136, 0.1)';
        const menuTextColor = 'rgb(191, 187, 187)';
        const borderColor = '1px solid rgba(188, 193, 189, 0.43)';

        const fontFamily = 'Courier New';

        const boxStyle = {
            color: menuTextColor,
            backgroundColor: backgroundColor,
            border: borderColor,
            borderRadius: '0.5em',
        };

        const searchResults = Object.assign({}, styles.searchResults, {
            display: this.props.searchClicked ? '' : 'none',
        });

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

        const boxInputStyle = Object.assign({}, {
            width: '100%',
            padding: '0.25em 0.5em',
            color: menuTextColor,
            fontFamily: fontFamily,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            height: '',
            pointerEvents: '',
            border: 'none',
            margin: '0.3em',
        });

        const resultsBoxStyle = Object.assign({}, boxSearchStyle, {
            height: 'calc(100% - 5em)',
            marginTop: '4em',
            overflow: 'scroll',
        });

        return (
            <div style={ searchResults }>
                <div style={ boxSearchStyle }>
                    <input type="text" ref={ this.searchInput } onKeyPress={ this.searchKeyPress.bind(this) } placeholder="search" style={ boxInputStyle } />
                </div>
                <div style={ resultsBoxStyle }>
                    { this.state.searchResults }
                </div>
            </div>
        );
    }
}
