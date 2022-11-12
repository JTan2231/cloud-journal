import * as config from '../config.js';
import React from 'react';
import WordProcessor from '../components/word_processor.jsx';

import {
    Navigate,
    useLocation
} from 'react-router-dom';

function locationHookWrapper(component) {
    return function WrappedComponent(props) {
        const loc = useLocation();
        return <Editor {...props} location={ loc } />;
    }
}

class Editor extends React.Component {
    constructor(props) {
        super(props);

        this.wordProcessor = React.createRef();
    }

    componentDidMount() {
    }

    render() {
        const optionsStyle = {
            zIndex: '1',
            position: 'absolute',
            top: '0',
            right: '0',
            margin: '1em',
            padding: '0.5em 1.5em 0.5em 1.5em',
            color: '#faebd799',
            backgroundColor: '#ffdb6e24',
            border: '1px solid #f9d6a730',
            borderRadius: '0.5em',
            fontSize: '14px',
            fontFamily: 'Courier New',
            textAlign: 'center',
            cursor: 'default',
        };

        const itemStyle = {
            margin: '0.66em',
        };

        return (
            <div>
                <WordProcessor ref={ this.wordProcessor } />
                <div style={ optionsStyle }>
                    <span style={ itemStyle }>Login</span>
                    <span style={ itemStyle }>Save</span>
                    <span style={ itemStyle }>Search</span>
                </div>
            </div>
        );
    }
}

export default locationHookWrapper(Editor);
