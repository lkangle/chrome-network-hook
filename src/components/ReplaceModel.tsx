import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FileData,
  FileStatus,
  MarkItemFunc,
  ModelControl,
  RemoveItemFunc,
  SERVICE_URL
} from '@/utils/types';
import { Button, Input, Modal, Radio, Upload } from 'antd';
import styled from 'styled-components';
import { InboxOutlined } from '@ant-design/icons';
import { debounce } from 'lodash-es';
import { getStorage } from '@/utils';

const MyModel = styled(Modal)`
  .ant-modal-body {
    padding: 15px 24px;
  }
`;

const TabBody = styled.div`
  padding-top: 15px;
`;

const InfoBox = styled.div`
  margin-bottom: 15px;
  &:not(:first-child) {
    margin-top: -3px;
  }

  .title {
    font-weight: 500;
  }

  .one-line {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #555555;
  }
`;

const TipText = styled.span`
  display: inline-block;
  font-size: 12px;
  line-height: 20px;
  color: #b0b0b0;
`;

interface Props {
  removeItem: RemoveItemFunc;
  markItem: MarkItemFunc;
  control: ModelControl;
}

const DraggerUpload: React.FC<{ onResponse: (v) => void }> = props => {
  const { onResponse } = props;
  const actionUrl = useMemo<string>(() => {
    return getStorage(SERVICE_URL) || 'http://118.31.60.82:17002/upload';
  }, []);

  const uploadOnChange = e => {
    const file = e?.file;
    if (file?.status === 'done' && file?.response) {
      onResponse(file.response.url);
    }
  };

  // 直接清空，一次只允许上传一个文件
  const onRemove = () => {
    return true;
  };

  return (
    <Upload.Dragger
      multiple={false}
      action={actionUrl}
      onChange={uploadOnChange}
      onRemove={onRemove}
    >
      <InboxOutlined style={{ color: '#40a9ff', fontSize: 54 }} />
      <h3 style={{ marginTop: 6 }}>点击或拖拽文件到这里上传.</h3>
    </Upload.Dragger>
  );
};

// url地址输入框
const UrlInput: React.FC<{ onChange: (v) => void }> = props => {
  const { onChange } = props;
  // 防抖的一个change方法
  const dbOnChange = useCallback(
    debounce(onChange, 100, { leading: true }),
    []
  );

  const inputOnChange = e => {
    let val = e.target.value;
    if (val.startsWith('/')) val = val.slice(1);
    // 自动补充文件协议
    if (!/^(http:|https:|file:)\/\//.test(val)) {
      val = 'file://' + val;
    }
    dbOnChange(val);
  };

  return (
    <div>
      <Input
        onChange={inputOnChange}
        placeholder={'输入地址，如https://a.cn/f.js | /local/f.js'}
        allowClear={true}
      />
      <TipText style={{ marginTop: 3 }}>支持本地文件和http网络地址</TipText>
    </div>
  );
};

const ReplaceModel: React.FC<Props> = props => {
  const { removeItem, markItem, control } = props;
  // 控制model的显示隐藏
  const [visible, setVisible] = useState(false);

  // 当前操作的文件数据项
  const [item, setItem] = useState<FileData>(null);

  // 当前文件状态
  const [status, setStatus] = useState<FileStatus>();

  // 替换地址方式 up 上传文件，url 直接输入url
  const [mode, setMode] = useState<string>('up');

  // 新的重定向地址
  const [redirectUrl, setRedirectUrl] = useState<string>();

  // 还原初始数据
  useEffect(() => {
    if (!visible) {
      setMode('up');
      setItem(null);
      setRedirectUrl(null);
    }
  }, [visible]);

  const onCancel = () => setVisible(false);
  const onResume = () => {
    removeItem(item.url, item);
    onCancel();
  };
  const onSaveResult = () => {
    // TODO 最好能做一下url的校验咯
    if (redirectUrl) {
      markItem({
        ...item,
        status: FileStatus.REPLACE,
        redirectUrl
      });
    }
    setVisible(false);
  };

  useEffect(() => {
    Object.assign(control, {
      show: (item: FileData) => {
        setVisible(true);
        if (item) {
          setItem(item);
          setStatus(item.status);
        }
      },
      hide: onCancel
    });
  }, []);

  function getFooter() {
    return (
      <div>
        <Button onClick={onCancel}>取消</Button>
        {status === FileStatus.REPLACE && (
          <Button danger type={'dashed'} onClick={onResume}>
            恢复
          </Button>
        )}
        <Button onClick={onSaveResult} type={'primary'}>
          保存
        </Button>
      </div>
    );
  }

  return (
    <MyModel
      closable={false}
      title={'文件替换'}
      visible={visible}
      destroyOnClose={true}
      footer={getFooter()}
    >
      {item && (
        <>
          <InfoBox>
            <div className={'title'}>当前文件</div>
            <div className={'one-line'} title={item.url}>
              {item.filename}
            </div>
          </InfoBox>
          {status === FileStatus.REPLACE && (
            <InfoBox>
              <div className={'title'}>
                <span>映射文件</span>
                <Button
                  onClick={() => setStatus(FileStatus.ORIGIN)}
                  size={'small'}
                  type={'link'}
                >
                  替换
                </Button>
              </div>
              <div className={'one-line'} title={item.url}>
                {item.redirectUrl}
              </div>
            </InfoBox>
          )}
          {status === FileStatus.ORIGIN && (
            <>
              <Radio.Group onChange={v => setMode(v.target.value)} value={mode}>
                <Radio value={'up'}>本地上传</Radio>
                <Radio value={'url'}>网络地址</Radio>
              </Radio.Group>
              <TabBody>
                {mode === 'up' && <DraggerUpload onResponse={setRedirectUrl} />}
                {mode === 'url' && <UrlInput onChange={setRedirectUrl} />}
              </TabBody>
            </>
          )}
        </>
      )}
    </MyModel>
  );
};

export default ReplaceModel;
