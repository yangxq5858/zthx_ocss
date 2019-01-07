/* eslint-disable react/prefer-stateless-function,no-undef,react/no-redundant-should-component-update,react/no-unused-state,object-shorthand */
import React, { Component } from 'react';
import { CONTRACT_BASIC, BASIC_IP } from '@/utils/api';
import { loadFile, removeFile } from '@/utils/utils';
import PropTypes from 'prop-types';

class FlowPage extends Component {
  componentDidMount() {
    const { dispatch, history } = this.props;
    dispatch({
      type: 'global/checkAuth',
      payload: history,
      callback: () => {
        //进入EUI审批页面再加载eui相关js、css文件
        loadFile(`${BASIC_IP}/eui/common/jquery-1.8.min.js`, 'js', () => {
          loadFile(`${BASIC_IP}/eui/blue/eui.unmin.js`, 'js', () => {
            loadFile(`${BASIC_IP}/eui/blue/eui_zh-cn.js`, 'js', () => {
              loadFile(`${BASIC_IP}/eui/blue/jqgrid/jquery.jqGrid.min.js`, 'js', () => {
                window._basePath = BASIC_IP;
                this.renderFlowContent();
              });
            });
          });
        });

        loadFile(`${BASIC_IP}/eui/blue/eui.unmin.css`, 'css');
        loadFile(`${BASIC_IP}/eui/common/fonticon/css/ecmp-all-min.css`, 'css');
        loadFile(`${BASIC_IP}/eui/blue/jqgrid/css/jquery-ui.min.css`, 'css');
        loadFile(`${BASIC_IP}/eui/blue/jqgrid/css/ui.jqgrid.min.css`, 'css');
      },
    });
  }

  componentWillUnmount() {
    //组件被卸载时隐藏EUI渲染的流程页面
    document.getElementById('root').style.display = 'block';
    document.getElementById('flowContent').style.display = 'none';

    // 移除相关js、css
    removeFile(`${BASIC_IP}/eui/blue/eui.unmin.css`, 'css');
    removeFile(`${BASIC_IP}/eui/common/fonticon/css/ecmp-all-min.css`, 'css');
    removeFile(`${BASIC_IP}/eui/blue/jqgrid/css/jquery-ui.min.css`, 'css');
    removeFile(`${BASIC_IP}/eui/blue/jqgrid/css/ui.jqgrid.min.css`, 'css');
    removeFile(`${BASIC_IP}/eui/common/jquery-1.8.min.js`, 'js');
    removeFile(`${BASIC_IP}/eui/blue/eui.unmin.js`, 'js');
    removeFile(`${BASIC_IP}/eui/blue/eui_zh-cn.js`, 'js');
    removeFile(`${BASIC_IP}/eui/blue/jqgrid/jquery.jqGrid.min.js`, 'js');
  }

  renderFlowContent = () => {
    //隐藏react页面，显示EUI渲染的流程界面
    document.getElementById('root').style.display = 'none';
    document.getElementById('flowContent').style.display = 'block';
    const { pageUrl, iframeTitle, iframeHeight, rewriteNext } = this.props;
    const flowParams = {
      iframeTitle,
      iframeHeight,
      renderTo: 'flowContent',
      baseUrl: `${CONTRACT_BASIC}/flowRequest`,
      pageUrl,
      goNext: function(param) {
        /*如果重写goNext方法，则需要在子frame中调用eui的doGoNext方法进行下一步：
        const { euiFrame } = window.parent;
        euiFrame.doGoToNext();*/
        window.euiFrame = this;
        this.iframe.postMessage(param, '*');
      },
    };
    if (!rewriteNext) {
      delete flowParams.goNext;
    }
    EUI.FlowApprove(flowParams);
  };

  render() {
    return <div />;
  }
}

FlowPage.defaultProps = {
  pageUrl: '/zt-contract-web',
  iframeTitle: '流程页面',
  iframeHeight: 1000,
  rewriteNext: false,
};

FlowPage.propTypes = {
  pageUrl: PropTypes.string,
  iframeTitle: PropTypes.string,
  iframeHeight: PropTypes.number,
  rewriteNext: PropTypes.bool,
};

export default FlowPage;
