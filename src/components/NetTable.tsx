import React, { useMemo } from 'react';
import { Button, Space, Table, Tag, Tooltip } from 'antd';
import styled from 'styled-components';
import {
  FileData,
  FileStatus,
  MarkItemFunc,
  RemoveItemFunc
} from '@/utils/types';

const TableWrapper = styled.div`
  width: 100%;
`;

interface Props {
  listHeight: string;
  data: FileData[];
  markItem: MarkItemFunc;
  removeItem: RemoveItemFunc;
}

const baseColumns = [
  {
    key: 'filename',
    title: '名字',
    ellipsis: {
      showTitle: false
    },
    dataIndex: 'filename',
    render(filename, item) {
      return (
        <Tooltip placement={'bottom'} title={item.url}>
          {item.filename}
        </Tooltip>
      );
    }
  },
  {
    key: 'type',
    title: '类型',
    dataIndex: 'type'
  },
  {
    key: 'timestamp',
    title: '时间',
    width: 150,
    dataIndex: 'timestamp',
    render(v, item) {
      const timestamp = item.timestamp + '';
      const dt = new Date(+timestamp);
      const time = dt.toLocaleTimeString();
      const ms = timestamp.split('.')[0].slice(-3);
      return <span>{time + '.' + ms}</span>;
    }
  },
  {
    key: 'status',
    title: '状态',
    dataIndex: 'status',
    width: 90,
    render(status) {
      if (status === FileStatus.ORIGIN) {
        return <Tag>默认</Tag>;
      }
      if (status === FileStatus.REPLACE) {
        return <Tag color={'green'}>替换</Tag>;
      }
      return <Tag color={'red'}>禁止</Tag>;
    }
  }
];

const NetTable: React.FC<Props> = props => {
  const { listHeight, data = [], markItem, removeItem } = props;

  const columns = useMemo(
    () => [
      ...baseColumns,
      {
        key: 'action',
        title: '操作',
        width: 160,
        render(item: FileData) {
          return (
            <Space size={6}>
              <Button size={'small'}>替换</Button>
              {item.status === FileStatus.BLOCK && (
                <Button
                  type={'primary'}
                  ghost
                  size={'small'}
                  onClick={() => {
                    removeItem(item.url, item);
                  }}
                >
                  允许
                </Button>
              )}
              {item.status !== FileStatus.BLOCK && (
                <Button
                  danger
                  size={'small'}
                  onClick={() => {
                    markItem(item.url, null, FileStatus.BLOCK);
                  }}
                >
                  阻止
                </Button>
              )}
            </Space>
          );
        }
      }
    ],
    []
  );

  return (
    <TableWrapper>
      <Table
        rowKey={'timestamp'}
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
