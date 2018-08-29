import React from 'react'
import ReactDOM from 'react-dom'
import Root from './containers/Root'
import Perf from 'react-addons-perf'
import debug from "debug";
debug.enable("gyaon*");
//TODO: redux-devtools-extensionをつかう

window.Perf = Perf;

ReactDOM.render(
    <Root/>,
    document.getElementById('container')
);
