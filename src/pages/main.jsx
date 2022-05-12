import React from 'react';
import WordProcessor from '../components/word_processor.jsx';

export default class MainPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.wordProcessor = React.createRef();
    }

    clickTest() {
        console.log(this.wordProcessor.current.exportHTML());
        console.log(this.wordProcessor.current.exportText());
    }

    render() {
        return (
            <div>
                <WordProcessor ref={ this.wordProcessor } />
                <div onClick={ this.clickTest.bind(this) }>testing</div>
            </div>
        );
    }
}
