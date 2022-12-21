import * as config from '../util/config.js';
import * as styles from '../util/styles.js';
import React from 'react';

import '../styles/library_item.css';

export default class Explore extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            maximized: false,
        };

        this.marginDefault = 0.5;
        this.paddingDefault = 0.5;

        this.header = (<div style={{ fontSize: '14px', }}>{ `Read others' most recently saved entries.` }</div>);

        this.libraryInput = React.createRef();
        this.resultsClickDisplay = React.createRef();
    }

    libraryResultsClick(id) {
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

    getResultsStyles(margin, padding, maximized) {
        if (margin === null) {
            margin = this.marginDefault;
        }

        if (padding === null) {
            padding = this.paddingDefault;
        }

        if (maximized === undefined) {
            maximized = false;
        }

        let size;
        if (maximized) {
            size = `calc(25% - ${2*margin + 2*padding}em)`;
        }
        else {
            size = `calc(100% - ${2*margin + 2*padding}em)`;
        }

        const containerStyle = Object.assign({}, styles.textStyle, {
            borderRadius: '0.5em',
            padding: `${padding}em`,
            margin: `${margin}em`,
            height: `15em`,
            maxWidth: size,
            flexBasis: size,
            overflow: 'hidden',
            fontSize: '1em',
        });

        const boldStyle = {
            fontSize: '1.2em',
            fontWeight: '',
            color: 'white'
        };

        const headerStyle = {
            marginBottom: '0.5em',
        };

        const timestampStyle = Object.assign({}, styles.textStyle, {
            fontSize: '0.8em',
            margin: '',
        });

        const contentStyle = {
            border: '1px solid rgba(188, 193, 189, 0.43)',
            borderRadius: '0.5em',
            padding: '0.5em',
        };

        return {
            containerStyle: containerStyle,
            boldStyle: boldStyle,
            headerStyle: headerStyle,
            timestampStyle: timestampStyle,
            contentStyle: contentStyle,
        };
    }

    isIsoDate(str) {
        if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{6}/.test(str)) return false;
        const d = new Date(str); 
        return d instanceof Date && !isNaN(d) && d.toISOString()===str; // valid date
    }

    isUnset(title) {
        return !this.isIsoDate(title) || title === 'untitled' || title === 'placeholder' || title === '';
    }

    formatEntryList(entries, maximized) {
        if (maximized === undefined) {
            maximized = false;
        }

        const styleObject = this.getResultsStyles(null, null, maximized);

        let processed = [];
        for (var i = 0; i < entries.length; i++) {
            let words = entries[i].preview.split(' ');
            let boldWords = words.slice(0, config.BOLD_LENGTH).join(' ');
            words = words.slice(config.BOLD_LENGTH, words.length).join(' ');

            const timestamp = entries[i].timestamp;
            const id = entries[i].entryid;
            const title = this.isUnset(entries[i].title) ? timestamp.split('T')[1].split('.')[0] : entries[i].title;
            processed.push(
                <div class="libraryItem" style={ styleObject.containerStyle } onClick={ () => this.libraryResultsClick(id) }>
                    <div style={ styleObject.headerStyle }>
                        <div style={ styleObject.boldStyle }>
                            { title }
                        </div>
                        <div style={ styleObject.timestampStyle }>
                            { timestamp.substr(0, 10) }
                        </div>
                    </div>
                    <div style={ styleObject.contentStyle }>
                        <span style={ styleObject.boldStyle }>{ boldWords }</span> { words }
                    </div>
                </div>
            );
        }

        return processed;
    }

    entryQuery() {
        const userid = this.props.userid;
        const query = this.libraryInput.current.value;
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
                previews = [this.libraryDefault];
            }

            this.setState({ libraryResults: previews });
        });
    }

    setPreviews() {
        let entries = this.props.entryPreviews;
        entries = this.formatEntryList(entries);

        this.setState({ exploreResults: entries });
    }

    libraryKeyPress(e) {
        if (e.key === 'Enter') {
            this.entryQuery();
        }
    }

    clearResults() {
        this.setState({ libraryResults: this.libraryDefault });
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
        this.setState({ maximized: false });
    }

    maximizeClick() {
        let maxed = !this.state.maximized;
        this.setState({
            maximized: maxed,
            exploreResults: this.formatEntryList(this.props.entryPreviews, maxed),
        });
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

        let exploreResults = Object.assign({}, styles.libraryResults, {
            display: this.props.exploreClicked ? '' : 'none',
        });

        const boxSearchStyle = Object.assign({}, boxStyle, {
            margin: '0.5em 1em',
            transition: '',
            float: '',
            pointerEvents: '',
            position: 'absolute',
            zIndex: 4,
            overflow: 'hidden',
            width: 'calc(100% - 2em)',
            height: '2em',
            border: 'none',
            backgroundColor: 'transparent',
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

        let resultsBoxStyle = Object.assign({}, boxSearchStyle, {
            height: `calc(100% - ${styles.libraryBaseMath} - 3em - 1em - 2em)`,
            width: 'calc(100% - 3em',
            marginTop: '3.25em',
            backgroundColor: 'black',
            padding: '0.5em',
            overflowY: 'auto',
        });

        const resultsClickDisplayToggle = this.state.resultsClickDisplay != null;

        let resultsClickDisplayStyle = this.getResultsStyles(null, null).containerStyle;
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

        const minMaxButton = Object.assign({}, goBackButton, {
            marginLeft: '1rem',
            lineHeight: '',
            fontSize: '12px',
            padding: '0.3em',
            position: 'relative',
            top: '0.5rem',
        });

        if (!this.state.maximized) {
            return (
                <div style={ exploreResults }>
                    <div className="libraryItem" style={ minMaxButton } onClick={ this.maximizeClick.bind(this) }>
                        maximize
                    </div>
                    <div style={ boxSearchStyle }>
                        <div style={ boxInputStyle }>
                            { this.header }
                        </div>
                    </div>
                    <div style={ resultsBoxStyle }>
                        <div style={ flexWrapperStyle }>
                            { this.state.exploreResults }
                        </div>

                        <div style={ resultsClickDisplayToggleStyle }>
                            <div style={ buttonWrapperStyle }>
                                <span className="libraryItem" style={ goBackButton } onClick={ this.returnToResults.bind(this) }>go back</span>
                                { /* <span className="libraryItem" style={ goBackButton } onClick={ () => this.props.libraryClick(this.state.currentEntryId) }>load</span> */ }
                            </div>
                            <div ref={ this.resultsClickDisplay } style={ resultsClickDisplayStyle } dangerouslySetInnerHTML={{ __html: this.state.resultsClickDisplay }}>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        else {
            exploreResults = Object.assign({}, exploreResults, {
                position: 'fixed',
                left: '3em',
                width: 'calc(100vw - 4em)',
                top: '',
                bottom: '1em',
            });

            resultsBoxStyle = Object.assign({}, resultsBoxStyle, {
                height: `calc(100% - ${styles.libraryBaseMath} + 1em)`,
            });

            return (
                <div style={ exploreResults }>
                    <div className="libraryItem" style={ minMaxButton } onClick={ this.maximizeClick.bind(this) }>
                        minimize
                    </div>
                    <div style={ boxSearchStyle }>
                        <div style={ boxInputStyle }>
                            { this.header }
                        </div>
                    </div>
                    <div style={ resultsBoxStyle }>
                        <div style={ flexWrapperStyle }>
                            { this.state.exploreResults }
                        </div>

                        <div style={ resultsClickDisplayToggleStyle }>
                            <div style={ buttonWrapperStyle }>
                                <span className="libraryItem" style={ goBackButton } onClick={ this.returnToResults.bind(this) }>go back</span>
                                { /* <span className="libraryItem" style={ goBackButton } onClick={ () => this.props.libraryClick(this.state.currentEntryId) }>load</span> */ }
                            </div>
                            <div ref={ this.resultsClickDisplay } style={ resultsClickDisplayStyle } dangerouslySetInnerHTML={{ __html: this.state.resultsClickDisplay }}>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}
