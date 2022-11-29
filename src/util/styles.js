export const text = {
    margin: '1em',
    color: 'rgb(191, 187, 187)',
    fontFamily: 'Courier New',
    fontSize: '14px',
};

export const backgroundColor = 'rgba(136, 136, 136, 0.1)';
export const menuTextColor = 'rgb(191, 187, 187)';
export const borderColor = '1px solid rgba(188, 193, 189, 0.43)';

export const fontFamily = 'Courier New';

export const position = {
    zIndex: '1',
    position: 'fixed',
    top: '0',
    right: '0',
    margin: '1em',
};

export const box = {
    color: menuTextColor,
    backgroundColor: backgroundColor,
    border: borderColor,
    borderRadius: '0.5em',
};

export const options = Object.assign({
    padding: '0.5em 1.5em',
    fontSize: '14px',
    fontFamily: fontFamily,
    textAlign: 'center',
    cursor: 'default',
}, box);

export const item = {
    margin: '0.66em',
    userSelect: 'none',
};

export const transition = c => ({
    transition: 'height 0.5s',
    height: c ? '1.75em' : '0',
    pointerEvents: c ? '' : 'none',
});

export const loginInputBox = Object.assign({
    margin: '0.5em',
    overflowY: 'hidden',
}, box);

export const loginInput = Object.assign({
    padding: '0.25em 0.5em',
    color: menuTextColor,
    fontFamily: fontFamily,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
});

export const loginButton = Object.assign({}, box, {
    border: 'none',
    overflowY: 'hidden',
    fontSize: '12px',
    fontFamily: fontFamily,
    width: 'fit-content',
    margin: '0 0.5em 0.5em',
    float: 'right',
    cursor: 'default',
});

export const typingText = {
    position: 'absolute',
    top: '0',
    left: '0',
    margin: '1em',
    fontFamily: fontFamily,
    zIndex: 2,
};

export const lastSaved = {
    position: 'absolute',
    top: '0',
    left: 'calc(50% - 10em)',
    margin: '1em',
    fontFamily: fontFamily,
    zIndex: 2,
    color: 'grey',
};

export const time = {
    position: 'absolute',
    top: '0',
    left: 'calc(50% - 3em)',
    margin: '1em',
    fontFamily: fontFamily,
    zIndex: 2,
    color: 'green',
};

export const caret = {
    position: 'absolute',
    top: '0',
    left: '0',
    color: 'grey',
    fontFamily: fontFamily,
    zIndex: 2,
    margin: '4.3em 1.5em',
};

export const searchResults = {
    position: 'absolute',
    width: '60%',
    height: '60%',
    zIndex: 3,
    backgroundColor: '#51515130',
    top: 'calc(50vh - 30%)',
    left: 'calc(50vw - 30%)',
    borderRadius: '0.5em',
};

export const boxSearch = Object.assign({}, box, {
    margin: '1em',
    transition: '',
    height: '',
    float: '',
    pointerEvents: '',
    position: 'absolute',
    zIndex: 4,
    overflowX: 'hidden',
    width: 'calc(100% - 2em)',
    height: '2em',
    border: 'none',
});

export const boxInput = Object.assign({}, loginInput, {
    width: '100%',
    height: '',
    pointerEvents: '',
    border: 'none',
});

export const resultsBox = Object.assign({}, boxSearch, {
    height: 'calc(100% - 5em)',
    marginTop: '4em',
    overflow: 'scroll',
});

export const boxSimResults = Object.assign({}, boxSearch, {
    height: 'calc(100% - 2em)',
    width: '25%',
});

export const simResultsBox = Object.assign({}, resultsBox, {
    margin: '1em',
    marginTop: '1em',
    left: 'calc(25% + 1em)',
    width: 'calc(75% - 3em)',
    height: 'calc(100% - 2em)',
});

export const textStyle = {
    margin: '1em',
    color: 'rgb(191, 187, 187)',
    fontFamily: 'Courier New',
    fontSize: '14px',
};
