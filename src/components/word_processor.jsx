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

    updateCurrentSelection(newSelection) {
        this.currentSelection = newSelection;
    }

    /*loadPreview() {
        this.preview.current.innerHTML = "";

        var children = this.textbox.current.childNodes;
        var contents = [];

        var tnode;
        for (var i = 0; i < children.length; i++) {
            var text = children[i].textContent;

            if (text === '') {
                this.preview.current.appendChild(document.createElement('br'));
            }
            else {
                tnode = document.createElement('div');
                tnode.textContent = text;
                this.preview.current.appendChild(tnode);
            }
        }

        this.setState({ currentSelection: window.getSelection() });
        this.currentSelection = window.getSelection();
    }*/

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
            margin: '20px',
            height: '90%'
        };

        const innerStyle = {
            border: '1px solid black',
            margin: '20px',
        };

        return (
            <div style={ outerStyle }>
                <div id="textbox" ref={ this.textbox } style={ innerStyle } 
                     contenteditable="true">
                    Edit me
                </div>
                <input type="file" id="image" name="image"
                       accept="image/png, image/jpeg" onChange={ this.handleFiles.bind(this) } />
            </div>
        );
    }
}
