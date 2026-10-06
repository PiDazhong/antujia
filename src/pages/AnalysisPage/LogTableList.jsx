import { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, message, Popconfirm, Space, Pagination } from 'antd';
import {
  LockOutlined,
  UnlockOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '../../config/uploadModules';
import Abbr from '../../components/Abbr';

const LogTableList = ({ dataList = [], onRefresh }) => {
  const [blackIps, setBlackIps] = useState([]);
  const [loadingIp, setLoadingIp] = useState(null);
  const [deletingTimestamp, setDeletingTimestamp] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sortedData = useMemo(() => {
    return [...dataList].sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
  }, [dataList]);

  // 查询 black_ips 码表
  useEffect(() => {
    fetch(`${API_BASE_URL}/antujia-server/codeTable/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codes: ['black_ips'] }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.code === 1 && Array.isArray(data.data)) {
          const item = data.data.find((d) => d.code === 'black_ips');
          if (item && item.value) {
            try {
              const parsed = JSON.parse(item.value);
              setBlackIps(Array.isArray(parsed) ? parsed : []);
            } catch {
              setBlackIps([]);
            }
          } else {
            setBlackIps([]);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleBanIp = useCallback(
    async (ip) => {
      if (blackIps.includes(ip)) return;

      setLoadingIp(ip);
      const newBlackIps = [...blackIps, ip];
      try {
        const res = await fetch(`${API_BASE_URL}/antujia-server/codeTable/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [
              {
                code: 'black_ips',
                value: JSON.stringify(newBlackIps),
                sort: 99,
              },
            ],
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success || data.code !== 1) {
          throw new Error(data.message || '保存失败');
        }
        message.success('禁用成功');
        setBlackIps(newBlackIps);
      } catch (err) {
        message.error(`禁用失败: ${err.message}`);
      } finally {
        setLoadingIp(null);
      }
    },
    [blackIps]
  );

  const handleUnbanIp = useCallback(
    async (ip) => {
      if (!blackIps.includes(ip)) return;

      setLoadingIp(ip);
      const newBlackIps = blackIps.filter((b) => b !== ip);
      try {
        const res = await fetch(`${API_BASE_URL}/antujia-server/codeTable/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [
              {
                code: 'black_ips',
                value: JSON.stringify(newBlackIps),
                sort: 99,
              },
            ],
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success || data.code !== 1) {
          throw new Error(data.message || '保存失败');
        }
        message.success('解禁成功');
        setBlackIps(newBlackIps);
      } catch (err) {
        message.error(`解禁失败: ${err.message}`);
      } finally {
        setLoadingIp(null);
      }
    },
    [blackIps]
  );

  const handleDelete = useCallback(
    async (timestamp) => {
      setDeletingTimestamp(timestamp);
      try {
        const res = await fetch(`${API_BASE_URL}/antujia-server/log/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timestamp }),
        });
        const data = await res.json();
        if (!res.ok || !data.success || data.code !== 1) {
          throw new Error(data.message || '删除失败');
        }
        message.success('删除成功');
        onRefresh && onRefresh();
      } catch (err) {
        message.error(`删除失败: ${err.message}`);
      } finally {
        setDeletingTimestamp(null);
      }
    },
    [onRefresh]
  );

  const handleExport = () => {
    if (!dataList || dataList.length === 0) {
      message.warning('暂无数据可导出');
      return;
    }
    const exportData = dataList.map((item) => ({
      action: item.action,
      timestamp: item.timestamp,
      device: item.device,
      ip: item.ip,
      name: item.name,
      company: item.company,
      phone: item.phone,
      email: item.email,
      message: item.message,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '用户点击量详情');
    XLSX.writeFile(wb, `用户点击量详情_${dayjs().format('YYYY-MM-DD')}.xlsx`);
  };

  const pageData = sortedData.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', fixed: isMobile ? false : 'left', width: 100 },
    { title: 'Company', dataIndex: 'company', key: 'company', fixed: isMobile ? false : 'left', width: 140 },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', fixed: isMobile ? false : 'left', width: 130 },
    { title: 'IP', dataIndex: 'ip', key: 'ip', width: 120 },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 180 },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      width: 280,
      render: (msg) => <Abbr text={msg} />
    },
    {
      title: 'Device',
      dataIndex: 'device',
      key: 'device',
      width: 140,
      render: (device) => <Abbr text={device} />,
    },
    { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp', fixed: isMobile ? false : 'right', width: 160 },
    {
      title: '操作',
      key: 'operation',
      fixed: isMobile ? false : 'right',
      width: 160,
      render: (_, record) => {
        const isBanned = blackIps.includes(record.ip);
        return (
          <Space size={4}>
            {isBanned ? (
              <Button
                type="link"
                size="small"
                icon={<UnlockOutlined />}
                loading={loadingIp === record.ip}
                onClick={() => handleUnbanIp(record.ip)}
              >
                解禁
              </Button>
            ) : (
              <Button
                type="link"
                size="small"
                icon={<LockOutlined />}
                loading={loadingIp === record.ip}
                onClick={() => handleBanIp(record.ip)}
              >
                禁用
              </Button>
            )}
            <Popconfirm
              title="确认删除"
              description="确定要删除这条记录吗？"
              onConfirm={() => handleDelete(record.timestamp)}
              okText="删除"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
                icon={<DeleteOutlined />}
                loading={deletingTimestamp === record.timestamp}
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="log-table-list">
      <div className="table-header">
        <div className="table-title">用户点击量详情</div>
        <Button type="link" onClick={handleExport}>
          导出数据
        </Button>
      </div>
      {isMobile ? (
        <>
          <div className="mobile-list">
            {pageData.map((item, index) => (
              <div className="mobile-card" key={`${item.ip || ''}-${item.timestamp || ''}-${index}`}>
                <div className="mobile-row">
                  <span className="mobile-label">Name:</span>
                  <span className="mobile-value">{item.name || '-'}</span>
                </div>
                <div className="mobile-row">
                  <span className="mobile-label">Company:</span>
                  <span className="mobile-value">{item.company || '-'}</span>
                </div>
                <div className="mobile-row">
                  <span className="mobile-label">Phone:</span>
                  <span className="mobile-value">{item.phone || '-'}</span>
                </div>
                <div className="mobile-row">
                  <span className="mobile-label">IP:</span>
                  <span className="mobile-value">{item.ip || '-'}</span>
                </div>
                <div className="mobile-row">
                  <span className="mobile-label">Email:</span>
                  <span className="mobile-value">{item.email || '-'}</span>
                </div>
                <div className="mobile-row">
                  <span className="mobile-label">Message:</span>
                  <span className="mobile-value"><Abbr text={item.message} lines={0} /></span>
                </div>
                <div className="mobile-row">
                  <span className="mobile-label">Device:</span>
                  <span className="mobile-value mobile-value-nowrap"><Abbr text={item.device} /></span>
                </div>
                <div className="mobile-row">
                  <span className="mobile-label">Timestamp:</span>
                  <span className="mobile-value">{item.timestamp || '-'}</span>
                </div>
                <div className="mobile-row mobile-actions">
                  {blackIps.includes(item.ip) ? (
                    <Button
                      type="link"
                      size="small"
                      icon={<UnlockOutlined />}
                      loading={loadingIp === item.ip}
                      onClick={() => handleUnbanIp(item.ip)}
                    >
                      解禁
                    </Button>
                  ) : (
                    <Button
                      type="link"
                      size="small"
                      icon={<LockOutlined />}
                      loading={loadingIp === item.ip}
                      onClick={() => handleBanIp(item.ip)}
                    >
                      禁用
                    </Button>
                  )}
                  <Popconfirm
                    title="确认删除"
                    description="确定要删除这条记录吗？"
                    onConfirm={() => handleDelete(item.timestamp)}
                    okText="删除"
                    cancelText="取消"
                  >
                    <Button
                      type="link"
                      size="small"
                      icon={<DeleteOutlined />}
                      loading={deletingTimestamp === item.timestamp}
                    >
                      删除
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            ))}
            {pageData.length === 0 && (
              <div className="mobile-empty">暂无数据</div>
            )}
          </div>
          <Pagination
            className="mobile-pagination"
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={sortedData.length}
            showSizeChanger
            pageSizeOptions={[10, 20, 50]}
            onChange={(page, pageSize) =>
              setPagination({ current: page, pageSize })
            }
          />
        </>
      ) : (
        <Table
          columns={columns}
          dataSource={sortedData}
          rowKey={(record, index) =>
            `${record.ip || ''}-${record.timestamp || ''}-${index}`
          }
          pagination={{
            ...pagination,
            total: dataList.length,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            onChange: (page, pageSize) =>
              setPagination({ current: page, pageSize }),
          }}
          scroll={{ x: 'max-content' }}
        />
      )}
    </div>
  );
};

export default LogTableList;
