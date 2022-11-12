import React from 'react';

// TODO: text formatting
export default class WordProcessor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentSelection: null
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

    render() {
        const outerStyle = {
            position: 'relative',
            zIndex: '0',
            display: 'flex',
            backgroundColor: 'black',
            minHeight: '100vh',
            height: '100%',
            width: '100%',
            cursor: 'text',
        };

        const innerStyle = {
            outline: 'none',
            margin: '20px',
            color: 'antiquewhite',
            fontSize: '14px',
            fontFamily: 'Courier New',
        };

        document.body.style.margin = "0";

        return (
            <div style={ outerStyle } onClick={ this.focusTextbox.bind(this) }>
                <div id="textbox" tabIndex="0" ref={ this.textbox } style={ innerStyle } 
                     contentEditable="true">
                </div>
            </div>
        );
    }
}
