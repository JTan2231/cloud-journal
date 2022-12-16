import React from 'react';
import * as config from '../util/config.js';
import * as styles from '../util/styles.js';

export default class Similarities extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            clicked: false,
            entryPreviews: [],
            simResults: [],
        };
    }

    entrySimilarityQuery(entryid) {
        fetch(`${config.API_ROOT}queries/?all=True&user_id=${this.props.userid}&qentry_id=${entryid}`, {
            method: 'GET',      
            headers: { 
                'Content-Type': 'application/json',
            }
        }).then(res => res.json()).then(res => {
            this.setState({ simResults: res });
        });
    }

    formatSimResultsList() {
        const boldStyle = {
            fontSize: '1.25em',
            fontWeight: '',
            color: 'white'
        };

        const margin = 0.5;
        const padding = 0.5;
        const entryStyle = Object.assign({}, styles.textStyle, {
            borderRadius: '0.5em',
            padding: `${padding}em`,
            margin: `${margin}em`,
            maxWidth: `calc(33% - ${2*margin + 2*padding}em)`,
            flexBasis: `calc(33% - ${2*margin + 2*padding}em)`,
            height: '10em',
            overflow: 'hidden',
        });

        let processed = [];

        for (let i = 0; i < this.state.simResults.length; i++) {
            let res = this.state.simResults[i];
            let words = res.text_preview.split(' ');
            let boldWords = words.slice(0, config.BOLD_LENGTH).join(' ');
            words = words.slice(config.BOLD_LENGTH, words.length).join(' ');

            const id = res.entryid;
            processed.push(
                <div class="searchItem" style={ entryStyle } onClick={ () => this.props.setWordProcessor(id) }>
                    <span style={ boldStyle }>{ boldWords }</span> { words }
                </div>
            );
        }

        if (processed.length === 0) {
            processed = (<div style={ styles.textStyle }>{ `Click an entry on the left to see the rest of your entries ranked in order of relevance.` }</div>);
        }

        return processed;
    }

    similarityEntryListFormat(entries) {
        const boldStyle = {  
            fontSize: '1.25em',
            fontWeight: '',
            color: 'white'
        };                      

        const entryStyle = Object.assign({}, styles.textStyle, {
            borderRadius: '0.5em',
            padding: '0.5em',    
            margin: '0 0 1em 0',    
        });

        let processed = [];
        for (let i = 0; i < entries.length; i++) {
            const kp = entries[i];

            let words = kp.preview.split(' ');    
            let boldWords = words.slice(0, config.BOLD_LENGTH).join(' ');
            words = words.slice(config.BOLD_LENGTH, words.length).join(' ');

            processed.push(
                <div class="searchItem" style={ entryStyle } onClick={ () => this.entrySimilarityQuery(kp.entryid) }>
                    <span style={ boldStyle }>{ boldWords }</span> { words }
                </div>
            );
        }

        if (processed.length === 0) {
            processed = (<div style={ styles.textStyle }>{ `There's nothing here...` }</div>);
        }

        return processed;
    }

    render() {
        const simResults = styles.addDisplay(styles.searchResults, this.props.clicked);

        return (
            <div style={ simResults }>
                <div className="scrollBar" style={ styles.boxSimResults }>
                    { this.similarityEntryListFormat(this.props.entryPreviews) }
                </div>
                <div style={ styles.simResultsBox }>
                    { this.formatSimResultsList() }
                </div>
            </div>
        );
    }
}
