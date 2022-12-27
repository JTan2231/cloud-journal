import * as config from '../util/config.js';
import * as styles from '../util/styles.js';
import React from 'react';

import '../styles/entry_item.css';

export default class Collections extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            maximized: false,
            createButtonClicked: false,
            entryDisplay: null,
            collectionClicked: '',
            selectedEntryid: -1,
            selectedEntryIdx: -1,
            collections: [],
        };

        this.marginDefault = 0.5;
        this.paddingDefault = 0.5;

        this.resultsClickDisplay = React.createRef();

        this.newCollectionName = React.createRef();
    }

    createCollectionRequest() {
        fetch(`${config.API_ROOT}collections/`, {
            method: 'POST',
            body: JSON.stringify({
                user_id: this.props.userid,
                entry_id: this.state.selectedEntryid,
                title: this.newCollectionName.current.value,
            }),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${this.props.authToken}`,
            },
        }).then(res => res.json()).then(res => {
            this.props.refreshCollectionList(this.props.userid);
            this.backToRoot();
            this.setPreviews();
        });
    }

    getFullEntry(id) {
        fetch(`${config.API_ROOT}entries/?user_id=${this.props.userid}&id=${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${this.props.authToken}`,
            },
        }).then(res => res.json()).then(res => {
            this.setState({
                entryDisplay: res,
            });
        });
    }

    collectionClick(collectionid, collectionTitle) {
        fetch(`${config.API_ROOT}collectionentries/?collection_id=${collectionid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${this.props.authToken}`,
            },
        }).then(res => res.json()).then(res => {
            res = res.map(r => ({
                entryid: r.id,
                timestamp: r.timestamp,
                title: r.title,
                preview: r.text_preview,
            }));

            let clickFunction = (obj) => (() => this.getFullEntry(obj.id));
            this.setState({
                userEntries: this.formatEntryList(res, this.state.maximized, clickFunction),
                collectionClicked: collectionTitle,
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

        return [ containerStyle, boldStyle, headerStyle, timestampStyle, contentStyle ];
    }

    isIsoDate(str) {
        const regex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{6}/;

        return regex.test(str);
    }

    isUnset(title) {
        return this.isIsoDate(title) || title === 'untitled' || title === 'placeholder' || title === '';
    }

    formatTitle(title, timestamp) {
        if (this.isUnset(title)) {
            let split = timestamp.split('T');
            return `${split[0]} ${split[1].split('.')[0]}`;
        }

        return title;
    }

    formatEntryList(entries, maximized, clickFunctionGenerator) {
        // NOTE: clickFunctionGenerator takes an object as an argument with:
        //   - id
        //   - idx

        if (maximized === undefined) {
            maximized = false;
        }

        const [ entryStyle,
                boldStyle,
                headerStyle,
                timestampStyle,
                contentStyle ] = this.getResultsStyles(null, null, maximized);

        let processed = [];
        for (var i = 0; i < entries.length; i++) {
            let words = entries[i].preview.split(' ');
            let boldWords = words.slice(0, config.BOLD_LENGTH).join(' ');
            words = words.slice(config.BOLD_LENGTH, words.length).join(' ');

            const timestamp = entries[i].timestamp;
            const id = entries[i].entryid;
            const title = this.formatTitle(entries[i].title, timestamp);

            const clickObj = {
                id: id,
                idx: i,
            };

            processed.push(
                <div className="entryItem" tabIndex="0" id={ ''+id } style={ entryStyle } onClick={ clickFunctionGenerator(clickObj) }>
                    <div style={ headerStyle }>
                        <div style={ boldStyle }>
                            { title }
                        </div>
                        <div style={ timestampStyle }>
                            { timestamp.substr(0, 10) }
                        </div>
                    </div>
                    <div style={ contentStyle }>
                        <span>{ boldWords }</span> { words }
                    </div>
                </div>
            );
        }

        return processed;
    }

    formatCollectionsList(collections, maximized) {
        if (maximized === undefined) {
            maximized = false;
        }

        let [ collectionsStyle,
              boldStyle,
              headerStyle,
              timestampStyle,
              contentStyle ] = this.getResultsStyles(null, null, maximized);

        collectionsStyle = Object.assign({}, collectionsStyle, { height: '3em', });

        let processed = [];
        for (var i = 0; i < collections.length; i++) {
            const timestamp = collections[i].datetime_created;
            const id = collections[i].collection_id;
            const title = this.formatTitle(collections[i].title, timestamp);
            processed.push(
                <div className="libraryItem" style={ collectionsStyle } onClick={ () => this.collectionClick(id, title) }>
                    <div style={ headerStyle }>
                        <div style={ boldStyle }>
                            { title }
                        </div>
                        <div style={ timestampStyle }>
                            { timestamp.substr(0, 10) }
                        </div>
                    </div>
                </div>
            );
        }

        return processed;
    }

    setPreviews(collec=null) {
        let entries = [];

        let c = collec !== null ? collec : this.props.collections;
        let collections = this.formatCollectionsList(c, this.state.maximized);

        this.setState({ userEntries: entries, collections: collections });
    }

    libraryKeyPress(e) {
        if (e.key === 'Enter') {
            this.entryQuery();
        }
    }

    clearResults() {
        this.setState({ libraryResults: this.libraryDefault });
    }

    createCollection() {
        let clickFunction = (obj) => ((e) => {
            this.setState({
                selectedEntryid: obj.id,
                selectedEntryIdx: obj.idx,
            });
        });

        this.setState({
            userEntries: this.formatEntryList(this.props.entryPreviews, this.state.maximized, clickFunction),
            createButtonClicked: true,
        });
    }

    reset() {
        this.setState({
            maximized: false,
            createButtonClicked: false,
            collectionClicked: '',
            selectedEntryid: -1, 
            selectedEntryIdx: -1,
            entryDisplay: null,
        });
    }

    backToRoot() {
        this.newCollectionName.current.value = '';
        this.setState({
            createButtonClicked: false,
            collectionClicked: '',
            selectedEntryid: -1, 
            selectedEntryIdx: -1,
            entryDisplay: null,
        });
    }

    maximizeClick() {
        let maxed = !this.state.maximized;
        this.setState({
            maximized: maxed,
            collections: this.formatCollectionsList(this.props.collections, maxed),
        });
    }

    getButton(buttonStyle, text='', clickFunction=null) {
        if (clickFunction === null && this.state.entryDisplay != null) {
            clickFunction = (() => this.setState({ entryDisplay: null })).bind(this);
        }

        if (this.state.entryDisplay != null || this.state.createButtonClicked || this.state.collectionClicked) {
            text = text === '' ? 'go back' : text;
            clickFunction = clickFunction === null ? this.backToRoot.bind(this) : clickFunction;
        }
        else {
            text = text === '' ? 'create' : text;
            clickFunction = clickFunction === null ? this.createCollection.bind(this) : clickFunction;
        }

        return (
                <span className="libraryItem" style={ buttonStyle } onClick={ clickFunction }>{ text }</span>
        );
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

        let libraryResults = Object.assign({}, styles.libraryResults, {
            display: this.props.collectionsClicked ? '' : 'none',
        });

        const boxSearchStyle = Object.assign({}, boxStyle, {
            margin: '0.5em',
            transition: '',
            float: '',
            pointerEvents: '',
            zIndex: 4,
            overflowX: 'hidden',
            width: '100%',
            height: '2em',
            border: 'none',
            backgroundColor: 'rgba(136, 136, 136, 0.2)',
        });

        const boxInputStyle = {
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
        };

        const headerWrapperStyle = Object.assign({}, boxSearchStyle, {
            backgroundColor: 'transparent',
            width: 'calc(100% - 2em)',
            position: 'absolute',
            overflow: 'hidden',
        });

        const headerTextStyle = Object.assign({}, boxInputStyle, {
            fontSize: '14px',
        });

        let resultsBoxStyle = Object.assign({}, boxSearchStyle, {
            height: `calc(100% - ${styles.libraryBaseMath} - 3em - 1em - 2em - 0.66em - 3em)`,
            width: 'calc(100% - 3em',
            margin: '7.5em 1em 0.5em',
            backgroundColor: 'black',
            padding: '0 0.5em 0.5em 0.5em',
            borderRadius: '0 0 0.5em 0.5em',
            position: 'absolute',
        });

        let buttonBannerStyle = Object.assign({}, resultsBoxStyle, {
            margin: '3.5em 1em 0em',
            height: '3em',
            borderRadius: '0.5em 0.5em 0 0',
            padding: '0.5em',
        });

        const createToggle = this.state.createButtonClicked;
        const collectionToggle = this.state.collectionClicked;
        const selectedToggle = this.state.selectedEntryid > 0;

        const entryDisplayToggle = this.state.entryDisplay != null;

        let [ entryDisplayStyle, , , ] = this.getResultsStyles(null, null);
        entryDisplayStyle = Object.assign({}, entryDisplayStyle, {
            height: `calc(100% - ${2*this.marginDefault + 2*this.paddingDefault}em`,
            maxWidth: `calc(100% - ${2*this.marginDefault + 2*this.paddingDefault}em`,
            flexBasis: '',
            fontSize: '15px',
            lineHeight: '1.2em',
        });

        const collectionListRootStyle = {
            display: entryDisplayToggle || createToggle || collectionToggle ? 'none' : 'block',
        };

        const entryDisplayToggleStyle = {
            display: entryDisplayToggle ? 'block' : 'none',
        };

        const goBackButton = Object.assign({}, entryDisplayStyle, {
            height: '',
            maxWidth: '',
            width: 'fit-content',
            flexShrink: 0,
        });

        const buttonWrapperStyle = {
            display: 'flex',
            justifyContent: 'space-between',
        };

        const flexWrapperStyle = {
            flexWrap: 'wrap',
            display: 'flex',
            marginTop: '-0.5em',
        };

        const minMaxButton = Object.assign({}, goBackButton, {
            marginLeft: '1rem',
            lineHeight: '',
            fontSize: '12px',
            padding: '0.3em',
            position: 'relative',
            top: '0.5rem',
        });

        const addSelectedToggle = (style) => {
            return Object.assign({}, style, {
                display: selectedToggle ? '' : 'none',
            });
        };

        const getEntryList = (defaultList) => {
            if (this.state.selectedEntryIdx !== -1) {
                return defaultList[this.state.selectedEntryIdx];
            }
            else {
                return defaultList
            }
        };

        const getHeader = () => {
            let innerHTML = (<div><b>collections</b>: entry groupings by similarity</div>);

            if (createToggle) {
                if (selectedToggle) {
                    innerHTML = (
                        <div>enter a name (optional) and click create</div>
                    );
                }
                else {
                    innerHTML = (
                        <div>select an entry to start your collection</div>
                    );
                }
            }

            else if (this.state.collectionClicked.length > 0) {
                const regex = /(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)/;

                // check for HH:MM:SS time format
                if (regex.test(this.state.collectionClicked)) {
                    innerHTML = (
                        <div>viewing collection created at <b>{ this.state.collectionClicked }</b></div>
                    );
                }
                else {
                    innerHTML = (
                        <div>viewing collection named <b>{ this.state.collectionClicked }</b></div>
                    );
                }
            }

            return innerHTML;
        }

        if (!this.state.maximized) {
            return (
                <div style={ libraryResults }>
                    <div className="libraryItem" style={ minMaxButton } onClick={ this.maximizeClick.bind(this) }>
                        maximize
                    </div>
                    <div style={ headerWrapperStyle }>
                        <div style={ headerTextStyle }>
                            { getHeader() }
                        </div>
                    </div>
                    <div style={ buttonBannerStyle }>
                        <div style={ buttonWrapperStyle }>
                            { this.getButton(goBackButton) }
                            <div style={ addSelectedToggle(boxSearchStyle) }>
                                <input type="text" ref={ this.newCollectionName } placeholder="collection name" style={ boxInputStyle } />
                            </div>
                            { this.getButton(addSelectedToggle(goBackButton), 'create', this.createCollectionRequest.bind(this)) }
                        </div>
                    </div>
                    <div style={ resultsBoxStyle }>
                        <div style={{ display: createToggle ? '' : 'none' }}>
                            <div style={ flexWrapperStyle }>
                                { getEntryList(this.state.userEntries) }
                            </div>
                        </div>

                        <div style={ collectionListRootStyle }>
                            <div style={ flexWrapperStyle }>
                                { this.state.collections }
                            </div>
                        </div>

                        <div style={{ display: !entryDisplayToggle && this.state.collectionClicked ? '' : 'none' }}>
                            <div style={ flexWrapperStyle }>
                                { this.state.userEntries }
                            </div>
                        </div>

                        <div style={ entryDisplayToggleStyle }>
                            <div ref={ this.entryDisplay } style={ entryDisplayStyle } dangerouslySetInnerHTML={{ __html: this.state.entryDisplay }} />
                        </div>
                    </div>
                </div>
            );
        }
        else {
            libraryResults = Object.assign({}, libraryResults, {
                position: 'fixed',
                left: '3em',
                width: 'calc(100vw - 4em)',
                top: '',
                bottom: '1em'
            });

            resultsBoxStyle = Object.assign({}, resultsBoxStyle, {
                height: `calc(100% - ${styles.libraryBaseMath} + 1em - 3.33em)`,
            });

            entryDisplayStyle = Object.assign({}, entryDisplayStyle, {
                width: '50%',
                margin: '0.5em auto',
            });

            return (
                <div style={ libraryResults }>
                    <div className="libraryItem" style={ minMaxButton } onClick={ this.maximizeClick.bind(this) }>
                        minimize
                    </div>
                    <div style={ headerWrapperStyle }>
                        <div style={ headerTextStyle }>
                            { getHeader() }
                        </div>
                    </div>
                    <div style={ buttonBannerStyle }>
                        <div style={ buttonWrapperStyle }>
                            { this.getButton(goBackButton) }
                            <div style={ addSelectedToggle(boxSearchStyle) }>
                                <input type="text" ref={ this.newCollectionName } placeholder="collection name" style={ boxInputStyle } />
                            </div>
                            { this.getButton(addSelectedToggle(goBackButton), 'create', this.createCollectionRequest.bind(this)) }
                        </div>
                    </div>
                    <div style={ resultsBoxStyle }>
                        <div style={{ display: createToggle ? '' : 'none' }}>
                            <div style={ flexWrapperStyle }>
                                { getEntryList(this.state.userEntries) }
                            </div>
                        </div>

                        <div style={ collectionListRootStyle }>
                            <div style={ flexWrapperStyle }>
                                { this.state.collections }
                            </div>
                        </div>

                        <div style={{ display: !entryDisplayToggle && this.state.collectionClicked ? '' : 'none' }}>
                            <div style={ flexWrapperStyle }>
                                { this.state.userEntries }
                            </div>
                        </div>

                        <div style={ entryDisplayToggleStyle }>
                            <div ref={ this.entryDisplay } style={ entryDisplayStyle } dangerouslySetInnerHTML={{ __html: this.state.entryDisplay }} />
                        </div>
                    </div>
                </div>
            );
        }
    }
}
