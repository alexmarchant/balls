import '../css/bundle.css'
import React from 'react'
import ReactDOM from 'react-dom'
import Root from './components/Root'

// Init react app
const el = React.createElement(Root);
ReactDOM.render(el, document.getElementById('root'));

