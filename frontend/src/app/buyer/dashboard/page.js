'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { buyerAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { parseVoiceTranscript } from '@/lib/voiceParser';
import DashboardShell, { ViewHeader } from '@/components/DashboardShell';

const emptyItem = () => ({
  itemName: '',
  quantity: 1,
  unit: 'kg',
  estimatedPrice: 0,
  category: '',
  notes: '',
});

export default function BuyerDashboard() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const [view, setView] = useState('lists');
  const [shoppingLists, setShoppingLists] = useState([]);
  const [shopkeepers, setShopkeepers] = useState([]);
  const [ledger, setLedger] = useState([]);

  // create list form
  const [showForm, setShowForm] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().substring(0, 7)
  );
  const [pendingRolloverItems, setPendingRolloverItems] = useState(null);
  const [listLoading, setListLoading] = useState(true);

  // share dropdown
  const [selectedListToShare, setSelectedListToShare] = useState(null);
  const [selectedShopkeeper, setSelectedShopkeeper] = useState('');

  // items modal
  const [editingList, setEditingList] = useState(null);
  const [editingItems, setEditingItems] = useState([]);
  const [savingItems, setSavingItems] = useState(false);

  const fetchShoppingLists = () =>
    buyerAPI
      .getShoppingLists()
      .then((r) => setShoppingLists(r.data))
      .catch(console.error)
      .finally(() => setListLoading(false));

  const fetchLedger = () =>
    buyerAPI
      .getLedger()
      .then((r) => setLedger(r.data))
      .catch(console.error);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    else if (user && user.userType !== 'buyer') router.push('/shopkeeper/dashboard');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    Promise.all([
      buyerAPI.getShoppingLists(),
      buyerAPI.getShopkeepers(),
      buyerAPI.getLedger(),
    ])
      .then(([lists, shops, ledg]) => {
        if (cancelled) return;
        setShoppingLists(lists.data);
        setShopkeepers(shops.data);
        setLedger(ledg.data);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleCreateList = async (e) => {
    e.preventDefault();
    try {
      const r = await buyerAPI.createShoppingList({
        title: newListTitle,
        month: currentMonth,
        items: pendingRolloverItems || [],
      });
      setNewListTitle('');
      setPendingRolloverItems(null);
      setShowForm(false);
      await fetchShoppingLists();
      // open the items modal on the newly created list so user can add items
      if (r.data?.shoppingList) openItemsModal(r.data.shoppingList);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRollover = async () => {
    try {
      const r = await buyerAPI.getLastShoppingList();
      if (!r.data || !r.data.items?.length) {
        alert('No previous list to copy from.');
        return;
      }
      setPendingRolloverItems(r.data.items.map((i) => ({ ...i, _id: undefined })));
      if (!newListTitle) setNewListTitle(r.data.title);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShareList = async (listId) => {
    if (!selectedShopkeeper) {
      alert('Please select a shopkeeper');
      return;
    }
    try {
      await buyerAPI.shareShoppingList(listId, selectedShopkeeper);
      setSelectedListToShare(null);
      setSelectedShopkeeper('');
      fetchShoppingLists();
    } catch (e) {
      console.error(e);
    }
  };

  const openItemsModal = (list) => {
    setEditingList(list);
    setEditingItems(
      list.items?.length ? list.items.map((i) => ({ ...i })) : [emptyItem()]
    );
  };
  const closeItemsModal = () => {
    setEditingList(null);
    setEditingItems([]);
  };
  const updateItem = (idx, field, value) =>
    setEditingItems((items) =>
      items.map((item, i) =>
        i === idx
          ? {
              ...item,
              [field]:
                field === 'quantity' || field === 'estimatedPrice'
                  ? Number(value)
                  : value,
            }
          : item
      )
    );
  const addItemRow = () => setEditingItems((items) => [...items, emptyItem()]);
  const removeItemRow = (idx) =>
    setEditingItems((items) => items.filter((_, i) => i !== idx));
  const appendVoiceItems = (parsed) =>
    setEditingItems((items) => [
      ...items.filter((i) => i.itemName.trim()),
      ...parsed,
    ]);
  const handleSaveItems = async () => {
    if (!editingList) return;
    try {
      setSavingItems(true);
      await buyerAPI.updateShoppingList(editingList._id, {
        items: editingItems.filter((i) => i.itemName.trim()),
      });
      closeItemsModal();
      fetchShoppingLists();
    } catch (e) {
      console.error(e);
    } finally {
      setSavingItems(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">Loading...</div>
    );
  if (!user) return null;

  const owedCount = ledger.filter((l) => l.balance > 0).length;

  const navItems = [
    { id: 'lists', label: 'My lists', icon: <IconList />, badge: shoppingLists.length || null },
    { id: 'khata', label: 'Khata', icon: <IconRupee />, badge: owedCount || null },
    { id: 'shopkeepers', label: 'Shopkeepers', icon: <IconShop /> },
    { id: 'profile', label: 'Profile', icon: <IconUser /> },
  ];

  return (
    <DashboardShell
      roleLabel="Customer"
      userName={user.name}
      userSubtitle={user.email}
      navItems={navItems}
      activeView={view}
      onSelectView={setView}
      onLogout={logout}
    >
      {view === 'lists' && (
        <ListsView
          shoppingLists={shoppingLists}
          shopkeepers={shopkeepers}
          listLoading={listLoading}
          showForm={showForm}
          setShowForm={setShowForm}
          newListTitle={newListTitle}
          setNewListTitle={setNewListTitle}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          pendingRolloverItems={pendingRolloverItems}
          setPendingRolloverItems={setPendingRolloverItems}
          onCreate={handleCreateList}
          onRollover={handleRollover}
          selectedListToShare={selectedListToShare}
          setSelectedListToShare={setSelectedListToShare}
          selectedShopkeeper={selectedShopkeeper}
          setSelectedShopkeeper={setSelectedShopkeeper}
          onOpenItems={openItemsModal}
          onShare={handleShareList}
        />
      )}

      {view === 'khata' && <KhataView ledger={ledger} onPaid={fetchLedger} />}

      {view === 'shopkeepers' && <ShopkeepersView shopkeepers={shopkeepers} />}

      {view === 'profile' && <ProfileView user={user} />}

      {editingList && (
        <ItemsModal
          list={editingList}
          items={editingItems}
          readOnly={editingList.status !== 'draft'}
          saving={savingItems}
          onUpdateItem={updateItem}
          onAddRow={addItemRow}
          onRemoveRow={removeItemRow}
          onAppendVoiceItems={appendVoiceItems}
          onSave={handleSaveItems}
          onClose={closeItemsModal}
        />
      )}
    </DashboardShell>
  );
}

/* ============================== Views ============================== */

function ListsView({
  shoppingLists,
  shopkeepers,
  listLoading,
  showForm,
  setShowForm,
  newListTitle,
  setNewListTitle,
  currentMonth,
  setCurrentMonth,
  pendingRolloverItems,
  setPendingRolloverItems,
  onCreate,
  onRollover,
  selectedListToShare,
  setSelectedListToShare,
  selectedShopkeeper,
  setSelectedShopkeeper,
  onOpenItems,
  onShare,
}) {
  return (
    <>
      <ViewHeader
        eyebrow="Your lists"
        title="Monthly raashan"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-900 text-stone-50 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-emerald-800"
          >
            + New list
          </button>
        }
      />

      {showForm && (
        <div className="bg-white border border-stone-200 p-5 rounded-2xl mb-6">
          <form onSubmit={onCreate} className="space-y-3">
            <input
              type="text"
              placeholder="List title (e.g. Monthly Groceries)"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-700"
            />
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-700"
            />
            <div className="flex flex-wrap gap-2 items-center">
              <button
                type="submit"
                className="bg-emerald-900 text-stone-50 px-5 py-2 rounded-full text-sm font-medium hover:bg-emerald-800"
              >
                Create
                {pendingRolloverItems
                  ? ` with ${pendingRolloverItems.length} item${pendingRolloverItems.length > 1 ? 's' : ''}`
                  : ''}
              </button>
              <button
                type="button"
                onClick={onRollover}
                className="bg-white border border-stone-300 text-zinc-700 px-4 py-2 rounded-full text-sm hover:border-emerald-700"
              >
                📋 Copy from last month
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setPendingRolloverItems(null);
                }}
                className="text-zinc-500 text-sm hover:text-zinc-700 px-2"
              >
                Cancel
              </button>
              {pendingRolloverItems && (
                <span className="text-xs text-emerald-800 ml-auto">
                  ✓ {pendingRolloverItems.length} items will copy across
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {listLoading ? (
        <div className="text-center py-12 text-zinc-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shoppingLists.length > 0 ? (
            shoppingLists.map((list) => (
              <ListCard
                key={list._id}
                list={list}
                shopkeepers={shopkeepers}
                selectedListToShare={selectedListToShare}
                setSelectedListToShare={setSelectedListToShare}
                selectedShopkeeper={selectedShopkeeper}
                setSelectedShopkeeper={setSelectedShopkeeper}
                onOpenItems={() => onOpenItems(list)}
                onShare={() => onShare(list._id)}
              />
            ))
          ) : (
            <div className="col-span-full bg-white border border-dashed border-stone-300 rounded-2xl p-12 text-center text-zinc-500">
              No lists yet — create your first one.
            </div>
          )}
        </div>
      )}
    </>
  );
}

function KhataView({ ledger, onPaid }) {
  if (ledger.length === 0) {
    return (
      <>
        <ViewHeader eyebrow="Udhaar khata" title="Your balances" />
        <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-12 text-center text-zinc-500">
          No transactions yet. Khata entries appear after a shopkeeper marks an order complete.
        </div>
      </>
    );
  }
  return (
    <>
      <ViewHeader eyebrow="Udhaar khata" title="Your balance with each kirana" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ledger.map((row) => (
          <LedgerRow key={row.shopkeeperId} row={row} onPaid={onPaid} />
        ))}
      </div>
    </>
  );
}

function ShopkeepersView({ shopkeepers }) {
  return (
    <>
      <ViewHeader eyebrow="Discover" title="Kiranas you can share with" />
      {shopkeepers.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-12 text-center text-zinc-500">
          No shopkeepers registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shopkeepers.map((sk) => (
            <div
              key={sk._id}
              className="bg-white border border-stone-200 rounded-2xl p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{sk.shopName}</h3>
                  <p className="text-xs text-zinc-500">{sk.name} · {sk.phone}</p>
                </div>
                {sk.rating?.count > 0 && (
                  <span className="text-sm">⭐ {sk.rating.avg.toFixed(1)}</span>
                )}
              </div>
              {sk.shopAddress && (
                <p className="text-sm text-zinc-600 mt-2">
                  {sk.shopAddress.line1}
                  {sk.shopAddress.city ? `, ${sk.shopAddress.city}` : ''}
                  {sk.shopAddress.pincode ? ` · ${sk.shopAddress.pincode}` : ''}
                </p>
              )}
              {sk.categories?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {sk.categories.slice(0, 5).map((c) => (
                    <span
                      key={c}
                      className="text-[10px] uppercase tracking-widest bg-stone-100 text-zinc-600 px-2 py-1 rounded-full"
                    >
                      {c.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-3 mt-3 text-xs text-zinc-500">
                {sk.deliveryAvailable && (
                  <span>🚲 Delivers {sk.deliveryRadiusKm || ''}km</span>
                )}
                {sk.upiVpa && <span>💳 UPI</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function ProfileView({ user }) {
  return (
    <>
      <ViewHeader eyebrow="Profile" title="Your details" />
      <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 max-w-lg">
        <Detail label="Name" value={user.name} />
        <Detail label="Email" value={user.email} />
        <Detail label="Phone" value={user.phone} />
        <Detail label="Role" value="Customer" />
      </div>
      <p className="mt-4 text-xs text-zinc-500">
        Editing not enabled yet — coming soon.
      </p>
    </>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value || '—'}</p>
    </div>
  );
}

/* ====================== Cards & rows ====================== */

function LedgerRow({ row, onPaid }) {
  const owes = row.balance > 0;
  const credit = row.balance < 0;
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold truncate">
            {row.shopkeeper?.shopName || row.shopkeeper?.name || 'Unknown shop'}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            ₹{Math.round(row.charges).toLocaleString('en-IN')} billed · ₹
            {Math.round(row.payments).toLocaleString('en-IN')} paid
          </p>
        </div>
        <div className="text-right">
          <p
            className={`text-2xl font-semibold ${
              owes ? 'text-orange-700' : credit ? 'text-emerald-800' : 'text-zinc-500'
            }`}
          >
            ₹{Math.round(Math.abs(row.balance)).toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">
            {owes ? 'You owe' : credit ? 'Credit' : 'Settled'}
          </p>
        </div>
      </div>
      {owes && (
        <div className="mt-4">
          <UpiPayButton
            shopkeeper={row.shopkeeper}
            amount={row.balance}
            onPaid={onPaid}
          />
        </div>
      )}
    </div>
  );
}

function UpiPayButton({ shopkeeper, amount, onPaid }) {
  const vpa = shopkeeper?.upiVpa;
  const note = `Rashann settle — ${shopkeeper?.shopName || ''}`.trim();
  const handlePay = async () => {
    if (vpa) {
      const url = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(
        shopkeeper?.shopName || shopkeeper?.name || 'Shopkeeper'
      )}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;
      window.location.href = url;
    }
    if (
      confirm(
        vpa
          ? `Mark ₹${Math.round(amount)} as paid via UPI?`
          : `This shopkeeper hasn't added a UPI ID. Record ₹${Math.round(amount)} as paid anyway?`
      )
    ) {
      try {
        await buyerAPI.recordPayment({
          shopkeeperId: shopkeeper._id,
          amount,
          method: 'upi',
          note,
        });
        onPaid();
      } catch (e) {
        console.error(e);
      }
    }
  };
  return (
    <button
      onClick={handlePay}
      className="bg-emerald-900 text-stone-50 px-4 py-2 rounded-full text-sm hover:bg-emerald-800"
    >
      {vpa ? 'Pay via UPI' : 'Record as paid'}
    </button>
  );
}

function ListCard({
  list,
  shopkeepers,
  selectedListToShare,
  setSelectedListToShare,
  selectedShopkeeper,
  setSelectedShopkeeper,
  onOpenItems,
  onShare,
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold truncate">{list.title}</h3>
          <p className="text-xs text-zinc-500">
            {list.month} · {list.items?.length || 0} items
          </p>
        </div>
        <span
          className={`text-[10px] font-medium px-2 py-1 rounded-full shrink-0 ${
            list.status === 'shared'
              ? 'bg-blue-100 text-blue-800'
              : list.status === 'completed'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {list.status}
        </span>
      </div>
      {list.totalEstimatedPrice ? (
        <p className="text-emerald-800 font-semibold mb-3">
          ₹{list.totalEstimatedPrice.toLocaleString('en-IN')}
        </p>
      ) : null}

      <div className="space-y-2">
        {list.status === 'draft' ? (
          <>
            <button
              onClick={onOpenItems}
              className="w-full bg-stone-100 text-zinc-800 px-3 py-2 rounded-xl text-sm hover:bg-stone-200"
            >
              {list.items?.length ? 'Edit items' : 'Add items'}
            </button>
            <button
              onClick={() => setSelectedListToShare(list._id)}
              disabled={!list.items?.length}
              className="w-full bg-emerald-900 text-stone-50 px-3 py-2 rounded-xl text-sm hover:bg-emerald-800 disabled:bg-zinc-300 disabled:cursor-not-allowed"
            >
              Share with shopkeeper
            </button>
          </>
        ) : (
          <button
            onClick={onOpenItems}
            className="w-full bg-stone-100 text-zinc-800 px-3 py-2 rounded-xl text-sm hover:bg-stone-200"
          >
            View items
          </button>
        )}

        {selectedListToShare === list._id && (
          <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
            <select
              value={selectedShopkeeper}
              onChange={(e) => setSelectedShopkeeper(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm mb-2"
            >
              <option value="">Select a shopkeeper</option>
              {shopkeepers.map((sk) => (
                <option key={sk._id} value={sk._id}>
                  {sk.shopName || sk.name}
                  {sk.shopAddress?.city ? ` · ${sk.shopAddress.city}` : ''}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={onShare}
                className="flex-1 bg-emerald-900 text-stone-50 px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-800"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setSelectedListToShare(null);
                  setSelectedShopkeeper('');
                }}
                className="flex-1 bg-stone-200 text-zinc-700 px-3 py-1.5 rounded-lg text-sm hover:bg-stone-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ====================== Items Modal + Voice ====================== */

function ItemsModal({
  list,
  items,
  readOnly,
  saving,
  onUpdateItem,
  onAddRow,
  onRemoveRow,
  onAppendVoiceItems,
  onSave,
  onClose,
}) {
  const total = items.reduce(
    (sum, item) => sum + (Number(item.estimatedPrice) || 0),
    0
  );
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-stone-100">
          <div>
            <h3 className="font-semibold">{list.title}</h3>
            <p className="text-xs text-zinc-500">
              {list.month} · {readOnly ? 'Read only' : 'Editing'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-800 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {!readOnly && <VoiceCapture onItemsParsed={onAppendVoiceItems} />}

        <div className="flex-1 overflow-auto p-4 md:p-5">
          {items.length === 0 ? (
            <div className="text-center text-zinc-500 py-12">
              <p className="mb-4">No items yet.</p>
              {!readOnly && (
                <button
                  onClick={onAddRow}
                  className="inline-flex items-center gap-2 bg-emerald-900 text-stone-50 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-emerald-800"
                >
                  + Add your first item
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => (
                <ItemRow
                  key={idx}
                  idx={idx}
                  item={item}
                  readOnly={readOnly}
                  onUpdateItem={onUpdateItem}
                  onRemoveRow={onRemoveRow}
                />
              ))}
            </div>
          )}

          {!readOnly && items.length > 0 && (
            <button
              onClick={onAddRow}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-white border-2 border-dashed border-stone-300 hover:border-emerald-700 hover:text-emerald-900 text-zinc-600 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              + Add another item
            </button>
          )}
        </div>

        <div className="flex justify-between items-center p-5 border-t border-stone-100 bg-stone-50">
          <div className="text-sm">
            Estimated total:{' '}
            <span className="font-semibold text-emerald-900">
              ₹{Math.round(total).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-stone-200 text-zinc-700 rounded-full text-sm hover:bg-stone-300"
            >
              {readOnly ? 'Close' : 'Cancel'}
            </button>
            {!readOnly && (
              <button
                onClick={onSave}
                disabled={saving}
                className="px-4 py-2 bg-emerald-900 text-stone-50 rounded-full text-sm hover:bg-emerald-800 disabled:bg-zinc-300"
              >
                {saving ? 'Saving...' : 'Save items'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemRow({ idx, item, readOnly, onUpdateItem, onRemoveRow }) {
  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2">
      {/* Row 1: item name (flex-1) + delete button */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Item name (e.g. Basmati Rice)"
          value={item.itemName}
          disabled={readOnly}
          onChange={(e) => onUpdateItem(idx, 'itemName', e.target.value)}
          className="flex-1 min-w-0 px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-emerald-700 disabled:bg-stone-100"
        />
        {!readOnly && (
          <button
            type="button"
            onClick={() => onRemoveRow(idx)}
            title="Remove item"
            className="shrink-0 w-9 h-9 inline-flex items-center justify-center rounded-lg bg-white border border-stone-200 text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14M10 11v6M14 11v6" />
            </svg>
          </button>
        )}
      </div>

      {/* Row 2: qty + unit + price */}
      <div className="grid grid-cols-3 gap-2">
        <input
          type="number"
          min="0"
          step="0.1"
          placeholder="Qty"
          value={item.quantity}
          disabled={readOnly}
          onChange={(e) => onUpdateItem(idx, 'quantity', e.target.value)}
          className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-emerald-700 disabled:bg-stone-100"
        />
        <select
          value={item.unit}
          disabled={readOnly}
          onChange={(e) => onUpdateItem(idx, 'unit', e.target.value)}
          className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-emerald-700 disabled:bg-stone-100"
        >
          <option value="kg">kg</option>
          <option value="g">g</option>
          <option value="L">L</option>
          <option value="mL">mL</option>
          <option value="pcs">pcs</option>
          <option value="pack">pack</option>
        </select>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₹</span>
          <input
            type="number"
            min="0"
            placeholder="Price"
            value={item.estimatedPrice}
            disabled={readOnly}
            onChange={(e) => onUpdateItem(idx, 'estimatedPrice', e.target.value)}
            className="w-full pl-7 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-emerald-700 disabled:bg-stone-100"
          />
        </div>
      </div>

      {/* Row 3 (collapsible details): category + notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Category (e.g. Grains)"
          value={item.category}
          disabled={readOnly}
          onChange={(e) => onUpdateItem(idx, 'category', e.target.value)}
          className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-emerald-700 disabled:bg-stone-100"
        />
        <input
          type="text"
          placeholder="Notes (optional)"
          value={item.notes}
          disabled={readOnly}
          onChange={(e) => onUpdateItem(idx, 'notes', e.target.value)}
          className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-emerald-700 disabled:bg-stone-100"
        />
      </div>
    </div>
  );
}

function VoiceCapture({ onItemsParsed }) {
  const [supported] = useState(
    () =>
      typeof window !== 'undefined' &&
      !!(window['SpeechRecognition'] || window['webkitSpeechRecognition'])
  );
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lang, setLang] = useState('hi-IN');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!supported) return;
    const SR = window['SpeechRecognition'] || window['webkitSpeechRecognition'];
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = lang;
    rec.onresult = (event) => {
      let text = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    return () => rec.abort();
  }, [lang, supported]);

  const start = () => {
    if (!recognitionRef.current) return;
    setTranscript('');
    setListening(true);
    try {
      recognitionRef.current.start();
    } catch {
      setListening(false);
    }
  };
  const stop = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };
  const handleApply = () => {
    const parsed = parseVoiceTranscript(transcript);
    if (parsed.length) {
      onItemsParsed(parsed);
      setTranscript('');
    } else {
      alert('Could not parse any items. Try again with quantity + unit + item name.');
    }
  };

  if (!supported) {
    return (
      <div className="px-5 py-3 bg-amber-50 border-y border-amber-200 text-amber-900 text-xs">
        Voice input not supported in this browser. Try Chrome on Android or macOS.
      </div>
    );
  }

  return (
    <div className="px-5 py-4 bg-stone-50 border-y border-stone-200">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={listening ? stop : start}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            listening
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-emerald-900 text-stone-50 hover:bg-emerald-800'
          }`}
        >
          <span className={`text-lg ${listening ? 'animate-pulse' : ''}`}>🎤</span>
          {listening ? 'Listening… tap to stop' : 'Add items by voice'}
        </button>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          disabled={listening}
          className="text-sm bg-white border border-stone-200 rounded-full px-3 py-2"
        >
          <option value="hi-IN">हिन्दी (Hindi)</option>
          <option value="en-IN">English (India)</option>
          <option value="mr-IN">मराठी (Marathi)</option>
          <option value="ta-IN">தமிழ் (Tamil)</option>
          <option value="bn-IN">বাংলা (Bengali)</option>
          <option value="te-IN">తెలుగు (Telugu)</option>
        </select>
        {transcript && !listening && (
          <button
            onClick={handleApply}
            className="bg-stone-900 text-stone-50 px-4 py-2 rounded-full text-sm hover:bg-stone-700"
          >
            Add {parseVoiceTranscript(transcript).length} item
            {parseVoiceTranscript(transcript).length !== 1 ? 's' : ''}
          </button>
        )}
      </div>
      {transcript && (
        <p className="mt-3 text-sm text-zinc-700 italic">&quot;{transcript}&quot;</p>
      )}
      {!transcript && !listening && (
        <p className="mt-2 text-xs text-zinc-500">
          Try: <span className="italic">&quot;atta paanch kilo, doodh do liter, dahi 500 gram&quot;</span>
        </p>
      )}
    </div>
  );
}

/* ============================== Icons ============================== */

function IconList() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}
function IconRupee() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12M6 9h12M9 4c3.5 0 5.5 2 5.5 4.5S12.5 13 9 13H7l8 7" />
    </svg>
  );
}
function IconShop() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l1.2-5h15.6L21 9M4 9v11h16V9M9 20v-6h6v6" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  );
}
