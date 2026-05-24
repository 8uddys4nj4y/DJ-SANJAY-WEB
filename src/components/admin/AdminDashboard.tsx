'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
// Removed Tabs UI
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  CheckCircle2,
  Download,
  FileText,
  LayoutDashboard,
  Loader2,
  Package2,
  Save,
  Settings2,
  ShieldAlert,
  Sparkles,
  Star,
  Trash2,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type BookingRow = {
  id: number | string;
  refNumber: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  profileImage: string;
  packageType: string;
  eventType: string;
  district: string;
  area: string;
  date: string;
  status: string;
  totalAmount: number;
  transportFee: number;
  billUrl: string;
  adminNotes: string;
  createdAt: string;
  formData: Record<string, any>;
};

type ReviewRow = {
  id: number | string;
  name: string;
  comment: string;
  rating: number;
  approved: boolean;
  createdAt: string;
};

type AdminMetrics = {
  id?: number;
  total_booked?: number;
  total_completed?: number;
};

const STATUS_FLOW = ['new', 'accepted', 'price_fixed', 'billed', 'dispatched', 'live', 'completed'];

const STATUS_STYLES: Record<string, string> = {
  new: 'border-yellow-500 text-yellow-500 bg-yellow-500/10',
  accepted: 'border-blue-500 text-blue-500 bg-blue-500/10',
  price_fixed: 'border-violet-500 text-violet-500 bg-violet-500/10',
  billed: 'border-cyan-500 text-cyan-500 bg-cyan-500/10',
  dispatched: 'border-indigo-500 text-indigo-500 bg-indigo-500/10',
  live: 'border-primary text-primary bg-primary/10',
  completed: 'border-green-500 text-green-500 bg-green-500/10',
  declined: 'border-red-500 text-red-500 bg-red-500/10',
};

const normalizeBooking = (booking: any = {}): BookingRow => ({
  id: booking.id ?? booking.booking_id ?? '',
  refNumber: booking.ref_number ?? booking.refNumber ?? booking.reference_number ?? '',
  name: booking.form_data?.name ?? booking.name ?? 'Unnamed Client',
  phone: booking.form_data?.phone ?? booking.phone ?? '',
  email: booking.form_data?.email ?? booking.email ?? '',
  address: booking.form_data?.address ?? booking.address ?? booking.location ?? '',
  profileImage: booking.form_data?.profile_image ?? booking.profile_image ?? '',
  packageType: booking.package_type ?? booking.packageType ?? 'custom',
  eventType: booking.event_type ?? booking.eventType ?? 'Custom Event',
  district: booking.district ?? '',
  area: booking.area ?? '',
  date: booking.event_date ?? booking.date ?? '',
  status: booking.status ?? 'new',
  totalAmount: Number(booking.total_amount ?? booking.totalPrice ?? 0),
  transportFee: Number(booking.transport_fee ?? booking.transportFee ?? 0),
  billUrl: booking.bill_url ?? booking.billUrl ?? '',
  adminNotes: booking.admin_notes ?? booking.adminNotes ?? '',
  createdAt: booking.created_at ?? booking.createdAt ?? new Date().toISOString(),
  formData: booking.form_data ?? {},
});

const normalizeReview = (review: any = {}): ReviewRow => ({
  id: review.id ?? '',
  name: review.name ?? review.client_name ?? 'Anonymous',
  comment: review.comment ?? '',
  rating: Number(review.rating ?? review.stars ?? 5),
  approved: Boolean(review.approved ?? true),
  createdAt: review.created_at ?? review.createdAt ?? new Date().toISOString(),
});

const formatCurrency = (value: number) => {
  if (!value) return '₹0';
  return `₹${value.toLocaleString('en-IN')}`;
};

const statusLabel = (status: string) => status.replace(/_/g, ' ');

