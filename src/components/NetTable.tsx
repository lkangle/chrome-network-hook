import React, { useMemo } from 'react';
import { Button, Space, Table, Tag } from 'antd';
import styled from 'styled-components';
import {
  FileData,
  FileStatus,
  MarkItemFunc,
  ModelControl,
  RemoveItemFunc
} from '@/utils/types';
import ReplaceModel from '@/components/ReplaceModel';

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
    ellipsis: true,
    dataIndex: 'filename'
  },
  {
    key: 'type',
    title: '类型',
    dataIndex: 'type'
  },
  {
    key: 'status',
    title: '状态',
    dataIndex: 'status',
    width: 75,
    render(status) {
      if (status === FileStatus.ORIGIN) {
        return <Tag>默认</Tag>;
      }
      if (status === FileStatus.REPLACE) {
        return <Tag color={'green'}>替换</Tag>;
      }
      if (status === FileStatus.REPLACE_STOP) {
        return <Tag color={'warning'}>停用</Tag>;
      }
      return <Tag color={'red'}>禁止</Tag>;
    }
  }
];

const EmptyControl = { show() {}, hide() {} };

const NetTable: React.FC<Props> = props => {
  const { listHeight, data = [], markItem, removeItem } = props;
  const model = useMemo<ModelControl>(() => EmptyControl, []);

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
              <Button
                disabled={item.status === FileStatus.BLOCK}
                size={'small'}
                onClick={() => model.show(item)}
              >
                替换
              </Button>
              {item.status === FileStatus.BLOCK && (
                <Button
                  type={'primary'}
                  ghost
                  size={'small'}
                  onClick={() => {
                    removeItem(item.initiator, item.url);
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
                    markItem(item.initiator, {
                      ...item,
                      status: FileStatus.BLOCK
                    });
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
      <ReplaceModel
        markItem={markItem}
        removeItem={removeItem}
        control={model}
      />
    </TableWrapper>
  );
};

export default NetTable;
