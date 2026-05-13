'use client';

import { useState, useRef, useEffect } from 'react';
import { buyerAPI } from '@/lib/api';
import { parseVoiceTranscript } from '@/lib/voiceParser';
import { ViewHeader } from '@/components/DashboardShell';
import { useBuyerData } from '../data-context';

const emptyItem = () => ({
  itemName: '',
  quantity: 1,
  unit: 'kg',
  estimatedPrice: 0,
  category: '',
  notes: '',
});

export default function ListsPage() {
  const {
    shoppingLists,
    shopkeepers,
    dataLoading,
    fetchShoppingLists,
  } = useBuyerData();

  // create-list form
  const [showForm, setShowForm] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().substring(0, 7)
  );
  const [pendingRolloverItems, setPendingRolloverItems] = useState(null);

  // share dropdown
  const [selectedListToShare, setSelectedListToShare] = useState(null);
  const [selectedShopkeeper, setSelectedShopkeeper] = useState('');

  // items modal
  const [editingList, setEditingList] = useState(null);
  const [editingItems, setEditingItems] = useState([]);
  const [savingItems, setSavingItems] = useState(false);

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
      setPendingRolloverItems(
        r.data.items.map((i) => ({ ...i, _id: undefined }))
      );
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
          <form onSubmit={handleCreateList} className="space-y-3">
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
                  ? ` with ${pendingRolloverItems.length} item${
                      pendingRolloverItems.length > 1 ? 's' : ''
                    }`
                  : ''}
              </button>
              <button
                type="button"
                onClick={handleRollover}
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

      {dataLoading ? (
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
                onOpenItems={() => openItemsModal(list)}
                onShare={() => handleShareList(list._id)}
              />
            ))
          ) : (
            <div className="col-span-full bg-white border border-dashed border-stone-300 rounded-2xl p-12 text-center text-zinc-500">
              No lists yet — create your first one.
            </div>
          )}
        </div>
      )}

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
    </>
  );
}

/* ====================== Cards ====================== */

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
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14M10 11v6M14 11v6"
              />
            </svg>
          </button>
        )}
      </div>

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
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
            ₹
          </span>
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
    const SR =
      window['SpeechRecognition'] || window['webkitSpeechRecognition'];
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
      alert(
        'Could not parse any items. Try again with quantity + unit + item name.'
      );
    }
  };

  if (!supported) {
    return (
      <div className="px-5 py-3 bg-amber-50 border-y border-amber-200 text-amber-900 text-xs">
        Voice input not supported in this browser. Try Chrome on Android or
        macOS.
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
          <span className={`text-lg ${listening ? 'animate-pulse' : ''}`}>
            🎤
          </span>
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
        <p className="mt-3 text-sm text-zinc-700 italic">
          &quot;{transcript}&quot;
        </p>
      )}
      {!transcript && !listening && (
        <p className="mt-2 text-xs text-zinc-500">
          Try:{' '}
          <span className="italic">
            &quot;atta paanch kilo, doodh do liter, dahi 500 gram&quot;
          </span>
        </p>
      )}
    </div>
  );
}
