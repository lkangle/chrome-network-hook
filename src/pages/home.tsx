import React, { useMemo, useState } from 'react';
import { Button, Col, Divider, Input, Radio, Row, Space } from 'antd';
import SettingFilled from '@ant-design/icons/es/icons/SettingFilled';
import styled from 'styled-components';
import NetTable from '@/components/NetTable';
import { debounce } from 'lodash-es';
import useDataStore from '@/hooks/useDataStore';
import { FileStatus, TYPE_MAP } from '@/utils/types';

const DivHome = styled.div`
  min-width: 470px;

  .tools-bar {
    padding: 10px 5px 0;
    width: 100%;
  }
`;

const Box = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 55px);
`;

const typeOptions = ['All', ...Object.values(TYPE_MAP)].map(v => ({
  label: v,
  value: v
}));

const Home: React.FC = () => {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [originData, markItem, removeItem] = useDataStore();

  const [data, replaceCount, blockCount] = useMemo(() => {
    // 根据查询条件进行数据过滤
    // 过滤的同时做统计，减少计算量
    let replaceCount = 0;
    let blockCount = 0;
    const targetData = originData.filter(item => {
      let reserve = true;
      if (search) {
        reserve = item.url.includes(search) && reserve;
      }
      if (type && type !== 'All') {
        reserve = item.type === type && reserve;
      }
      if (reserve) {
        if (item.status === FileStatus.REPLACE) {
          replaceCount++;
        } else if (item.status === FileStatus.BLOCK) {
          blockCount++;
        }
      }
      return reserve;
    });
    return [targetData, replaceCount, blockCount];
  }, [search, type, originData]);

  const onSearchChange = debounce(e => setSearch(e.target.value), 500);

  return (
    <DivHome>
      <Row className="tools-bar" justify={'space-between'}>
        <Col style={{ paddingLeft: 10 }}>
          <Space>
            <Input
              onInput={onSearchChange}
              style={{ maxWidth: 160 }}
              size="small"
              type={'search'}
              placeholder={'filter filename'}
            />
            <Radio.Group
              size="small"
              options={typeOptions}
              onChange={e => setType(e.target.value)}
              value={type}
              optionType="button"
              buttonStyle="solid"
            />
          </Space>
        </Col>
        <Col style={{ paddingRight: 5, textAlign: 'right' }}>
          <Button size="small" shape="circle" icon={<SettingFilled />} />
        </Col>
      </Row>
      <Divider style={{ margin: '10px 0' }} />

      <Box>
        <Col flex={2}>
          <NetTable
            listHeight={'calc(100vh - 130px)'}
            data={data}
            markItem={markItem}
            removeItem={removeItem}
          />
        </Col>
        <Col style={{ padding: 6 }}>
          <Space size={6} align={'center'}>
            <span>请求数: {data.length}</span>
            <span>替换数: {replaceCount}</span>
            <span>阻止请求数: {blockCount}</span>
          </Space>
        </Col>
      </Box>
    </DivHome>
  );
};

export default Home;
