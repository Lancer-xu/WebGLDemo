import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Menu from './Menu';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <Menu />, 
  document.getElementById('root')
);
registerServiceWorker();
