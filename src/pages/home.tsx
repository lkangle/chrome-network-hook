import React, { useMemo, useState } from 'react';
import { Radio, Button, Row, Col, Input, Divider, Space } from 'antd';
import SettingFilled from '@ant-design/icons/es/icons/SettingFilled';
import styled from 'styled-components';
import NetTable from '@/components/NetTable';
import { debounce } from 'lodash-es';
import useDataStore from '@/hooks/useDataStore';
import { TYPE_MAP } from '@/utils/types';

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

  const data = useMemo(() => {
    // 根据查询条件进行数据过滤
    return originData.filter(item => {
      let reserve = true;
      if (search) {
        reserve = item.url.includes(search) && reserve;
      }
      if (type && type !== 'All') {
        reserve = item.type === type && reserve;
      }
      return reserve;
    });
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
            <span>替换数: 0</span>
            <span>阻止请求数: 0</span>
          </Space>
        </Col>
      </Box>
    </DivHome>
  );
};

export default Home;
