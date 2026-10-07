import { useState, useEffect, useMemo, useCallback } from 'react';
import { Spin, Segmented, DatePicker, message } from 'antd';
import {
  RiseOutlined,
  FallOutlined,
  BarChartOutlined,
  LineChartOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '../../config/uploadModules';
import LogTableList from './LogTableList';
import './index.less';

const { RangePicker } = DatePicker;

const RANGE_DAYS = {
  '1week': 7,
  '1month': 30,
  '3months': 90,
  '6months': 180,
  '1year': 365,
};

const RANGE_LABELS = {
  '1week': '近1周',
  '1month': '近1月',
  '3months': '近3月',
  '6months': '近半年',
  '1year': '近1年',
};

const formatDateStr = (d) => d.format('YYYY-MM-DD');

const fetchLogData = async (startDate, endDate, action) => {
  const res = await fetch(`${API_BASE_URL}/damonshome-server/log/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate, endDate, action }),
  });
  const json = await res.json();
  if (!res.ok || !json.success || json.code !== 1) {
    throw new Error(json.message || '数据加载失败');
  }
  return json.data ?? [];
};

const mergeData = (viewList, submitList, start, end) => {
  const viewMap = {};
  viewList.forEach((item) => {
    const date = item.timestamp?.split(' ')[0];
    if (date) viewMap[date] = (viewMap[date] || 0) + 1;
  });

  const submitMap = {};
  submitList.forEach((item) => {
    const date = item.timestamp?.split(' ')[0];
    if (date) submitMap[date] = (submitMap[date] || 0) + 1;
  });

  const result = [];
  let cur = start.clone();
  const endStr = formatDateStr(end);

  while (formatDateStr(cur) <= endStr) {
    const fullDate = formatDateStr(cur);
    const label = `${cur.month() + 1}/${cur.date()}`;

    result.push({
      date: label,
      visits: viewMap[fullDate] || 0,
      clicks: submitMap[fullDate] || 0,
    });
    cur = cur.add(1, 'day');
  }

  return result;
};

const StatCard = ({ title, total, trend, trendValue, color, data, dataKey, name, onExport }) => {
  const [chartType, setChartType] = useState('line');
  const isUp = trend === 'up';
  const isLine = chartType === 'line';

  const commonAxes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
      <XAxis
        dataKey="date"
        tick={{ fontSize: 11, fill: '#bfbfbf' }}
        axisLine={false}
        tickLine={false}
        interval={data.length > 60 ? Math.floor(data.length / 10) : data.length > 30 ? 6 : 0}
      />
      <YAxis
        tick={{ fontSize: 11, fill: '#bfbfbf' }}
        axisLine={false}
        tickLine={false}
      />
      <Tooltip
        contentStyle={{
          borderRadius: 6,
          border: '1px solid #f0f0f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          fontSize: 12,
        }}
      />
    </>
  );

  return (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-info">
          <div className="stat-label">{title}</div>
          <div className="stat-value" style={{ color }}>
            {total.toLocaleString()}
          </div>
        </div>
        <div className="stat-actions">
          {onExport && (
            <div
              className="stat-export-btn"
              style={{ background: `${color}15`, color }}
              onClick={onExport}
              title="导出数据"
            >
              <ExportOutlined />
            </div>
          )}
          <div
            className="stat-icon"
            style={{ background: `${color}15`, color, cursor: 'pointer' }}
            onClick={() => setChartType((prev) => (prev === 'line' ? 'bar' : 'line'))}
            title={isLine ? '切换为柱状图' : '切换为折线图'}
          >
            {isLine ? <BarChartOutlined /> : <LineChartOutlined />}
          </div>
        </div>
      </div>
      <div className="chart-area">
        <ResponsiveContainer width="100%" height="100%">
          {isLine ? (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              {commonAxes}
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                name={name}
              />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              {commonAxes}
              <Bar
                dataKey={dataKey}
                fill={color}
                radius={[4, 4, 0, 0]}
                name={name}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const AnalysisPage = () => {
  const [data, setData] = useState([]);
  const [rawSubmitList, setRawSubmitList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('1week');
  const [dates, setDates] = useState(() => {
    const end = dayjs();
    const start = end.subtract(RANGE_DAYS['1week'] - 1, 'day');
    return [start, end];
  });

  const loadData = useCallback(async (start, end) => {
    setLoading(true);
    try {
      const startDate = formatDateStr(start);
      const endDate = formatDateStr(end);
      const [viewList, submitList] = await Promise.all([
        fetchLogData(startDate, endDate, 'view'),
        fetchLogData(startDate, endDate, 'submit'),
      ]);
      setData(mergeData(viewList, submitList, start, end));
      setRawSubmitList(submitList);
    } catch (err) {
      message.error(err.message);
      setData([]);
      setRawSubmitList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!dates || !dates[0] || !dates[1]) return;
    loadData(dates[0], dates[1]);
  }, [dates, loadData]);

  const handleRangeChange = (value) => {
    setRange(value);
    if (value !== 'custom') {
      const end = dayjs();
      const start = end.subtract(RANGE_DAYS[value] - 1, 'day');
      setDates([start, end]);
    }
  };

  const handleDatePickerChange = (vals) => {
    if (!vals || !vals[0] || !vals[1]) return;
    setRange('custom');
    setDates(vals);
  };

  const handleRefresh = useCallback(() => {
    if (dates && dates[0] && dates[1]) {
      loadData(dates[0], dates[1]);
    }
  }, [dates, loadData]);

  const handleExportSubmit = () => {
    if (!rawSubmitList || rawSubmitList.length === 0) {
      message.warning('暂无数据可导出');
      return;
    }
    const exportData = rawSubmitList.map((item) => ({
      timestamp: item.timestamp,
      name: item.name,
      company: item.company,
      phone: item.phone,
      email: item.email,
      message: item.message,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '用户点击量');
    XLSX.writeFile(wb, `用户点击量_${formatDateStr(dayjs())}.xlsx`);
  };

  const { totalVisits, totalClicks, visitTrend, clickTrend } = useMemo(() => {
    if (data.length === 0) {
      return { totalVisits: 0, totalClicks: 0, visitTrend: 0, clickTrend: 0 };
    }
    const totalVisits = data.reduce((sum, d) => sum + d.visits, 0);
    const totalClicks = data.reduce((sum, d) => sum + d.clicks, 0);
    const mid = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, mid).reduce((s, d) => s + d.visits, 0);
    const secondHalf = data.slice(mid).reduce((s, d) => s + d.visits, 0);
    const visitTrend = firstHalf === 0 ? 0 : Number((((secondHalf - firstHalf) / firstHalf) * 100).toFixed(1));

    const firstHalfClicks = data.slice(0, mid).reduce((s, d) => s + d.clicks, 0);
    const secondHalfClicks = data.slice(mid).reduce((s, d) => s + d.clicks, 0);
    const clickTrend = firstHalfClicks === 0 ? 0 : Number((((secondHalfClicks - firstHalfClicks) / firstHalfClicks) * 100).toFixed(1));

    return { totalVisits, totalClicks, visitTrend, clickTrend };
  }, [data]);

  return (
    <div className="analysis-page">
      <div className="container">
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">Data Overview</h1>
            <p className="page-subtitle">数据监控面板</p>
          </div>
          <div className="header-controls">
            <Segmented
              className="range-segmented"
              options={[
                { label: RANGE_LABELS['1week'], value: '1week' },
                { label: RANGE_LABELS['1month'], value: '1month' },
                { label: RANGE_LABELS['3months'], value: '3months' },
                { label: RANGE_LABELS['6months'], value: '6months' },
                { label: RANGE_LABELS['1year'], value: '1year' },
                { label: '自定义', value: 'custom' },
              ]}
              value={range}
              onChange={handleRangeChange}
            />
            <RangePicker
              className="range-picker"
              value={dates}
              onChange={handleDatePickerChange}
              allowClear={false}
            />
          </div>
        </div>
        <Spin spinning={loading} tip="加载中...">
          <div className="cards-wrapper">
            <StatCard
              title="用户访问量"
              total={totalVisits}
              trend={visitTrend >= 0 ? 'up' : 'down'}
              trendValue={Math.abs(visitTrend)}
              color="#2f54eb"
              data={data}
              dataKey="visits"
              name="访问量"
            />
            <StatCard
              title="用户点击量"
              total={totalClicks}
              trend={clickTrend >= 0 ? 'up' : 'down'}
              trendValue={Math.abs(clickTrend)}
              color="#08979c"
              data={data}
              dataKey="clicks"
              name="点击量"
              onExport={handleExportSubmit}
            />
          </div>
          <div className="table-wrapper" style={{ marginTop: 24 }}>
            <LogTableList dataList={rawSubmitList} onRefresh={handleRefresh} />
          </div>
        </Spin>
      </div>
    </div>
  );
};

export default AnalysisPage;
