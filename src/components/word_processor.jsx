import React from 'react';
import * as styles from '../util/styles.js';

// TODO: text formatting
export default class WordProcessor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentSelection: null,
            prompt: 'type or paste content',
        };

        this.currentSelection = null;
        this.files = null;

        this.textbox = React.createRef();
        this.preview = React.createRef();
    }

    componentDidMount() {
        this.focusTextbox();
    }

    focusTextbox() {
        this.textbox.current.focus();
    }

    updateCurrentSelection(newSelection) {
        this.currentSelection = newSelection;
    }

    loadHTML(rawHTML) {
        // this whole wrapping bit should be somewhere else so we don't
        // do all this unnecessary processing
        const parser = new DOMParser()
        var wrappedHTML = '<div id="wrapper">' + rawHTML + '</div>';
        var nodeTreeFull = parser.parseFromString(wrappedHTML, "text/html");
        var nodeTree = nodeTreeFull.childNodes[0].childNodes[1]; // <html>, <body>, wrapping <div>

        this.textbox.current.innerHTML = "";
        for (var i = 0; i < nodeTree.childNodes.length; i++) {
            this.textbox.current.appendChild(nodeTree.childNodes[i]);
        }
    }

    handleFiles(e) {
        var reader = new FileReader();

        reader.onload = (function() {
            var newImg = document.createElement('img');
            newImg.src = reader.result;

            newImg.style.maxWidth = '40vw';
            newImg.style.maxHeight = '40vh';

            var wrapper = document.getElementById('wrapper');

            wrapper.appendChild(document.createElement('br'));
            wrapper.appendChild(newImg);
            wrapper.appendChild(document.createElement('br'));
        }).bind(this);

        reader.readAsDataURL(e.target.files[e.target.files.length-1]);
    }

    // returns a string containing the raw HTML of the textbox
    exportHTML() {
        var html = this.textbox.current.innerHTML;
        var wrapperCandidate = html.substring(0, 18);
        if (wrapperCandidate !== '<div id="wrapper">') {
            html = '<div id="wrapper">' + html + '</div>';
        }

        return html;
    }

    // returns a list of strings containing all text contents in the word processor
    exportText() {
        var texts = [];
        const children = this.textbox.current.childNodes;
        for (var i = 0; i < children.length; i++) {
            texts.push(children[i].textContent);
        }

        return texts;
    }

    clear() {
        this.textbox.current.innerHTML = '';
    }

    editorKeyPress() {
        if (this.textbox.current.innerHTML === '<br>') {
            this.clear();
        }

        const defaultPrompt = 'type or paste content';
        if (this.textbox.current.innerHTML.length === 0) {
            this.setState({ prompt: defaultPrompt });
        }
        else if (this.state.prompt === defaultPrompt) {
            this.setState({ prompt: '' });
        }
    }

    render() {
        const outerStyle = {
            position: 'relative',
            zIndex: '0',
            display: 'flex',
            backgroundColor: 'rgb(16, 16, 21)',
            minHeight: '100vh',
            height: '100%',
            width: '100%',
            cursor: 'text',
        };

        const innerStyle = {
            outline: 'none',
            color: 'white',
            fontSize: '16px',
            fontFamily: 'Courier New',
            minWidth: '2px',
            overflowWrap: 'break-word',
        };

        const backgroundStyle = {
            backgroundColor: 'black',
            borderRadius: '1em',
            margin: '4em 3em 0 3em',
            height: 'calc(100vh - 6em - 1em)',
            width: 'calc(100% - 30em - 1.5em - 2em)',
            padding: '1em',
            overflow: 'scroll',
        };

        document.body.style.margin = "0";

        return (
            <div style={ outerStyle } onClick={ this.focusTextbox.bind(this) }>
                <div style={ backgroundStyle }>
                    <div style={ styles.caret }>
                        <span>{ this.state.prompt }</span>
                    </div>
                    <div id="textbox" tabIndex="0" ref={ this.textbox } style={ innerStyle } 
                         contentEditable="true" onKeyUp={ this.editorKeyPress.bind(this) }>
                    </div>
                </div>
            </div>
        );
    }
}
