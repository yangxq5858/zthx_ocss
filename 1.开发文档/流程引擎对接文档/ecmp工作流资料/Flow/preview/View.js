import React, { PureComponent } from 'react';
import { connect } from 'dva/index';
import FlowPage from '../index';

@connect(({ loading }) => ({
  loading,
}))
class View extends PureComponent {
  render() {
    const { dispatch, history } = this.props;
    return (
      <FlowPage
        dispatch={dispatch}
        history={history}
        iframeTitle="技术协议预审页面"
        pageUrl="/zt-contract-web/#/contract-manager/format_text/previewPage"
      />
    );
  }
}

export default View;
