import React, { PureComponent } from 'react';
import { connect } from 'dva/index';
import FlowPage from '../index';

@connect(({ loading }) => ({
  loading,
}))
/* eslint react/prefer-stateless-function:0 */
class View extends PureComponent {
  render() {
    const { dispatch, history } = this.props;
    return (
      <FlowPage
        dispatch={dispatch}
        history={history}
        iframeTitle="合同申请页面"
        pageUrl="/zt-contract-web/#/system/contractDetail"
      />
    );
  }
}

export default View;
