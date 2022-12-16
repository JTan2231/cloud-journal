import * as config from '../util/config.js';
import * as styles from '../util/styles.js';
import React from 'react';

import '../styles/search_item.css';

export default class Search extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.marginDefault = 0.5;
        this.paddingDefault = 0.5;

        this.searchDefault = (<div style={ styles.textStyle }>{ `Search through your saved entries.` }</div>);

        this.searchInput = React.createRef();
        this.resultsClickDisplay = React.createRef();
    }

    searchResultsClick(id) {
        fetch(`${config.API_ROOT}entries/?user_id=${this.props.userid}&id=${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(res => res.json()).then(res => {
            this.setState({
                resultsClickDisplay: res,
                currentEntryId: id,
            });
        });
    }

    getResultsStyles(margin, padding) {
        if (margin === null) {
            margin = this.marginDefault;
        }

        if (padding === null) {
            padding = this.paddingDefault;
        }

        const containerStyle = Object.assign({}, styles.textStyle, {
            borderRadius: '0.5em',
            padding: `${padding}em`,
            margin: `${margin}em`,
            height: '10em',
            maxWidth: `calc(25% - ${2*margin + 2*padding}em)`,
            flexBasis: `calc(25% - ${2*margin + 2*padding}em)`,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '0.8em',
        });

        const boldStyle = {
            fontSize: '1.2em',
            fontWeight: '',
            color: 'white'
        };

        return [ containerStyle, boldStyle ];
    }

    formatEntryList(entries) {
        const [ entryStyle,
                boldStyle ] = this.getResultsStyles(null, null);

        let processed = [];
        for (var i = 0; i < entries.length; i++) {
            let words = entries[i].preview.split(' ');
            let boldWords = words.slice(0, config.BOLD_LENGTH).join(' ');
            words = words.slice(config.BOLD_LENGTH, words.length).join(' ');

            const id = entries[i].entryid;
            processed.push(
                <div class="searchItem" style={ entryStyle } onClick={ () => this.searchResultsClick(id) }>
                    <span>
                        <span style={ boldStyle }>{ boldWords }</span> { words }
                    </span>
                </div>
            );
        }

        return processed;
    }

    entryQuery() {
        const userid = this.props.userid;
        const query = this.searchInput.current.value;
        fetch(`${config.API_ROOT}queries/?user_id=${userid}&query=${encodeURI(query)}&return=True`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => res.json()).then(res => res.map(r => ({
            entryid: r.id,
            preview: r.text_preview
        }))).then(res => {
            let previews = this.formatEntryList(res);
            
            if (previews.length === 0) {
                previews = [{
                    id: 0,
                    preview: this.searchDefault,
                }];
            }

            this.setState({ searchResults: previews });
        });
    }

    setPreviews() {
        let entries = this.props.entryPreviews;
        entries = this.formatEntryList(entries);

        this.setState({ searchResults: entries });
    }

    searchKeyPress(e) {
        if (e.key === 'Enter') {
            this.entryQuery();
        }
    }

    clearResults() {
        this.setState({ searchResults: this.searchDefault });
    }

    returnToResults() {
        this.setState({
            resultsClickDisplay: null,
            currentEntryId: -1,
        });
    }

    reset() {
        this.setPreviews();
        this.returnToResults();
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
            outline: 'none',
            backgroundColor: 'transparent',
            height: '',
            pointerEvents: '',
            border: 'none',
            margin: '0.3em',
        });

        const resultsBoxStyle = Object.assign({}, boxSearchStyle, {
            height: 'calc(100% - 6em)',
            width: 'calc(100% - 3em',
            marginTop: '4em',
            backgroundColor: 'black',
            padding: '0.5em',
        });

        const resultsClickDisplayToggle = this.state.resultsClickDisplay != null;

        let [ resultsClickDisplayStyle, , ] = this.getResultsStyles(null, null);
        resultsClickDisplayStyle = Object.assign({}, resultsClickDisplayStyle, {
            height: `calc(100% - ${2*this.marginDefault + 2*this.paddingDefault}em`,
            maxWidth: `calc(100% - ${2*this.marginDefault + 2*this.paddingDefault}em`,
            flexBasis: '',
            fontSize: '15px',
            lineHeight: '1.2em',
        });

        const resultsClickDisplayToggleStyle = {
            display: resultsClickDisplayToggle ? 'block' : 'none',
        };

        const goBackButton = Object.assign({}, resultsClickDisplayStyle, {
            height: '',
            maxWidth: '',
            width: 'fit-content',
        });

        const buttonWrapperStyle = {
            display: 'flex',
            justifyContent: 'space-between',
        };

        const flexWrapperStyle = {
            flexWrap: 'wrap',
            display: resultsClickDisplayToggle ? 'none' : 'flex',
        };

        return (
            <div style={ searchResults }>
                <div style={ boxSearchStyle }>
                    <input type="text" ref={ this.searchInput } onKeyPress={ this.searchKeyPress.bind(this) } placeholder="search" style={ boxInputStyle } />
                </div>
                <div style={ resultsBoxStyle }>
                    <div style={ flexWrapperStyle }>
                        { this.state.searchResults }
                    </div>

                    <div style={ resultsClickDisplayToggleStyle }>
                        <div style={ buttonWrapperStyle }>
                            <span className="searchItem" style={ goBackButton } onClick={ this.returnToResults.bind(this) }>go back</span>
                            <span className="searchItem" style={ goBackButton } onClick={ () => this.props.searchClick(this.state.currentEntryId) }>load</span>
                        </div>
                        <div ref={ this.resultsClickDisplay } style={ resultsClickDisplayStyle } dangerouslySetInnerHTML={{ __html: this.state.resultsClickDisplay }}>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
