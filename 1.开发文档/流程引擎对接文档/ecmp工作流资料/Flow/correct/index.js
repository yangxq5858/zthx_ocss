import React from 'react';
import { connect } from 'dva';
import { Card, message } from 'antd';
import PageLoading from '@/components/PageLoading';
import CreateSteps from '../../ContractManager/component/CreateSteps';
import Step1 from '../../ContractManager/component/Step1';
import Step2 from '../../ContractManager/component/Step2';
import Step3 from '../../ContractManager/component/Step3';

@connect(({ correctContract, loading, dispatch }) => ({
  correctContract,
  loading,
  dispatch,
}))
class ContractDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 0,
      submitted: false,
      isMounted: false,
    };
    this.stepRefs = {};
  }

  componentDidMount() {
    // eslint-disable-next-line no-unused-vars
    window.addEventListener('message', event => {
      const { euiFrame } = window.parent;
      const {
        dispatch,
        correctContract: { contractInfo = {} },
      } = this.props;
      const { state, flowStatus } = contractInfo;

      this.setState({ isMounted: true }, () => {
        const { submitted, isMounted } = this.state;

        if (state === 14 && flowStatus === 8 && !submitted && isMounted) {
          this.setState({ submitted: true }, () => {
            // 起草中被拒绝
            dispatch({
              type: 'correctContract/updateContractState',
              callback: res => {
                this.setState({
                  submitted: false,
                });
                if (res.success) {
                  dispatch({
                    type: 'correctContract/replaceDoc',
                    payload: { contractId: contractInfo.id },
                    callback: () => {
                      euiFrame.doGoToNext();
                    },
                  });
                } else {
                  message.error('提交失败，请联系管理员');
                }
              },
              payload: {
                ...contractInfo,
              },
            });
          });
        } else {
          message.error('提交失败，请联系管理员');
        }
      });
    });
  }

  componentWillUnmount() {
    this.setState({ isMounted: false });
  }

  nextStep = () => {
    // 点击下一步时需要判断是否需要查询已有数据
    const { current } = this.state;
    this.setState({ current: current + 1 });
  };

  prevStep = () => {
    const { current } = this.state;
    this.setState({ current: current - 1 });
  };

  complete = () => {
    const {
      dispatch,
      correctContract: { contractInfo = {} },
    } = this.props;
    const { state, flowStatus } = contractInfo;
    if (state === 14 && flowStatus === 8) {
      // 起草中被拒绝
      dispatch({
        type: 'correctContract/updateContractState',
        payload: {
          ...contractInfo,
          state: 2,
        },
      });
    }
  };

  render() {
    const { current, submitted } = this.state;
    const { correctContract, dispatch, loading } = this.props;
    const {
      editable,
      templateId,
      fields = {},
      sortList = [],
      contractId,
      contractInfo = {},
      infoFields = {},
      infoSortList = [],
      businessTable = {},
      contractContext = {},
      contractFileList = [],
      changeCode,
    } = correctContract;
    const steps = [
      {
        code: 'base',
        title: '基础信息',
        content: (
          <Step1
            loading={loading}
            wrappedComponentRef={ref => {
              this.stepRefs[0] = ref;
            }}
            changeCode={changeCode}
            editable={editable}
            modelName="correctContract"
            contractId={contractId}
            contractInfo={contractInfo}
            templateId={templateId}
            sortList={sortList}
            dispatch={dispatch}
            fields={fields}
            current={0}
            stepLength={3}
            prevStep={this.prevStep}
            nextStep={this.nextStep}
          />
        ),
      },
      {
        code: 'text',
        title: '合同文本',
        content: (
          <Step2
            wrappedComponentRef={ref => {
              this.stepRefs[1] = ref;
            }}
            loading={loading}
            editable={editable}
            modelName="correctContract"
            eleData={contractContext.ele || {}}
            contractInfo={contractInfo}
            businessTableData={contractContext.businessTable || {}}
            contractId={contractId}
            infoFields={infoFields}
            infoSortList={infoSortList}
            businessTable={businessTable}
            dispatch={dispatch}
            current={1}
            stepLength={3}
            prevStep={this.prevStep}
            nextStep={this.nextStep}
          />
        ),
      },
      {
        code: 'copy',
        title: '参考附件',
        content: (
          <Step3
            wrappedComponentRef={ref => {
              this.stepRefs[2] = ref;
            }}
            editable={editable}
            modelName="correctContract"
            contractId={contractId}
            contractInfo={contractInfo}
            contractFileList={contractFileList}
            dispatch={dispatch}
            current={2}
            stepLength={3}
            prevStep={this.prevStep}
            nextStep={this.nextStep}
            complete={false}
          />
        ),
      },
    ];

    return (
      <Card>
        {submitted && loading.models.correctContract ? (
          <PageLoading />
        ) : (
          <CreateSteps current={current} steps={steps} />
        )}
      </Card>
    );
  }
}

export default ContractDetail;
