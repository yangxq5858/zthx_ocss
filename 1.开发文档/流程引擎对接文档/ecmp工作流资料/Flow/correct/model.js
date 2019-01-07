import {
  contractFindById,
  findByArchive,
  findByBusinessValue,
  findContractIdByRequestId,
  findElementValueByContractId,
  propertiesAndValues,
} from '@/services/contractDetail';
import { replaceTemplateWord } from '@/services/contractDraft';
import { getCommonBaseData } from '@/services/api';
import { api } from '@/services/storage';
import { findById } from '@/services/templateManage';
import { findByNotice, insertNotice, updateNotice } from '@/services/noticeWarning';
import { updateBatch } from '@/services/contractParties';
import {
  deleteContractArchive,
  findByElementId,
  insertBusinessValue,
  insertContract,
  insertContractArchive,
  selectBusiness,
  updateContract,
  updateElementValues,
} from '@/services/contractCreate';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
import { setElementValue } from '../../ContractManager/models/contractCreate';

const showTypeList = [
  'select',
  'checkbox',
  'radio',
  'checkboxBlob',
  'selectAndInput',
  'singleSelectAndInput',
  'payMethod',
  'contractEffect',
];
const businessShowType = ['select'];

export default {
  namespace: 'correctContract',
  state: {},
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(params => {
        const { pathname, query } = params;
        if (pathname === '/flow/correct') {
          dispatch({ type: 'query', payload: { ...query } });
        } else {
          dispatch({ type: 'destroy' });
        }
      });
    },
  },
  effects: {
    *query({ payload }, { call, put, all, take }) {
      const { id, modify = false } = payload;
      const resId = yield call(findContractIdByRequestId, { requestId: id });
      const contractId = resId.data;
      let { watch } = payload;
      if (contractId) {
        // 查询基础信息结构体
        // 查询合同文本结构体
        // 查询合同基础信息
        const response = yield call(contractFindById, { id: contractId });
        if (response.success && response.data) {
          const { state, contractType, flowState } = response.data;
          if (!watch && state !== 14 && flowState !== 8) {
            message.warning('当前合同不允许编辑！');
            watch = true;
          }
          if (contractType === '3' && !watch) {
            message.warning('当前合同不允许编辑！');
            watch = true;
          }
        } else {
          message.error(`合同基本信息查询失败!${response.message}`);
          return;
        }
        const sortList = [];
        const dataSource = [];
        const receiveSet = [];
        if (response && response.success && response.data) {
          const { templateId = '', classifyId = '', classifyName = '' } = response.data;
          const [contractTemplateData = { data: {} }, elementRes, eleRes] = yield all([
            call(findById, { id: response.data.templateId }),
            call(findByElementId, { templateId }),
            call(findElementValueByContractId, { contractId }),
          ]);
          const elm = {};
          if (eleRes.data && eleRes.data.length) {
            eleRes.data.forEach(item => {
              elm[item.elementCode] = item.elementVal;
            });
          }
          if (elementRes.data) {
            Object.keys(elementRes.data).forEach(fieldKey => {
              const item = elementRes.data[fieldKey];
              item.key = fieldKey;
              item.edsList
                .sort((a, b) => a.sort - b.sort)
                .forEach(eds => {
                  eds.key = eds.id;
                  const { dataSourceUrl, showType, sourceType, params, linkage } = eds;
                  if (showType === 'listofvalues') {
                    eds.mapRelation = linkage ? JSON.parse(linkage) : {};
                  } else if (
                    dataSourceUrl &&
                    sourceType === 'API' &&
                    showTypeList.indexOf(showType) !== -1
                  ) {
                    dataSource.push(
                      call(getCommonBaseData, dataSourceUrl, params ? JSON.parse(params) : {})
                    );
                    receiveSet.push(eds);
                  }
                });
              sortList.push({
                code: fieldKey,
                sort: item.sort,
                element: item,
              });
            });
            if (dataSource.length) {
              const dataSet = yield all(dataSource);
              receiveSet.forEach((item, index) => {
                if (dataSet[index] && dataSet[index].success && dataSet[index].data) {
                  item.customData = JSON.stringify(
                    dataSet[index].data.content.map(uni => ({
                      ...uni,
                      id: uni.value && uni.value !== null ? uni.value.toString() : '',
                      key: uni.value && uni.value !== null ? uni.value.toString() : '',
                    }))
                  );
                } else {
                  item.customData = JSON.stringify([]);
                }
              });
            }
            Object.keys(elementRes.data).forEach(fieldKey => {
              const item = elementRes.data[fieldKey];
              const codeList = item.edsList.map(i => ({
                code: i.elementCode,
                name: `\${${i.elementCode}}`,
              }));
              item.edsList.forEach(eds => {
                const { customData, showType } = eds;
                if (showTypeList.indexOf(showType) !== -1) {
                  const valueList = customData && customData !== '' ? JSON.parse(customData) : [];
                  if (
                    [
                      'selectAndInput',
                      'singleSelectAndInput',
                      'contractEffect',
                      'payMethod',
                    ].includes(showType)
                  ) {
                    // 解析values
                    valueList.forEach(va => {
                      const matches = va.name.match(/(\${)([^}]*)}/g);
                      const set = new Set(matches);
                      const flag =
                        (set.has(`\${amountTax}`) && set.has(`\${amountTaxC}`)) ||
                        (set.has(`\${amount}`) && set.has(`\${amountC}`));
                      set.forEach(s => {
                        if (codeList.find(t => t.name === s)) {
                          if (!va.inputs) {
                            va.inputs = [];
                          }
                          const edsItem = item.edsList.find(e => `\${${e.elementCode}}` === s);
                          edsItem.hidden = true;
                          if (
                            flag &&
                            (edsItem.elementCode === 'amountC' ||
                              edsItem.elementCode === 'amountTaxC')
                          ) {
                            edsItem.readOnly = true;
                          }
                          va.inputs.push({ ...edsItem });
                        }
                      });
                    });
                  }
                  eds.values = valueList;
                }
              });
            });
          }
          yield all([
            put({
              type: 'getInfoStructure',
              payload: { tId: templateId, elm, contractId },
            }),
            put({
              type: 'updateState',
              payload: {
                requestId: id,
                editable: !watch,
                modify,
                sortList,
                classifyId,
                contractId,
                templateId,
                classifyName,
                fields: elementRes.data,
                contractInfo: { ...response.data, elm },
                template: contractTemplateData.data === null ? {} : contractTemplateData.data,
              },
            }),
          ]);
          yield take('getOtherInfo');
          yield put({ type: 'setInitValues' });
        }
      } else {
        yield put(routerRedux.goBack());
      }
    },
    *getInfoStructure({ payload }, { call, put, all }) {
      const { tId, contractId, elm, paymentStrategyType = {}, fundsFlowType = {} } = payload;
      // 有值时不需要再次查询结构体
      const response = yield call(selectBusiness, { templateId: tId });
      if (response.success) {
        const {
          business: { elementDefine = {} },
        } = response.data;
        const businessTableList = response.data.businessTable || {};
        const dataSource = [];
        const sortList = [];
        const receiveSet = [];
        Object.keys(elementDefine).forEach(fieldKey => {
          const item = elementDefine[fieldKey];
          item.key = fieldKey;
          item.edsList.forEach(eds => {
            eds.key = eds.id;
            const { dataSourceUrl, showType, sourceType, params, linkage } = eds;
            if (showType === 'listofvalues') {
              eds.mapRelation = linkage ? JSON.parse(linkage) : {};
            } else if (
              dataSourceUrl &&
              sourceType === 'API' &&
              showTypeList.indexOf(showType) !== -1
            ) {
              dataSource.push(
                call(getCommonBaseData, dataSourceUrl, params ? JSON.parse(params) : {})
              );
              receiveSet.push(eds);
            }
          });
          sortList.push({
            code: fieldKey,
            sort: item.sort,
            element: item,
          });
        });
        Object.values(businessTableList).forEach(item => {
          const { arrayList = [] } = item;
          arrayList.forEach(a => {
            const { mapRelation, objType, params, dataSourceUrl, sourceType } = a;
            if (objType === 'listofvalues') {
              a.mapRelation = mapRelation ? JSON.parse(mapRelation) : {};
            } else if (sourceType === 'API' && businessShowType.indexOf(objType) !== -1) {
              dataSource.push(
                call(getCommonBaseData, dataSourceUrl, params ? JSON.parse(params) : {})
              );
              receiveSet.push(a);
            }
          });
        });
        if (dataSource.length) {
          const dataSet = yield all(dataSource);
          receiveSet.forEach((item, index) => {
            if (
              dataSet[index] &&
              dataSet[index].success &&
              dataSet[index].data &&
              dataSet[index].data.content
            ) {
              item.customData = JSON.stringify(
                dataSet[index].data.content.map(uni => ({
                  ...uni,
                  id: uni.value && uni.value !== null ? uni.value.toString() : uni.id,
                  key: uni.value && uni.value !== null ? uni.value.toString() : uni.id,
                }))
              );
            } else {
              item.customData = JSON.stringify([]);
            }
          });
        }
        Object.keys(elementDefine).forEach(fieldKey => {
          const item = elementDefine[fieldKey];
          const codeList = item.edsList.map(i => ({
            code: i.elementCode,
            name: `\${${i.elementCode}}`,
          }));
          item.edsList.forEach(eds => {
            const { customData, showType } = eds;
            if (showTypeList.indexOf(showType) !== -1) {
              const valueList = customData && customData !== '' ? JSON.parse(customData) : [];
              if (
                ['selectAndInput', 'singleSelectAndInput', 'contractEffect', 'payMethod'].includes(
                  showType
                )
              ) {
                // 解析values
                valueList.forEach(va => {
                  const matches = va.name.match(/(\${)([^}]*)}/g);
                  const set = new Set(matches);
                  const flag =
                    (set.has(`\${amountTax}`) && set.has(`\${amountTaxC}`)) ||
                    (set.has(`\${amount}`) && set.has(`\${amountC}`));
                  set.forEach(s => {
                    if (codeList.find(t => t.name === s)) {
                      if (!va.inputs) {
                        va.inputs = [];
                      }
                      const edsItem = item.edsList.find(e => `\${${e.elementCode}}` === s);
                      edsItem.hidden = true;
                      if (
                        flag &&
                        (edsItem.elementCode === 'amountC' || edsItem.elementCode === 'amountTaxC')
                      ) {
                        edsItem.readOnly = true;
                      }
                      va.inputs.push({ ...edsItem });
                    }
                  });
                });
              }
              eds.values = valueList;
            }
          });
        });
        Object.values(businessTableList).forEach(item => {
          const { arrayList = [] } = item;
          arrayList.forEach(a => {
            const { customData } = a;
            a.values = customData && customData !== '' ? JSON.parse(customData) : [];
          });
        });
        yield all([
          put({
            type: 'updateState',
            payload: {
              infoFields: { ...elementDefine },
              infoSortList: [...sortList],
              businessTable: { ...businessTableList },
            },
          }),
          put({
            type: 'getOtherInfo',
            payload: {
              contractId,
              elm,
              businessTable: businessTableList,
              paymentStrategyType,
              fundsFlowType,
            },
          }),
        ]);
      }
    },
    *getOtherInfo({ payload = {} }, { call, put, all }) {
      // 查询其他内容
      const { contractId, elm, businessTable = {} } = payload;
      const reqList = [];
      const businessKeys = Object.keys(businessTable);
      businessKeys.forEach(key =>
        reqList.push(
          call(findByBusinessValue, {
            contractId,
            businessId: key,
          })
        )
      );
      const response = yield all(reqList);
      const businessTableData = {};
      response.forEach((item, index) => {
        if (item.success && item.data) {
          const {
            data: { content = {} },
          } = item;
          content.forEach(con => {
            if (!businessTableData[businessKeys[index]]) {
              businessTableData[businessKeys[index]] = {};
            }
            if (!businessTableData[businessKeys[index]][con.objNumber]) {
              businessTableData[businessKeys[index]][con.objNumber] = {
                key: con.objNumber,
                id: con.objNumber,
              };
            }
            businessTableData[businessKeys[index]][con.objNumber][con.objElement] = con.objValue;
          });
        }
      });
      const contractFileList = [];
      const fileRes = yield call(findByArchive, { relationId: contractId, relationType: 2 });
      if (fileRes.success && fileRes.data) {
        fileRes.data.forEach(item =>
          contractFileList.push({
            id: item.id,
            uid: item.id,
            key: item.id,
            relationId: item.id,
            status: 'done',
            response: { success: true, url: item.url },
            url:
              item.document && item.document.info && item.document.info.id
                ? `${api.downloadDocumentAPI}?id=${item.document.info.id}`
                : '',
            name: item.document && item.document !== null ? item.document.info.fileName : '',
          })
        );
      }
      yield put({
        type: 'updateState',
        payload: {
          contractContext: { ele: { ...elm }, businessTable: businessTableData },
          contractFileList,
        },
      });
    },
    *saveContractBaseInfo({ payload, callback, partyPayload = {} }, { call, put, all, select }) {
      const [data, { contractInfo }] = yield all([
        call(insertContract, payload),
        select(_ => _.correctContract),
      ]);
      if (data.success) {
        const { elm = {} } = contractInfo;
        message.success('合同创建成功');
        const {
          data: { contractCode, contractId },
        } = data;
        const partyParams = [];
        Object.values(partyPayload).forEach(p => {
          p.contractId = contractId;
          partyParams.push(p);
        });
        yield all([
          put({
            type: 'updateState',
            payload: {
              contractId,
              contractCode,
              contractInfo: {
                ...payload,
                id: contractId,
                code: contractCode,
                elm: { ...elm, ...payload.elm },
              },
            },
          }),
          call(updateBatch, partyParams),
        ]);
        if (callback) {
          callback();
        }
        yield put({ type: 'setInitValues' });
      } else {
        message.error(`合同创建失败${data.message}`);
      }
    },
    *updateContractBaseInfo(
      { contractInfo, elm, callback, contractId, partyPayload = {} },
      { call, put, all, select }
    ) {
      const [cRes, { contractInfo: contractBaseInfo }] = yield all([
        call(updateContract, contractInfo),
        select(_ => _.correctContract),
      ]);
      if (cRes.success) {
        const { elm: elementValues } = contractBaseInfo;
        message.success('合同更新成功');
        const partyParams = [];
        Object.values(partyPayload).forEach(p => {
          p.contractId = contractId;
          partyParams.push(p);
        });
        yield all([
          put({
            type: 'updateState',
            payload: {
              contractInfo: { ...contractInfo, elm: { ...elementValues, ...elm } },
            },
          }),
          call(updateElementValues, { contractId, map: { ...elm } }),
          call(updateBatch, partyParams),
        ]);
        if (callback) {
          callback();
        }
        yield put({ type: 'setInitValues' });
      } else {
        message.error(`合同更新失败！${cRes.message}`);
      }
    },
    *saveContractBusinessInfo({ payload, callback, contractContext = {} }, { call, select, put }) {
      const { contractId, contractInfo } = yield select(_ => _.correctContract);
      const { contractBaseUpdateData = {}, ...tablePayload } = payload;
      if (contractId) {
        tablePayload.contractId = contractId;
        const data = yield call(insertBusinessValue, tablePayload);
        if (Object.keys(contractBaseUpdateData).length) {
          yield call(updateContract, { ...contractInfo, ...contractBaseUpdateData, contractId });
        }
        if (data.success) {
          message.success('合同文本保存成功！');
          const { ele = {} } = tablePayload;
          const { elm = {} } = contractInfo;
          const { businessTable } = contractContext;
          if (data.data && Object.keys(data.data).length) {
            Object.values(businessTable).forEach(businessData => {
              Object.keys(businessData).forEach(key => {
                if (data.data[key]) {
                  businessData[data.data[key]] = {
                    ...businessData[key],
                    key: data.data[key],
                    id: data.data[key],
                  };
                  delete businessData[key];
                }
              });
            });
          }
          yield put({
            type: 'updateState',
            payload: {
              contractContext: { ...contractContext },
              contractInfo: { ...contractInfo, ...contractBaseUpdateData, elm: { ...elm, ...ele } },
            },
          });
          if (callback) {
            callback();
          }
          yield put({ type: 'setInitValues' });
        } else {
          message.error(`保存失败！${data.message}`);
        }
      } else {
        message.error('合同基本信息未保存成功');
      }
    },
    *saveContractArchive({ payload, callback }, { call }) {
      const response = yield call(insertContractArchive, payload);
      if (response.success && callback) {
        const { data = {} } = response;
        callback(data);
      }
    },
    *deleteArchive({ payload, callback }, { call }) {
      const response = yield call(deleteContractArchive, payload);
      if (!response.success) {
        message.error(`删除失败，请刷新界面${response.message}`);
      } else if (callback) {
        callback();
      }
    },
    *getNoticeData({ payload, callback }, { call }) {
      const response = yield call(findByNotice, payload);
      if (response.success) {
        const { content = [] } = response.data;
        const item = content.length ? content[0] : {};
        if (callback) {
          callback(item);
        }
      } else {
        message.error(`查询失败！${response.message}`);
      }
    },
    *saveNotice({ payload, callback }, { call }) {
      if (payload.id) {
        const response = yield call(updateNotice, payload);
        if (response.success) {
          message.success('更新预警成功！');
          if (callback) {
            callback();
          }
        } else {
          message.error(`更新预警失败！${response.message}`);
        }
      } else {
        const response = yield call(insertNotice, payload);
        if (response.success) {
          message.success('新增预警成功！');
          if (callback) {
            callback();
          }
        } else {
          message.error(`新增预警失败！${response.message}`);
        }
      }
    },
    *updateContractState({ payload, callback }, { call, put, all, select }) {
      const [response, { requestId }] = yield all([
        call(updateContract, { ...payload }),
        select(_ => _.correctContract),
      ]);
      if (callback) {
        callback(response);
      }
      if (response.success) {
        yield all([
          put({
            type: 'updateState',
            payload: {
              contractInfo: { ...payload },
            },
          }),
          call(propertiesAndValues, {
            businessModelCode: 'com.ecmp.springboot.contract.entity.DraftRequest',
            all: false,
            id: requestId,
          }),
        ]);
      }
    },
    *replaceDoc({ payload, callback }, { call }) {
      const fileResponse = yield call(replaceTemplateWord, payload);
      if (fileResponse.success && fileResponse.data) {
        if (callback) callback(fileResponse);
      } else {
        message.error(`文本替换异常，合同提交审核失败！${fileResponse.message}`);
      }
    },
  },
  reducers: {
    setInitValues(state) {
      let { sortList = [], infoSortList = [] } = state;
      const { contractInfo = {} } = state;
      const { name, elm = {}, ...contractBaseInfo } = contractInfo;
      const showData = { ...contractBaseInfo, ...elm };
      sortList.forEach(sort => {
        const { element = {} } = sort;
        const { type } = element;
        const childrenList = [];
        element.edsList.forEach(item => {
          setElementValue(item, showData, name);
          if (item.showType === 'parties') {
            const { linkage } = item;
            const children = linkage && linkage !== '' ? JSON.parse(linkage) : [];
            if (item.elementList && item.elementList.length) {
              item.elementList.forEach(e => setElementValue(e, showData));
            } else {
              item.elementList = [];
              children.forEach(i => {
                const ele = element.edsList.find(e => i.id === e.id);
                if (ele) {
                  item.elementList.push(ele);
                }
              });
              childrenList.push(...children.map(i => i.id));
            }
          }
        });
        element.edsList = element.edsList.filter(e => !childrenList.includes(e.id));
        if (
          type === 'base' &&
          !sortList.find(item => !!item.element.edsList.find(i => i.additional))
        ) {
          element.edsList = [
            {
              key: 'name',
              id: 'name',
              dataType: 'string',
              elementCode: 'name',
              elementName: '合同名称',
              enable: true,
              linkage: [],
              required: true,
              showType: 'string',
              showValue: name,
              additional: true,
            },
          ].concat(element.edsList);
        }
      });
      if (!sortList.find(sort => sort.element.type === 'base')) {
        sortList = [
          {
            sort: -1,
            code: 'keysList',
            element: {
              type: 'base',
              additional: true,
              name: '合同基本信息',
              sort: 0,
              edsList: [
                {
                  key: 'name',
                  id: 'name',
                  dataType: 'string',
                  elementCode: 'name',
                  elementName: '合同名称',
                  enable: true,
                  linkage: [],
                  required: true,
                  showType: 'string',
                  showValue: name,
                  additional: true,
                },
              ],
            },
          },
        ].concat(sortList);
      }
      infoSortList.forEach(sort => {
        const { element = {} } = sort;
        const childrenList = [];
        element.edsList.forEach(item => {
          setElementValue(item, showData);
          if (item.showType === 'parties') {
            const { linkage } = item;
            const children = linkage && linkage !== '' ? JSON.parse(linkage) : [];
            if (item.elementList && item.elementList.length) {
              item.elementList.forEach(e => setElementValue(e, showData));
            } else {
              item.elementList = [];
              children.forEach(i => {
                const ele = element.edsList.find(e => i.id === e.id);
                if (ele) {
                  item.elementList.push(ele);
                }
              });
              childrenList.push(...children.map(i => i.id));
            }
          }
        });
        element.edsList = element.edsList.filter(e => !childrenList.includes(e.id));
      });
      sortList = sortList.sort((a, b) => a.sort - b.sort);
      infoSortList = infoSortList.sort((a, b) => a.sort - b.sort);
      return {
        ...state,
        infoSortList,
        sortList,
        changeCode: undefined,
      };
    },
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    destroy() {
      return {
        fields: {},
      };
    },
  },
};