const getNextStatus = (status: string) => {
  const index = STATUS_FLOW.indexOf(status);
  if (index === -1 || index === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[index + 1];
};

const getPreviousStatus = (status: string) => {
  const index = STATUS_FLOW.indexOf(status);
  if (index <= 0) return null;
  return STATUS_FLOW[index - 1];
};

const calculateRevenues = (bookings: BookingRow[]) => {
  const totalRevenue = bookings.filter((b) => b.status === 'completed').length * 2000;
  return { totalRevenue };
};

export default function AdminDashboard() {
  const { user, loading: userLoading } = useUser();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null);
  const [submitState, setSubmitState] = useState<string | null>(null);
  const [reviewDraft, setReviewDraft] = useState({ name: '', comment: '', rating: 5 });
  const [editingReviewId, setEditingReviewId] = useState<number | string | null>(null);
  const [metrics, setMetrics] = useState<AdminMetrics>({ total_booked: 0, total_completed: 0 });
  const [customOrderDraft, setCustomOrderDraft] = useState({
    refNumber: `DJ-${Date.now()}`,
    name: '',
    email: '',
    phone: '',
    address: '',
    profileImage: '',
    packageType: 'Custom Package',
    eventType: 'Custom Event',
    district: '',
    area: '',
    date: '',
    totalPrice: 0,
    transportFee: 0,
  });
  const [activeSection, setActiveSection] = useState('overview');

  const createCustomOrder = async (customOrderData: Partial<BookingRow> & Record<string, any>) => {
    setSubmitState('Creating custom order...');
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customOrderData),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create custom order.');
      }

      await fetchAdminData();
      setCustomOrderDraft({
        refNumber: `DJ-${Date.now()}`,
        name: '',
        email: '',
        phone: '',
        address: '',
        profileImage: '',
        packageType: 'Custom Package',
        eventType: 'Custom Event',
        district: '',
        area: '',
        date: '',
        totalPrice: 0,
        transportFee: 0,
      });
      setSubmitState('Custom order created successfully.');
    } catch (err) {
      console.error(err);
      setSubmitState(err instanceof Error ? err.message : 'Unable to create custom order.');
    }
  };

  const updateClientDetails = async (clientId: number | string, clientData: Record<string, any>) => {
    setSubmitState('Updating client details...');
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: clientId, ...clientData }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update client details.');
      }

      await fetchAdminData();
      setSubmitState('Client details updated successfully.');
    } catch (err) {
      console.error(err);
      setSubmitState(err instanceof Error ? err.message : 'Unable to update client details.');
    }
  };

  const updateAdminMetrics = async (nextMetrics: { totalBooked?: number; totalCompleted?: number; syncFromBookings?: boolean }) => {
    setSubmitState(nextMetrics.syncFromBookings ? 'Syncing admin metrics from bookings...' : 'Updating admin metrics...');
    try {
      const response = await fetch('/api/admin/metrics', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextMetrics),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update admin metrics.');
      }

      await fetchAdminData();
      setSubmitState(
        nextMetrics.syncFromBookings
          ? 'Admin metrics synced successfully from bookings.'
          : 'Admin metrics updated successfully.'
      );
    } catch (err) {
      console.error(err);
      setSubmitState(err instanceof Error ? err.message : 'Unable to update admin metrics.');
    }
  };

  const updateAgencyMetrics = async (metricsData: { totalBooked?: number; totalCompleted?: number }) => {
    await updateAdminMetrics({
      totalBooked: metricsData.totalBooked,
      totalCompleted: metricsData.totalCompleted,
    });
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bookingResponse, reviewResponse, metricsResponse] = await Promise.all([
        fetch('/api/admin/bookings'),
        fetch('/api/admin/reviews'),
        fetch('/api/admin/metrics'),
      ]);

      if (!bookingResponse.ok) {
        const payload = await bookingResponse.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to load bookings.');
      }

      if (!reviewResponse.ok) {
        const payload = await reviewResponse.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to load reviews.');
      }

      if (!metricsResponse.ok) {
        const payload = await metricsResponse.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to load admin metrics.');
      }

      const bookingPayload = await bookingResponse.json();
      const reviewPayload = await reviewResponse.json();
      const metricsPayload = await metricsResponse.json();

      setBookings((bookingPayload.bookings || []).map(normalizeBooking));
      setReviews((reviewPayload.reviews || []).map(normalizeReview));
      setMetrics(metricsPayload.metrics ?? { total_booked: 0, total_completed: 0 });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unable to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email === 'admin@djsanjay.com') {
      fetchAdminData();
    }
  }, [user]);

  const filteredBookings = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return bookings;
    return bookings.filter((item) =>
      [item.name, item.email, item.phone, item.refNumber, item.packageType, item.address].some((field) =>
        String(field).toLowerCase().includes(keyword)
      )
    );
  }, [bookings, search]);

  const analytics = useMemo(() => {
    const statusCounts = bookings.reduce<Record<string, number>>((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});

    const trend = bookings.reduce<Record<string, number>>((acc, booking) => {
      if (booking.status === 'completed') {
        const key = new Date(booking.createdAt).toLocaleString('en-US', { month: 'short' });
        acc[key] = (acc[key] || 0) + 2000;
      }
      return acc;
    }, {});

    const revenueByPackage = bookings.reduce<Record<string, number>>((acc, booking) => {
      if (booking.status !== 'completed') {
        return acc;
      }

      const packageName = booking.packageType || 'Custom Package';
      acc[packageName] = (acc[packageName] || 0) + 2000;
      return acc;
    }, {});

    return {
      statusCounts,
      trend,
      revenueByPackage,
      totalRevenue: bookings.filter((b) => b.status === 'completed').length * 2000,
      outstanding: bookings.filter((b) => b.status !== 'completed' && b.status !== 'declined').length,
    };
  }, [bookings]);

  const chartSeries = useMemo(
    () =>
      Object.entries(analytics.trend).map(([name, revenue]) => ({
        month: name,
        revenue,
      })),
    [analytics]
  );

  const pieData = useMemo(
    () =>
      Object.entries(analytics.statusCounts).map(([status, value]) => ({
        name: statusLabel(status),
        value,
      })),
    [analytics]
  );

  const revenueBars = useMemo(
    () =>
      Object.entries(analytics.revenueByPackage || {}).map(([packageType, revenue]) => ({
        packageType,
        revenue,
      })),
    [analytics]
  );

  const revenueData = useMemo(() => calculateRevenues(bookings), [bookings]);

  const adminMetrics = useMemo(() => {
    const booked = bookings.filter((b) => b.status === 'new').length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    return { booked, completed };
  }, [bookings]);

  const updateBooking = async (bookingId: number | string, payload: Record<string, any>, action = 'update') => {
    setSubmitState('Updating booking...');
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, action, ...payload }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update booking.');
      }

      setBookings((prev) =>
        prev.map((item) =>
          item.id === bookingId
            ? {
                ...item,
                ...payload,
                ...(payload.form_data ? { formData: payload.form_data } : {}),
                ...(payload.status ? { status: payload.status } : {}),
                ...(payload.package_type ? { packageType: payload.package_type } : {}),
                ...(payload.total_amount !== undefined ? { totalAmount: Number(payload.total_amount) } : {}),
                ...(payload.transport_fee !== undefined ? { transportFee: Number(payload.transport_fee) } : {}),
                ...(payload.bill_url !== undefined ? { billUrl: payload.bill_url } : {}),
                ...(payload.admin_notes !== undefined ? { adminNotes: payload.admin_notes } : {}),
              }
            : item
        )
      );
      await fetchAdminData();
      setSelectedBooking(null);
      setSubmitState('Booking updated successfully.');
    } catch (err) {
      console.error(err);
      setSubmitState(err instanceof Error ? err.message : 'Unable to update booking.');
    }
  };

  const handleReviewSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitState('Saving review...');
    try {
      const response = await fetch('/api/admin/reviews', {
        method: editingReviewId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingReviewId
            ? { id: editingReviewId, ...reviewDraft, stars: reviewDraft.rating }
            : { ...reviewDraft, stars: reviewDraft.rating, approved: true }
        ),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save review.');
      }

      await fetchAdminData();
      setReviewDraft({ name: '', comment: '', rating: 5 });
      setEditingReviewId(null);
      setSubmitState(editingReviewId ? 'Review updated.' : 'Review created.');
    } catch (err) {
      console.error(err);
      setSubmitState(err instanceof Error ? err.message : 'Unable to save review.');
    }
  };

  const deleteReview = async (reviewId: number | string) => {
    if (!window.confirm('Delete this review? This action cannot be undone.')) return;
    setSubmitState('Deleting review...');
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete review.');
      }

      setReviews((prev) => prev.filter((item) => item.id !== reviewId));
      setSubmitState('Review deleted.');
    } catch (err) {
      console.error(err);
      setSubmitState(err instanceof Error ? err.message : 'Unable to delete review.');
    }
  };

  const exportReport = () => {
    const csv = [
      ['Ref Number', 'Client Name', 'Email', 'Phone', 'Package', 'Status', 'Total Amount', 'Transport Fee', 'Created At'],
      ...bookings.map((booking) => [
        booking.refNumber,
        booking.name,
        booking.email,
        booking.phone,
        booking.packageType,
        booking.status,
        booking.totalAmount,
        booking.transportFee,
        booking.createdAt,
      ]),
    ]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dj-sanjay-admin-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const updateOrderStatus = async (orderId: BookingRow['id'], newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/bookings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (!response.ok) {
        throw new Error('Failed to update order status.');
      }
      await fetchAdminData();
    } catch (error) {
      console.error(error);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!user || user.email !== 'admin@djsanjay.com') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-black">
        <ShieldAlert className="text-destructive mb-4" size={40} />
        <h1 className="text-2xl font-headline font-bold text-white">Unauthorized Access</h1>
        <p className="text-zinc-500 max-w-lg mt-2 text-sm">
          This dashboard is only available to the administrator account. Sign in with the admin email to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),transparent_28%),linear-gradient(180deg,#030303,black)] text-white">
      <div className="mx-auto flex max-w-7xl gap-4 px-4 pb-10 pt-24 lg:px-6">
        <aside className="fixed top-0 left-0 h-full w-72 shrink-0 rounded-[2rem] border border-white/10 bg-zinc-950/70 p-4 lg:block">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">DJ SANJAY</p>
              <p className="font-headline text-lg font-bold">Admin Console</p>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {[
              { key: 'overview', label: 'Overview', icon: LayoutDashboard },
              { key: 'orders', label: 'Orders', icon: Package2 },
              { key: 'clients', label: 'Clients', icon: Users },
              { key: 'reviews', label: 'Reviews', icon: Star },
              { key: 'analytics', label: 'Analytics', icon: BarChart3 },
              { key: 'settings', label: 'Settings', icon: Settings2 },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition hover:bg-white/5 ${activeSection === tab.key ? 'bg-white/10 text-primary' : 'text-zinc-300'}`}
              >
                <tab.icon size={16} className="text-primary" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-primary/10 bg-primary/5 p-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary">Realtime Access</p>
            <p className="mt-2 text-sm text-zinc-200">Control orders, fix totals, edit client details, approve reviews, and monitor the live pipeline.</p>
          </div>
        </aside>

        <main className="flex-1 space-y-5 lg:ml-80">
          <div className="rounded-[2rem] border border-white/10 bg-zinc-950/70 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Admin dashboard</p>
                <h1 className="mt-2 font-headline text-3xl font-bold text-white">Control panel for bookings, reviews, and live event operations</h1>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={fetchAdminData} variant="outline" className="border-white/10 text-white">
                  Refresh data
                </Button>
                <Button onClick={exportReport} className="bg-primary text-black font-bold">
                  <Download size={16} className="mr-2" /> Export report
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Card className="border-white/10 bg-white/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-300">Total revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">{formatCurrency(analytics.totalRevenue)}</p>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-300">Active orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">{analytics.outstanding}</p>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-300">Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">{reviews.length}</p>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-300">Live status</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">{statusLabel(bookings[0]?.status ?? 'new')}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {error && (
            <div className="rounded-[1.5rem] border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {submitState && (
            <div className="rounded-[1.5rem] border border-primary/30 bg-primary/10 p-4 text-sm text-primary-foreground">
              {submitState}
            </div>
          )}

          {/* Section rendering based on sidebar */}
          {activeSection === 'overview' && (
            <section className="space-y-4">
              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <Card className="border-white/10 bg-zinc-950/70">
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue trend</CardTitle>
                  </CardHeader>
                  <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartSeries}>
                        <CartesianGrid stroke="#27272a" strokeDasharray="4 4" />
                        <XAxis dataKey="month" stroke="#a1a1aa" />
                        <YAxis stroke="#a1a1aa" />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="border-white/10 bg-zinc-950/70">
                  <CardHeader>
                    <CardTitle className="text-lg">Pipeline distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={4}>
                          {pieData.map((entry, index) => (
                            <Cell key={entry.name} fill={['#22c55e', '#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444'][index % 6]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="border-white/10 bg-zinc-950/70">
                  <CardHeader>
                    <CardTitle className="text-base">Top packages</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {revenueBars.length > 0 ? (
                      revenueBars.map((item) => (
                        <div key={item.packageType} className="flex items-center justify-between text-sm">
                          <span className="text-zinc-300">{item.packageType}</span>
                          <span className="font-bold text-white">{formatCurrency(item.revenue)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-500">No package revenue yet.</p>
                    )}
                  </CardContent>
                </Card>
                <Card className="border-white/10 bg-zinc-950/70">
                  <CardHeader>
                    <CardTitle className="text-base">Quick approvals</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-zinc-300">
                    <p>Accept new orders, set transport amount, create bill links, dispatch, and mark live/completed.</p>
                    <p className="text-primary">Status transitions are always editable, and decline can be reversed by marking the order as new again.</p>
                  </CardContent>
                </Card>
                <Card className="border-white/10 bg-zinc-950/70">
                  <CardHeader>
                    <CardTitle className="text-base">3D performance card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-[1.5rem] bg-gradient-to-br from-primary/20 to-secondary/10 p-5 shadow-[0_20px_60px_rgba(34,197,94,0.2)]">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">Live pulse</p>
                      <div className="mt-4 grid grid-cols-5 gap-2 items-end">
                        {[48, 65, 55, 78, 61].map((height) => (
                          <div
                            key={height}
                            className="rounded-t-xl bg-gradient-to-t from-primary to-secondary"
                            style={{ height: `${height}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}
          {activeSection === 'orders' && (
            <section className="space-y-4">
              <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-zinc-950/70 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Order workflow</p>
                  <h2 className="mt-2 font-headline text-2xl font-bold text-white">Approve, fix totals, build the bill, and move orders live</h2>
                </div>
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by client, email, phone, ref, package"
                  className="max-w-md bg-black/40 border-white/10"
                />
              </div>

              <Card className="border-white/10 bg-zinc-950/70">
                <CardHeader>
                  <CardTitle className="text-lg">Create custom order</CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      createCustomOrder(customOrderDraft);
                    }}
                    className="grid gap-3 md:grid-cols-2"
                  >
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-300">Reference number</label>
                      <Input
                        value={customOrderDraft.refNumber}
                        onChange={(event) => setCustomOrderDraft((prev) => ({ ...prev, refNumber: event.target.value }))}
                        className="bg-black/40 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-300">Package</label>
                      <Input
                        value={customOrderDraft.packageType}
                        onChange={(event) => setCustomOrderDraft((prev) => ({ ...prev, packageType: event.target.value }))}
                        className="bg-black/40 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-300">Client name</label>
                      <Input
                        value={customOrderDraft.name}
                        onChange={(event) => setCustomOrderDraft((prev) => ({ ...prev, name: event.target.value }))}
                        className="bg-black/40 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-300">Email</label>
                      <Input
                        type="email"
                        value={customOrderDraft.email}
                        onChange={(event) => setCustomOrderDraft((prev) => ({ ...prev, email: event.target.value }))}
                        className="bg-black/40 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-300">Phone</label>
                      <Input
                        value={customOrderDraft.phone}
                        onChange={(event) => setCustomOrderDraft((prev) => ({ ...prev, phone: event.target.value }))}
                        className="bg-black/40 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-300">Event type</label>
                      <Input
                        value={customOrderDraft.eventType}
                        onChange={(event) => setCustomOrderDraft((prev) => ({ ...prev, eventType: event.target.value }))}
                        className="bg-black/40 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-300">District</label>
                      <Input
                        value={customOrderDraft.district}
                        onChange={(event) => setCustomOrderDraft((prev) => ({ ...prev, district: event.target.value }))}
                        className="bg-black/40 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-300">Area</label>
                      <Input
                        value={customOrderDraft.area}
                        onChange={(event) => setCustomOrderDraft((prev) => ({ ...prev, area: event.target.value }))}
                        className="bg-black/40 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-300">Event date</label>
                      <Input
                        type="date"
                        value={customOrderDraft.date}
                        onChange={(event) => setCustomOrderDraft((prev) => ({ ...prev, date: event.target.value }))}
                        className="bg-black/40 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-300">Total amount</label>
                      <Input
                        type="number"
                        value={customOrderDraft.totalPrice}
                        onChange={(event) => setCustomOrderDraft((prev) => ({ ...prev, totalPrice: Number(event.target.value) }))}
                        className="bg-black/40 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-300">Transport fee</label>
                      <Input
                        type="number"
                        value={customOrderDraft.transportFee}
                        onChange={(event) => setCustomOrderDraft((prev) => ({ ...prev, transportFee: Number(event.target.value) }))}
                        className="bg-black/40 border-white/10"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm text-zinc-300">Address</label>
                      <Input
                        value={customOrderDraft.address}
                        onChange={(event) => setCustomOrderDraft((prev) => ({ ...prev, address: event.target.value }))}
                        className="bg-black/40 border-white/10"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm text-zinc-300">Profile image URL</label>
                      <Input
                        value={customOrderDraft.profileImage}
                        onChange={(event) => setCustomOrderDraft((prev) => ({ ...prev, profileImage: event.target.value }))}
                        className="bg-black/40 border-white/10"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Button type="submit" className="bg-primary text-black font-bold">
                        Create custom order
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {loading ? (
                  <div className="rounded-[1.5rem] border border-white/10 bg-zinc-950/70 p-8 text-center">
                    <Loader2 className="mx-auto animate-spin text-primary" size={32} />
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-white/10 bg-zinc-950/70 p-8 text-center text-zinc-400">
                    No orders match your current search.
                  </div>
                ) : (
                  filteredBookings.map((booking) => {
                    const nextStatus = getNextStatus(booking.status);
                    const previousStatus = getPreviousStatus(booking.status);
                    return (
                      <Card key={booking.id} className="border-white/10 bg-zinc-950/70">
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-3">
                                <Badge className={`border ${STATUS_STYLES[booking.status] ?? 'border-white/20 text-white bg-white/5'}`}>{statusLabel(booking.status)}</Badge>
                                <span className="text-sm text-zinc-300">Ref: {booking.refNumber}</span>
                                <span className="text-sm text-zinc-300">{booking.packageType}</span>
                              </div>

                              <div>
                                <p className="text-lg font-bold text-white">{booking.name}</p>
                                <p className="text-sm text-zinc-300">{booking.email || 'Email not provided'}</p>
                                <p className="text-sm text-zinc-300">{booking.phone}</p>
                                <p className="text-sm text-zinc-500">{booking.address || 'Address not provided'}</p>
                              </div>

                              <div className="grid gap-2 text-sm text-zinc-300 md:grid-cols-2">
                                <p>Event: {booking.eventType}</p>
                                <p>Date: {booking.date || 'Not set'}</p>
                                <p>Location: {booking.area}, {booking.district}</p>
                                <p>Total: {formatCurrency(booking.totalAmount)}</p>
                                <p>Transport: {formatCurrency(booking.transportFee)}</p>
                              </div>

                              {booking.adminNotes && <p className="text-sm text-zinc-400">Notes: {booking.adminNotes}</p>}
                            </div>

                            <div className="flex flex-col gap-3 min-w-[280px]">
                              <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Action tools</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {booking.status !== 'declined' && booking.status !== 'completed' && nextStatus ? (
                                    <Button
                                      onClick={() =>
                                        updateBooking(booking.id, { status: nextStatus }, 'transition')
                                      }
                                      className="bg-primary text-black font-bold"
                                    >
                                      {booking.status === 'new' ? 'Accept' : `Advance to ${statusLabel(nextStatus)}`}
                                    </Button>
                                  ) : null}

                                  {previousStatus ? (
                                    <Button
                                      variant="outline"
                                      className="border-white/10 text-white"
                                      onClick={() => updateBooking(booking.id, { status: previousStatus }, 'transition')}
                                    >
                                      <ArrowLeftRight size={14} className="mr-2" /> Go back
                                    </Button>
                                  ) : null}

                                  {booking.status !== 'declined' && (
                                    <Button
                                      variant="destructive"
                                      onClick={() => {
                                        if (window.confirm('Decline this order? The client will be notified and this order will be marked as declined.')) {
                                          updateBooking(booking.id, { status: 'declined', admin_notes: 'Declined by admin' }, 'decline');
                                        }
                                      }}
                                    >
                                      <AlertTriangle size={14} className="mr-2" /> Decline
                                    </Button>
                                  )}

                                  <Button
                                    variant="outline"
                                    className="border-white/10 text-white"
                                    onClick={() => setSelectedBooking(booking)}
                                  >
                                    <FileText size={14} className="mr-2" /> Edit details
                                  </Button>
                                </div>
                              </div>

                              <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-zinc-300">
                                <p>Bill link: {booking.billUrl || 'Not created'}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </section>
          )}
          {activeSection === 'clients' && (
            <section className="space-y-4">
              <Card className="border-white/10 bg-zinc-950/70">
                <CardHeader>
                  <CardTitle className="text-lg">Client directory</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Package</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <p className="font-bold text-white">{booking.name}</p>
                              <p className="text-xs text-zinc-500">{booking.refNumber}</p>
                            </TableCell>
                            <TableCell>
                              <p>{booking.email}</p>
                              <p className="text-xs text-zinc-500">{booking.phone}</p>
                            </TableCell>
                            <TableCell>{booking.packageType}</TableCell>
                            <TableCell>
                              <Badge className={`border ${STATUS_STYLES[booking.status] ?? 'border-white/20 text-white bg-white/5'}`}>{statusLabel(booking.status)}</Badge>
                            </TableCell>
                            <TableCell>{booking.address || booking.area}</TableCell>
                            <TableCell>
                              <Button variant="outline" className="border-white/10 text-white" onClick={() => setSelectedBooking(booking)}>
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
          {activeSection === 'reviews' && (
            <section className="space-y-4">
              <Card className="border-white/10 bg-zinc-950/70">
                <CardHeader>
                  <CardTitle className="text-lg">Review control center</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleReviewSubmit} className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-300">Client name</label>
                      <Input
                        value={reviewDraft.name}
                        onChange={(event) => setReviewDraft((prev) => ({ ...prev, name: event.target.value }))}
                        placeholder="e.g. Priya S."
                        className="bg-black/40 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-300">Rating</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            aria-label={`Rate ${star} stars`}
                            onClick={() => setReviewDraft((prev) => ({ ...prev, rating: star }))}
                            className={`text-2xl transition ${reviewDraft.rating >= star ? 'text-yellow-400' : 'text-zinc-600 hover:text-yellow-300'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm text-zinc-300">Comment</label>
                      <textarea
                        value={reviewDraft.comment}
                        onChange={(event) => setReviewDraft((prev) => ({ ...prev, comment: event.target.value }))}
                        placeholder="Write the new review here"
                        className="min-h-28 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div className="md:col-span-2 flex flex-wrap gap-3">
                      <Button type="submit" className="bg-primary text-black font-bold">
                        <Save size={14} className="mr-2" /> {editingReviewId ? 'Update review' : 'Create review'}
                      </Button>
                      {editingReviewId && (
                        <Button
                          type="button"
                          variant="outline"
                          className="border-white/10 text-white"
                          onClick={() => {
                            setEditingReviewId(null);
                            setReviewDraft({ name: '', comment: '', rating: 5 });
                          }}
                        >
                          Cancel edit
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="grid gap-3 lg:grid-cols-2">
                {reviews.map((review) => (
                  <Card key={review.id} className="border-white/10 bg-zinc-950/70">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">{review.name}</p>
                          <p className="text-xs text-zinc-500">{new Date(review.createdAt).toLocaleString()}</p>
                        </div>
                        <Badge className={review.approved ? 'border-primary text-primary bg-primary/10' : 'border-zinc-500 text-zinc-300 bg-zinc-500/10'}>
                          {review.approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="mt-3 flex gap-1 text-primary">
                        {Array.from({ length: review.rating }).map((_, index) => (
                          <Star key={index} size={14} fill="currentColor" />
                        ))}
                      </div>
                      <p className="mt-3 text-sm text-zinc-300">{review.comment}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          className="border-white/10 text-white"
                          onClick={() => {
                            setEditingReviewId(review.id);
                            setReviewDraft({ name: review.name, comment: review.comment, rating: review.rating });
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => deleteReview(review.id)}
                        >
                          <Trash2 size={14} className="mr-2" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
          {activeSection === 'analytics' && (
            <section className="space-y-4">
              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <Card className="border-white/10 bg-zinc-950/70">
                  <CardHeader>
                    <CardTitle className="text-lg">Bar analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueBars}>
                        <CartesianGrid stroke="#27272a" strokeDasharray="4 4" />
                        <XAxis dataKey="packageType" stroke="#a1a1aa" />
                        <YAxis stroke="#a1a1aa" />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-zinc-950/70">
                  <CardHeader>
                    <CardTitle className="text-lg">Operational health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-zinc-300">
                    <p>Accepted: {analytics.statusCounts.accepted ?? 0}</p>
                    <p>Billed: {analytics.statusCounts.billed ?? 0}</p>
                    <p>Dispatched: {analytics.statusCounts.dispatched ?? 0}</p>
                    <p>Live: {analytics.statusCounts.live ?? 0}</p>
                    <p>Completed: {analytics.statusCounts.completed ?? 0}</p>
                    <p>Declined: {analytics.statusCounts.declined ?? 0}</p>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}
          {activeSection === 'settings' && (
            <section className="space-y-4">
              <Card className="border-white/10 bg-zinc-950/70">
                <CardHeader>
                  <CardTitle className="text-lg">Agency metrics controls</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-300">Booked count</label>
                    <Input
                      type="number"
                      value={metrics.total_booked ?? 0}
                      onChange={(event) => setMetrics((prev) => ({ ...prev, total_booked: Number(event.target.value) }))}
                      className="bg-black/40 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-300">Completed count</label>
                    <Input
                      type="number"
                      value={metrics.total_completed ?? 0}
                      onChange={(event) => setMetrics((prev) => ({ ...prev, total_completed: Number(event.target.value) }))}
                      className="bg-black/40 border-white/10"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-wrap gap-3">
                    <Button
                      className="bg-primary text-black font-bold"
                      onClick={() => updateAdminMetrics({
                        totalBooked: metrics.total_booked ?? 0,
                        totalCompleted: metrics.total_completed ?? 0,
                      })}
                    >
                      Save metrics
                    </Button>
                    <Button
                      variant="outline"
                      className="border-white/10 text-white"
                      onClick={() => updateAdminMetrics({ syncFromBookings: true })}
                    >
                      Sync from bookings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
              <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                <Card className="border-white/10 bg-zinc-950/70">
                  <CardHeader>
                    <CardTitle className="text-lg">Admin profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <img src="/DJ_SANJAY_LOGO.png" alt="DJ Sanjay Logo" className="h-12  w-auto" />
                      <div>
                        <p className="font-bold text-white">{user.displayName || 'Admin'}</p>
                        <p className="text-sm text-zinc-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-300">
                      <p>Admin permission is enabled for booking edits, review management, billing updates, and pipeline control.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-zinc-950/70">
                  <CardHeader>
                    <CardTitle className="text-lg">Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full bg-primary text-black font-bold" onClick={fetchAdminData}>Sync latest orders and reviews</Button>
                    <Button variant="outline" className="w-full border-white/10 text-white" onClick={exportReport}>Export dashboard CSV</Button>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-300">
                      <p>To enable email/password or Google login, turn on the corresponding providers in Firebase Authentication.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
        </main>
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-zinc-950 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Edit booking</p>
                <h2 className="mt-2 font-headline text-2xl font-bold text-white">{selectedBooking.name}</h2>
              </div>
              <Button variant="ghost" onClick={() => setSelectedBooking(null)}>Close</Button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm text-zinc-300">Client name</label>
                <Input
                  value={selectedBooking.name}
                  onChange={(event) => setSelectedBooking((prev) => prev ? { ...prev, name: event.target.value } : prev)}
                  className="mt-2 bg-black/40 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-300">Email</label>
                <Input
                  value={selectedBooking.email}
                  onChange={(event) => setSelectedBooking((prev) => prev ? { ...prev, email: event.target.value } : prev)}
                  className="mt-2 bg-black/40 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-300">Phone</label>
                <Input
                  value={selectedBooking.phone}
                  onChange={(event) => setSelectedBooking((prev) => prev ? { ...prev, phone: event.target.value } : prev)}
                  className="mt-2 bg-black/40 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-300">Package</label>
                <Input
                  value={selectedBooking.packageType}
                  onChange={(event) => setSelectedBooking((prev) => prev ? { ...prev, packageType: event.target.value } : prev)}
                  className="mt-2 bg-black/40 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-300">Address</label>
                <Input
                  value={selectedBooking.address}
                  onChange={(event) => setSelectedBooking((prev) => prev ? { ...prev, address: event.target.value } : prev)}
                  className="mt-2 bg-black/40 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-300">Transport fee</label>
                <Input
                  type="number"
                  value={selectedBooking.transportFee}
                  onChange={(event) => setSelectedBooking((prev) => prev ? { ...prev, transportFee: Number(event.target.value) } : prev)}
                  className="mt-2 bg-black/40 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-300">Total amount</label>
                <Input
                  type="number"
                  value={selectedBooking.totalAmount}
                  onChange={(event) => setSelectedBooking((prev) => prev ? { ...prev, totalAmount: Number(event.target.value) } : prev)}
                  className="mt-2 bg-black/40 border-white/10"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-zinc-300">Bill URL</label>
                <Input
                  value={selectedBooking.billUrl}
                  onChange={(event) => setSelectedBooking((prev) => prev ? { ...prev, billUrl: event.target.value } : prev)}
                  className="mt-2 bg-black/40 border-white/10"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-zinc-300">Admin notes</label>
                <textarea
                  value={selectedBooking.adminNotes}
                  onChange={(event) => setSelectedBooking((prev) => prev ? { ...prev, adminNotes: event.target.value } : prev)}
                  className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" className="border-white/10 text-white" onClick={() => setSelectedBooking(null)}>Cancel</Button>
              <Button
                className="bg-primary text-black font-bold"
                onClick={() => {
                  updateBooking(selectedBooking.id, {
                    form_data: {
                      ...selectedBooking.formData,
                      name: selectedBooking.name,
                      email: selectedBooking.email,
                      phone: selectedBooking.phone,
                      address: selectedBooking.address,
                      profile_image: selectedBooking.profileImage,
                    },
                    package_type: selectedBooking.packageType,
                    total_amount: selectedBooking.totalAmount,
                    transport_fee: selectedBooking.transportFee,
                    bill_url: selectedBooking.billUrl,
                    admin_notes: selectedBooking.adminNotes,
                  }, 'update');
                }}
              >
                <Save size={14} className="mr-2" /> Save changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
