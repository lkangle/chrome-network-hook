import React from 'react';
import { Button, Table, Space } from 'antd';
import styled from 'styled-components';

const columns = [
  {
    title: '名字',
    ellipsis: true,
    dataIndex: 'url'
  },
  {
    title: '类型',
    dataIndex: 'type'
  },
  {
    title: '时间',
    ellipsis: true,
    dataIndex: 'timestamp'
  },
  {
    title: '状态',
    dataIndex: 'status',
    render(text) {
      console.log(text);
      return <span>{text}</span>;
    }
  },
  {
    title: '操作',
    width: 160,
    render(record: any) {
      return (
        <Space size={6}>
          <Button size={'small'}>替换</Button>
          <Button danger size={'small'}>
            阻止
          </Button>
          {/*<Button type={'primary'} ghost size={'small'}>*/}
          {/*  允许*/}
          {/*</Button>*/}
        </Space>
      );
    }
  }
];

const TableWrapper = styled.div`
  width: 100%;
`;

interface ReqData {
  key: string;
  url: string;
  type: string;
  timestamp: number;
  requestBody: any;
}

interface Props {
  listHeight: string;
  data: ReqData[];
}

const NetTable: React.FC<Props> = props => {
  const { listHeight, data = [] } = props;

  return (
    <TableWrapper>
      <Table
        columns={columns}
        dataSource={data}
        size={'small'}
        pagination={false}
        scroll={{ y: listHeight }}
      />
    </TableWrapper>
  );
};

export default NetTable;
