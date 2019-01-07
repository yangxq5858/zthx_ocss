import React, { Component } from 'react';

class edit extends Component {
  componentDidMount() {
    window.addEventListener('message', event => {
      console.log(event, window.parent);
      // const { euiFrame } = window.parent;
      // euiFrame.doGoToNext();
    });
  }

  render() {
    return <div>dfghjklkjhgdfg</div>;
  }
}

export default edit;
