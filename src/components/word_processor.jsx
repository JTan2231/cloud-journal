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

    handleFiles(e) {
        var reader = new FileReader();

        reader.onload = (function() {
            var newImg = document.createElement('img');
            newImg.src = reader.result;

            newImg.style.maxWidth = '40vw';
            newImg.style.maxHeight = '40vh';

            this.textbox.current.appendChild(document.createElement('br'));
            this.textbox.current.appendChild(newImg);
            this.textbox.current.appendChild(document.createElement('br'));
        }).bind(this);

        reader.readAsDataURL(e.target.files[e.target.files.length-1]);
    }

    // returns a string containing the raw HTML of the textbox
    exportHTML() {
        return this.textbox.current.innerHTML;
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
