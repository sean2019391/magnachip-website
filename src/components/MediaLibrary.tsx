'use client';

import React, { useEffect, useState } from 'react';

type Props = {
  onPick: (url: string) => void;
  onClose: () => void;
};

export default function MediaLibrary({ onPick, onClose }: Props) {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/admin/uploads/list')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted) return;
        if (data && Array.isArray(data.items)) {
          setItems(data.items);
        } else {
          setItems([]);
        }
      })
      .catch(() => setItems([]))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[900px] max-w-[95%] bg-white rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Media Library</h3>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-1 rounded border">Close</button>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-500">No media uploaded yet.</div>
        ) : (
          <div className="grid grid-cols-4 gap-3 max-h-[60vh] overflow-auto">
            {items.map((url) => (
              <button
                key={url}
                onClick={() => onPick(url)}
                className="rounded overflow-hidden border p-0 bg-white"
                title={url}
              >
                <img src={url} alt="media" className="w-full h-32 object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
