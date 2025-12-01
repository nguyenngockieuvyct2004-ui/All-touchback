import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api.js';
import { toast } from '../lib/toast.js';
import LostModeSwitch from '../components/LostModeSwitch.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function MemoryEditPage(){
  const { id } = useParams();
  // Hỗ trợ cả route "/memories/new" (không có id) và "/memories/:id/edit"
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [title,setTitle] = useState('');
  const [description,setDescription] = useState('');
  const [media, setMedia] = useState([]); // [{type:'image'|'video'|'audio', url, caption?}]
  const [error,setError] = useState('');
  const [saving,setSaving] = useState(false);
  const [bgAudioUrl, setBgAudioUrl] = useState('');
  const [galleryStyle, setGalleryStyle] = useState('grid');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isCoverDragOver, setIsCoverDragOver] = useState(false);
  // Lost mode form state
  const [lostEnabled, setLostEnabled] = useState(false);
  const [lostTitle, setLostTitle] = useState('');
  const [lostMessage, setLostMessage] = useState('');
  const [lostName, setLostName] = useState('');
  const [lostPhone, setLostPhone] = useState('');
  const [lostEmail, setLostEmail] = useState('');
  const [savingLost, setSavingLost] = useState(false);

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
          setBgAudioUrl(r.data.bgAudioUrl || '');
          setGalleryStyle(r.data.galleryStyle || 'grid');
          setCoverImageUrl(r.data.coverImageUrl || '');
          const lost = r.data.lost || { isLost:false, title:'', message:'', contact:{ name:'', phone:'', email:'' } };
          setLostEnabled(!!lost.isLost);
          setLostTitle(lost.title||'');
          setLostMessage(lost.message||'');
          setLostName(lost.contact?.name||'');
          setLostPhone(lost.contact?.phone||'');
          setLostEmail(lost.contact?.email||'');
        })
        .catch(()=> setError('Không tải được dữ liệu'));
    } else {
      // Chế độ tạo mới: đảm bảo không hiển thị lỗi cũ
      setError('');
      setTitle('');
      setDescription('');
      setMedia([]);
      setBgAudioUrl('');
      setGalleryStyle('grid');
      setCoverImageUrl('');
    }
  },[id,isNew]);

  async function save(e){
    e.preventDefault(); setError(''); setSaving(true);
    try {
  const payload = { title: title.trim(), description, media, bgAudioUrl: bgAudioUrl || undefined, galleryStyle, coverImageUrl: coverImageUrl || undefined };
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
    <style>{`@keyframes tb-border-move{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}`}</style>
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
          <label className="label">Đính kèm ảnh/video/âm thanh</label>
          <span className="text-[11px] text-muted-foreground">Tải file từ máy của bạn, tối đa 20 mục.</span>
        </div>
        {/* Theo yêu cầu: bỏ trường URL khi thêm mới, ưu tiên upload từ thiết bị. Vẫn giữ input chú thích khi xem lại từng mục. */}

        {/* Upload từ thiết bị */}
        <div className="flex items-center gap-2">
          <input type="file" accept="image/*,video/*,audio/*" multiple className="input h-10 p-2" onChange={async (e)=>{
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
              // Nếu có audio vừa tải lên, tự động chọn làm nhạc nền (lấy cái đầu tiên)
              const firstAudio = added.find(f=> f.type==='audio');
              if(firstAudio) setBgAudioUrl(firstAudio.url);
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
            {media.map((m,idx)=> {
              const isCover = m.type==='image' && coverImageUrl===m.url;
              return (
                <div
                  key={idx}
                  className={`relative rounded-xl ${isCover? 'p-[2px] overflow-hidden':''}`}
                  style={isCover? { background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #f0abfc, #34d399, #60a5fa)', backgroundSize: '300% 100%', animation: 'tb-border-move 8s linear infinite' } : undefined}
                >
                  <div
                    className={`relative z-10 rounded-xl border ${isCover? 'border-transparent' : 'border-gray-200 dark:border-gray-800'} p-2 flex items-center justify-between gap-3 bg-white/70 dark:bg-gray-900/60 shadow-sm`}
                    draggable={m.type==='image'}
                    onDragStart={(e)=>{ if(m.type==='image'){ e.dataTransfer.setData('text/plain', m.url); e.dataTransfer.effectAllowed = 'copyMove'; } }}
                    title={m.type==='image' ? 'Kéo ảnh này xuống vùng Ảnh bìa để đặt làm bìa' : ''}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {m.type==='image' ? (
                        <img loading="lazy" src={m.url} alt={m.caption||''} className="w-16 h-16 object-cover rounded" onError={(e)=>{ e.currentTarget.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'64\' height=\'64\'><rect width=\'100%\' height=\'100%\' fill=\'%23eee\'/></svg>'; }} />
                      ) : m.type==='video' ? (
                        <div className="w-16 h-16 rounded bg-gray-100 dark:bg-gray-800 text-xs flex items-center justify-center">🎥</div>
                      ) : (
                        <div className="w-16 h-16 rounded bg-gray-100 dark:bg-gray-800 text-xs flex items-center justify-center">🎵</div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate">{m.caption || (m.type==='image'?'Ảnh': m.type==='video'?'Video':'Âm thanh')}</div>
                        <div className="text-[11px] text-gray-500 truncate">{m.url}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {m.type==='image' && (
                        <button
                          type="button"
                          className={`btn ${isCover? 'btn-primary':'btn-outline'} btn-sm h-9`}
                          onClick={()=> setCoverImageUrl(m.url)}
                          title="Chọn làm ảnh bìa"
                        >Bìa</button>
                      )}
                      <button type="button" className="btn btn-outline btn-sm h-9" onClick={()=> {
                        setMedia(media.filter((_,i)=> i!==idx));
                        if(coverImageUrl===m.url) setCoverImageUrl('');
                      }}>Xoá</button>
                    </div>
                  </div>
                  {/* No extra overlay; border is the animated background on the wrapper above */}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ảnh bìa (tùy chọn) */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <label className="label">Ảnh bìa (tùy chọn)</label>
          <span className="text-[11px] text-muted-foreground">Chọn một ảnh làm ảnh hiển thị đầu tiên.</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          {/* <input
            type="file"
            accept="image/*"
            className="input h-10 p-2"
            onChange={async (e)=>{
              const files = Array.from(e.target.files||[]);
              if(!files.length) return;
              try{
                setUploading(true);
                const form = new FormData();
                files.forEach(f=> form.append('files', f));
                const r = await api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
                const added = (r.data?.files||[]).filter(f=> f.type==='image').map(f=> ({ type: f.type, url: f.url }));
                if(added.length){
                  // thêm vào media nhưng set ảnh bìa là file đầu tiên
                  setMedia(prev=> [...prev, ...added].slice(0,20));
                  setCoverImageUrl(added[0].url);
                }
                e.target.value = '';
              }catch(err){
                alert(err.response?.data?.message || 'Tải ảnh bìa thất bại');
              }finally{
                setUploading(false);
              }
            }}
          /> */}
          <select className="input h-10" value={coverImageUrl} onChange={(e)=> setCoverImageUrl(e.target.value)}>
            <option value="">-- Không chọn --</option>
            {media.filter(m=> m.type==='image').map((m,i)=> (
              <option key={i} value={m.url}>{m.caption || m.url}</option>
            ))}
          </select>
          {coverImageUrl && (
            <button type="button" className="btn btn-outline h-10" onClick={()=> setCoverImageUrl('')}>Bỏ ảnh bìa</button>
          )}
        </div>
        {/* Dropzone đặt ảnh bìa bằng kéo-thả */}
        <div
          className={`rounded-2xl border-2 border-dashed p-4 transition-colors ${isCoverDragOver? 'border-sky-400/80 bg-sky-50/50 dark:bg-sky-900/10':'border-gray-300/80 dark:border-gray-700/70 bg-white/50 dark:bg-gray-900/40'}`}
          onDragOver={(e)=>{
            // Chỉ highlight khi đang kéo 1 ảnh từ danh sách (url nội bộ)
            const haveUrl = e.dataTransfer?.types?.includes('text/plain');
            if(haveUrl){ e.preventDefault(); setIsCoverDragOver(true); }
          }}
          onDragLeave={()=> setIsCoverDragOver(false)}
          onDrop={(e)=>{
            e.preventDefault();
            const url = e.dataTransfer.getData('text/plain');
            if(url && media.some(m=> m.type==='image' && m.url===url)){
              setCoverImageUrl(url);
            }
            setIsCoverDragOver(false);
          }}
        >
          <div className="text-center text-xs text-muted-foreground mb-2">Kéo một ảnh từ danh sách ở trên và thả vào đây để đặt làm ảnh bìa</div>
          {coverImageUrl ? (
            <img src={coverImageUrl} alt="Ảnh bìa" className="w-full h-auto rounded-lg shadow-sm" />
          ) : (
            <div className="h-28 grid place-items-center text-gray-400">Chưa chọn ảnh bìa</div>
          )}
        </div>
      </div>

      {/* Nhạc nền (tùy chọn) */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <label className="label">Nhạc nền (tùy chọn)</label>
          <span className="text-[11px] text-muted-foreground">Chọn file âm thanh hoặc chọn từ media đã tải.</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <input
            type="file"
            accept="audio/*"
            className="input h-10 p-2"
            onChange={async (e)=>{
              const files = Array.from(e.target.files||[]);
              if(!files.length) return;
              try{
                setUploading(true);
                const form = new FormData();
                files.forEach(f=> form.append('files', f));
                const r = await api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
                const added = (r.data?.files||[]).filter(f=> f.type==='audio').map(f=> ({ type: f.type, url: f.url }));
                if(added.length){
                  setMedia(prev=> [...prev, ...added].slice(0,20));
                  setBgAudioUrl(added[0].url);
                }
                e.target.value = '';
              }catch(err){
                alert(err.response?.data?.message || 'Tải audio thất bại');
              }finally{
                setUploading(false);
              }
            }}
          />
          <div className="flex-1 flex items-stretch sm:items-center gap-2">
            <select className="input h-10" value={bgAudioUrl} onChange={(e)=> setBgAudioUrl(e.target.value)}>
              <option value="">-- Không dùng nhạc nền --</option>
              {media.filter(m=> m.type==='audio').map((m,i)=> (
                <option key={i} value={m.url}>{m.caption || m.url}</option>
              ))}
            </select>
            {bgAudioUrl && (
              <button type="button" className="btn btn-outline h-10" onClick={()=> setBgAudioUrl('')}>Bỏ nhạc</button>
            )}
          </div>
        </div>
        {bgAudioUrl && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-3 bg-white/70 dark:bg-gray-900/60">
            <audio src={bgAudioUrl} controls className="w-full" />
          </div>
        )}
      </div>

      {/* Kiểu trình bày album ảnh */}
      <div className="space-y-1.5 pt-2">
        <label className="label">Kiểu album</label>
        <select className="input" value={galleryStyle} onChange={(e)=> setGalleryStyle(e.target.value)}>
          <option value="grid">Lưới</option>
          <option value="carousel">Carousel</option>
        </select>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
  <button disabled={saving || !title.trim()} className="btn btn-primary w-full sm:w-auto md:min-w-[120px]">{saving?'Đang lưu...':'Lưu'}</button>
        {!title.trim() && <span className="text-xs text-amber-600 dark:text-amber-400">Cần tiêu đề.</span>}
      </div>

      {/* Lost mode editor */}
      {!isNew && (
        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Trường hợp bị mất</h3>
            <LostModeSwitch isLost={!!lostEnabled} disabled={savingLost} onToggle={async (next)=>{
              // auto-save when user toggles Lost/Active
              try{
                setSavingLost(true);
                const r = await api.patch(`/memories/${id}/lost`, { isLost: !!next });
                // server should return updated lost object
                const lostResp = r.data?.lost;
                setLostEnabled(!!(lostResp?.isLost ?? next));
                toast.success(next ? 'Đã bật Lost mode' : 'Đã chuyển Active');
                // show small saved badge similar to the manual save button
                const badge = document.createElement('span');
                badge.textContent = 'Đã lưu';
                badge.className = 'text-[11px] px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
                const container = document.getElementById('lost-save-badge');
                if(container){ container.innerHTML = ''; container.appendChild(badge); setTimeout(()=>{ if(container) container.innerHTML=''; }, 1800); }
              }catch(e){
                toast.error(e.response?.data?.message || 'Lỗi cập nhật Lost mode');
              }finally{ setSavingLost(false); }
            }} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="label">Tiêu đề Lost</label>
              <input className="input" value={lostTitle} onChange={e=>setLostTitle(e.target.value)} placeholder="Tôi bị mất đồ..." />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="label">Lời nhắn</label>
              <textarea className="input min-h-[100px]" value={lostMessage} onChange={e=>setLostMessage(e.target.value)} placeholder="Nếu bạn nhặt được, xin liên hệ..." />
            </div>
            <div className="space-y-1">
              <label className="label">Tên liên hệ</label>
              <input className="input" value={lostName} onChange={e=>setLostName(e.target.value)} placeholder="Người liên hệ" />
            </div>
            <div className="space-y-1">
              <label className="label">Số điện thoại</label>
              <input className="input" value={lostPhone} onChange={e=>setLostPhone(e.target.value)} placeholder="090..." />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="label">Email</label>
              <input className="input" value={lostEmail} onChange={e=>setLostEmail(e.target.value)} placeholder="you@example.com" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="btn btn-outline" disabled={savingLost} onClick={async ()=>{
              try{
                setSavingLost(true);
                const payload = { isLost: !!lostEnabled, title: lostTitle, message: lostMessage, contact: { name: lostName, phone: lostPhone, email: lostEmail } };
                await api.patch(`/memories/${id}/lost`, payload);
                toast.success('Đã lưu Lost mode');
                // show subtle 'Đã lưu' pill similar to your mock
                const badge = document.createElement('span');
                badge.textContent = 'Đã lưu';
                badge.className = 'text-[11px] px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
                const container = document.getElementById('lost-save-badge');
                if(container){
                  container.innerHTML = '';
                  container.appendChild(badge);
                  setTimeout(()=>{ if(container) container.innerHTML=''; }, 1800);
                }
              }catch(e){ toast.error(e.response?.data?.message||'Lưu thất bại'); }
              finally{ setSavingLost(false); }
            }}>Lưu Lost mode</button>
            <span id="lost-save-badge" />
          </div>
        </div>
      )}
    </form>
  </div>;
}
