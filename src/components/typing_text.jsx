import React from 'react';

export default class TypingText extends React.Component {
    constructor(props) {
        super(props);

        this.frequency = 1;
        this.build_frequency = 8;
        this.mounted = false;

        this.url = props.url ? props.url : '';
        this.title = props.text;

        const style = { ...props.style };

        this.compareWholeStrings = props.compareAll;

        this.state = {
            hovered: false,
            built: false,
            build_index: 0,
            clock: 1,
            text: '',
            title: props.text,
            style: style
        };
    }

    componentDidMount() {
        this.mounted = true;
        if (this.mounted) {
            this.timerID = setInterval(
                () => this.tick(), 1000/60
            );
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    buildText() {
        var text = this.state.text;
        var idx = this.state.build_index;

        if (text === this.state.title) {
            this.setState({ built: true, clock: 1 });
            return;
        }

        text += this.state.title[idx];
        idx++;
        this.setState({
            text: text,
            build_index: idx,
            clock: 1
        });
    }

    destroyText() {
        var text = this.state.text;
        var idx = this.state.build_index;

        if (text.length === 0) {
            this.setState({
                clock: 1,
                built: false,
            });
            return;
        }

        text = text.substring(0, text.length-1);
        idx--;
        this.setState({
            text: text,
            build_index: idx,
            clock: 1,
        });
    }

    tick() {
        var text = this.state.text, clock = Math.min(this.state.clock + 1, this.build_frequency);
        this.setState({ title: this.props.text });
        if (clock - this.build_frequency === 0) {
            if (!this.state.built) {
                this.buildText();
                return;
            }
            else if (this.compareWholeStrings && text !== this.state.title) {
                this.destroyText();
                return;
            }
            else if (text.length > 0 && text[0] === 'n' && text[0] !== this.state.title[0]) {
                this.destroyText();
                return;
            }
            else if (text.length === 0) {
                this.setState({ built: false });
            }
        }

        var newState = {
            text: text,
            clock: clock,
            color: text.length > 0 && text[0] !== 'n' ? 'green' : 'grey',
        };

        this.setState(newState);
    }

    render() {
        const style = Object.assign({ color: this.state.color }, this.state.style);

        if (this.url.length === 0) {
            return (
                <div>
                    <div style={ style }>{ this.state.text }
                    </div>
                </div>
            );
        }

        return (
            <a href={ this.url }>
                <div style={ style }>{ this.state.text }
                </div>
            </a>
        );
    }
}
