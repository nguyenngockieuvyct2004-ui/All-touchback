import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function MemoryEditPage(){
  const { id } = useParams();
  // Hỗ trợ cả route "/memories/new" (không có id) và "/memories/:id/edit"
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [title,setTitle] = useState('');
  const [description,setDescription] = useState('');
  const [media, setMedia] = useState([]); // [{type:'image'|'video', url, caption?}]
  const [error,setError] = useState('');
  const [saving,setSaving] = useState(false);

  // Form chỉnh sửa: theo yêu cầu bỏ phần nhập URL ảnh khi tạo
  const [mType, setMType] = useState('image');
  const [mUrl, setMUrl] = useState('');
  const [mCaption, setMCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(()=>{
    if(!isNew){
      api.get(`/memories/${id}`)
        .then(r=>{
          setTitle(r.data.title||'');
          setDescription(r.data.description ?? r.data.content ?? '');
          setMedia(Array.isArray(r.data.media) ? r.data.media : []);
        })
        .catch(()=> setError('Không tải được dữ liệu'));
    } else {
      // Chế độ tạo mới: đảm bảo không hiển thị lỗi cũ
      setError('');
      setTitle('');
      setDescription('');
      setMedia([]);
    }
  },[id,isNew]);

  async function save(e){
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const payload = { title: title.trim(), description, media };
      if(isNew){
        const r = await api.post('/memories', payload);
        navigate(`/memories/${r.data.id || r.data._id}`);
      } else {
        await api.put(`/memories/${id}`, payload);
        navigate(`/memories/${id}`);
      }
    } catch(e){
      setError(e.response?.data?.message || 'Lưu thất bại');
    } finally { setSaving(false); }
  }

  return <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight gradient-text mb-2">{isNew? 'Tạo Memory':'Sửa Memory'}</h1>
      <p className="text-sm text-muted-foreground">Ghi lại khoảnh khắc đặc biệt của bạn. Bạn có thể viết nhiều dòng.</p>
    </div>
    {!isNew && <ErrorMessage error={error} />}
  <form onSubmit={save} className="panel space-y-5">
      <div className="space-y-1.5">
        <label className="label">Tiêu đề</label>
        <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ví dụ: Buổi chiều ở Đà Lạt" />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="label">Nội dung</label>
          <span className="text-[11px] text-muted-foreground">Có thể xuống dòng để tách đoạn.</span>
        </div>
        <textarea
          rows={10}
          className="input font-mono text-sm leading-relaxed"
          value={description}
          onChange={e=>setDescription(e.target.value)}
          placeholder={"Hôm nay..."}
        />
      </div>

      {/* Media attachments */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="label">Đính kèm ảnh/video</label>
          <span className="text-[11px] text-muted-foreground">Tải file từ máy của bạn, tối đa 20 mục.</span>
        </div>
        {/* Theo yêu cầu: bỏ trường URL khi thêm mới, ưu tiên upload từ thiết bị. Vẫn giữ input chú thích khi xem lại từng mục. */}

        {/* Upload từ thiết bị */}
        <div className="flex items-center gap-2">
          <input type="file" accept="image/*,video/*" multiple className="input h-10 p-2" onChange={async (e)=>{
            const files = Array.from(e.target.files||[]);
            if(!files.length) return;
            try {
              setUploading(true);
              const form = new FormData();
              files.forEach(f=> form.append('files', f));
              const r = await api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
              const added = (r.data?.files||[]).map(f=> ({ type: f.type, url: f.url }));
              const next = [...media, ...added];
              if(next.length>20) { alert('Vượt quá 20 media, chỉ thêm một phần.'); }
              setMedia(next.slice(0,20));
              e.target.value = '';
            } catch(err){
              alert(err.response?.data?.message || 'Tải file thất bại');
            } finally {
              setUploading(false);
            }
          }} />
          {uploading && <span className="text-xs text-muted-foreground">Đang tải...</span>}
        </div>

        {!!media.length && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {media.map((m,idx)=> (
              <div key={idx} className="rounded-lg border border-gray-200 dark:border-gray-800 p-2 flex items-center gap-2 bg-white/70 dark:bg-gray-900/60">
                {m.type==='image' ? (
                  <img loading="lazy" src={m.url} alt={m.caption||''} className="w-16 h-16 object-cover rounded" onError={(e)=>{ e.currentTarget.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'64\' height=\'64\'><rect width=\'100%\' height=\'100%\' fill=\'%23eee\'/></svg>'; }} />
                ) : (
                  <div className="w-16 h-16 rounded bg-gray-100 dark:bg-gray-800 text-xs flex items-center justify-center">🎥</div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium truncate">{m.caption || (m.type==='image'?'Ảnh':'Video')}</div>
                  <div className="text-[11px] text-gray-500 truncate">{m.url}</div>
                </div>
                <button type="button" className="btn btn-outline btn-sm w-full sm:w-auto" onClick={()=> setMedia(media.filter((_,i)=> i!==idx))}>Xoá</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
  <button disabled={saving || !title.trim()} className="btn btn-primary w-full sm:w-auto md:min-w-[120px]">{saving?'Đang lưu...':'Lưu'}</button>
        {!title.trim() && <span className="text-xs text-amber-600 dark:text-amber-400">Cần tiêu đề.</span>}
      </div>
    </form>
  </div>;
}
