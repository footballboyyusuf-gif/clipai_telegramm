"use client";
import {useEffect,useRef,useState} from "react";
import {Sparkles,Scissors,Upload,Link2,Film,Download,Clock3,Zap,Loader2,CheckCircle2,AlertCircle,Play,RefreshCw} from "lucide-react";

const API=process.env.NEXT_PUBLIC_API_URL||"http://localhost:8000";
type Clip={id:string;title:string;start:number;end:number;duration:number;score:number;reason:string;download:string};
type Job={status:string;progress:number;clips:Clip[];message?:string;error?:string};
const stamp=(s:number)=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`;
export default function Home(){
 const [file,setFile]=useState<File|null>(null),[url,setUrl]=useState(""),[jobId,setJobId]=useState(""),[job,setJob]=useState<Job|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const [edit,setEdit]=useState<Clip|null>(null); const input=useRef<HTMLInputElement>(null);
 useEffect(()=>{if(!jobId)return;let live=true;const poll=async()=>{try{const r=await fetch(`${API}/api/jobs/${jobId}`);const d=await r.json();if(live)setJob(d);if(live&&!["completed","failed"].includes(d.status))setTimeout(poll,2500)}catch{if(live)setError("Не удалось связаться с сервером.")}};poll();return()=>{live=false}},[jobId]);
 async function start(){setError("");if(!file){setError(url?"Для этой ссылки пока нет разрешённого коннектора. Скачайте исходник законным способом и загрузите файл.":"Сначала выберите видеофайл.");return}
 setBusy(true);setJob(null);setJobId("");try{const fd=new FormData();fd.append("file",file);const r=await fetch(`${API}/api/jobs`,{method:"POST",body:fd});const d=await r.json();if(!r.ok)throw new Error(d.detail||"Ошибка загрузки");setJobId(d.job_id)}catch(e:any){setError(e.message||"Ошибка загрузки")}finally{setBusy(false)}}
 async function saveEdit(){if(!edit)return;try{const r=await fetch(`${API}/api/jobs/${jobId}/clips/${edit.id}/render`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({start:edit.start,end:edit.end})});const d=await r.json();if(!r.ok)throw new Error(d.detail);setEdit(null);const fresh=await fetch(`${API}/api/jobs/${jobId}`).then(x=>x.json());setJob(fresh)}catch(e:any){setError(e.message)}}
 const working=!!job&& !["completed","failed"].includes(job.status);
 return <main className="min-h-screen glow">
 <header className="max-w-6xl mx-auto px-5 py-6 flex items-center justify-between"><div className="flex items-center gap-2 font-black text-xl"><span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 grid place-items-center"><Scissors size={19}/></span>Clip<span className="text-violet-400">AI</span></div><div className="text-xs muted border border-line rounded-full px-3 py-2">AI VIDEO STUDIO · BETA</div></header>
 <section className="max-w-4xl mx-auto px-5 pt-14 pb-10 text-center">
 <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-2 text-xs text-violet-200"><Sparkles size={14}/> УМНАЯ АВТОМАТИЧЕСКАЯ НАРЕЗКА</div>
 <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mt-7">Преврати длинное видео<br/><span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">в вирусные Shorts</span></h1>
 <p className="muted text-base md:text-lg mt-5 max-w-2xl mx-auto">ClipAI найдёт сильные моменты, добавит субтитры и подготовит вертикальные ролики для TikTok, Reels и YouTube Shorts.</p>
 </section>
 <section className="max-w-3xl mx-auto px-5 pb-12">
 <div className="card p-5 md:p-7 shadow-2xl shadow-violet-950/20">
 <label className="text-sm font-semibold flex items-center gap-2 mb-3"><Link2 size={16} className="text-violet-300"/> Ссылка на видео</label>
 <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="Вставьте ссылку на YouTube…" className="w-full bg-black/30 border border-line rounded-xl px-4 py-4 outline-none focus:border-violet-500"/>
 <p className="muted text-xs mt-2">Ссылки YouTube пока не обрабатываются напрямую. Используйте видеофайл или официальный разрешённый источник.</p>
 <div className="flex items-center gap-3 my-5"><div className="h-px bg-line flex-1"/><span className="muted text-xs">ИЛИ ЗАГРУЗИТЕ ФАЙЛ</span><div className="h-px bg-line flex-1"/></div>
 <input ref={input} type="file" accept="video/mp4,video/quicktime,video/x-matroska,video/webm,.m4v" className="hidden" onChange={e=>setFile(e.target.files?.[0]||null)}/>
 <button onClick={()=>input.current?.click()} className="w-full rounded-xl border border-dashed border-violet-400/40 bg-violet-400/5 hover:bg-violet-400/10 p-6 text-center transition"><Upload className="mx-auto text-violet-300 mb-2"/><div className="font-semibold">{file?file.name:"Выбрать видео на устройстве"}</div><div className="muted text-xs mt-1">MP4, MOV, MKV, WEBM · до 1.5 ГБ по умолчанию</div></button>
 <button onClick={start} disabled={busy||working} className="btn w-full mt-5 flex items-center justify-center gap-2 disabled:opacity-50">{busy?<Loader2 className="animate-spin"/>:<Sparkles size={18}/>}Найти интересные моменты</button>
 {error&&<p className="text-red-300 text-sm mt-4 flex gap-2"><AlertCircle size={16}/>{error}</p>}
 </div>
 </section>
 {working&&<section className="max-w-3xl mx-auto px-5 pb-10"><div className="card p-6"><div className="flex justify-between mb-3"><span className="font-semibold flex gap-2 items-center"><Loader2 className="animate-spin text-violet-300" size={18}/>Анализируем видео</span><span className="text-violet-300">{job?.progress||0}%</span></div><div className="h-2 rounded-full bg-black/50 overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-500 to-blue-400 transition-all" style={{width:`${job?.progress||0}%`}}/></div><p className="muted text-sm mt-3">Распознаём речь, выбираем фрагменты и рендерим вертикальные клипы. Это может занять несколько минут.</p></div></section>}
 {job?.status==="failed"&&<section className="max-w-3xl mx-auto px-5 pb-10"><div className="card p-5 text-red-300"><AlertCircle className="inline mr-2"/>Ошибка обработки: {job.error}</div></section>}
 {job?.status==="completed"&&<section className="max-w-6xl mx-auto px-5 pb-20">
 <div className="flex flex-wrap justify-between items-end gap-4 mb-6"><div><div className="text-violet-300 text-sm font-semibold">АНАЛИЗ ЗАВЕРШЁН</div><h2 className="text-3xl font-bold mt-1">Найденные моменты</h2><p className="muted mt-1">{job.clips.length?`Готово клипов: ${job.clips.length}`:job.message}</p></div>{job.clips.length>0&&<a className="btn flex gap-2 items-center" href={`${API}/api/jobs/${jobId}/download-all`}><Download size={17}/> Скачать все ZIP</a>}</div>
 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{job.clips.map(c=><article key={c.id} className="card overflow-hidden">
 <div className="aspect-[9/12] bg-black relative"><video className="w-full h-full object-contain" controls playsInline src={`${API}${c.download}`}/><span className="absolute top-3 left-3 bg-black/70 rounded-lg px-2 py-1 text-xs flex gap-1 items-center"><Play size={12}/> 9:16</span><span className="absolute top-3 right-3 bg-violet-600 rounded-lg px-2 py-1 text-xs font-bold">{c.score}/100</span></div>
 <div className="p-4"><h3 className="font-bold leading-snug">{c.title||"Интересный момент"}</h3><div className="muted text-xs flex gap-3 mt-2"><span className="flex gap-1 items-center"><Clock3 size={13}/>{stamp(c.start)}–{stamp(c.end)}</span><span>{c.duration} сек.</span></div><p className="text-sm text-slate-300 mt-3">{c.reason}</p><div className="flex gap-2 mt-4"><a href={`${API}${c.download}`} className="btn flex-1 text-center text-sm flex items-center justify-center gap-2"><Download size={15}/> Скачать</a><button onClick={()=>setEdit({...c})} className="border border-line rounded-xl px-3 hover:bg-white/5" title="Редактировать"><RefreshCw size={16}/></button></div></div>
 </article>)}</div>
 </section>}
 {!job&&<section className="max-w-5xl mx-auto px-5 pb-20 grid md:grid-cols-3 gap-4">{[{i:<Zap/>,t:"Умный отбор",d:"AI оценивает связность и потенциал каждого фрагмента."},{i:<Film/>,t:"Вертикальный формат",d:"Клипы 9:16 с оригинальным звуком и субтитрами."},{i:<Scissors/>,t:"Быстрый экспорт",d:"Скачивайте клипы отдельно или одним архивом."}].map((x,i)=><div key={i} className="card p-5"><div className="text-violet-300 mb-3">{x.i}</div><div className="font-bold">{x.t}</div><p className="muted text-sm mt-2">{x.d}</p></div>)}</section>}
 {edit&&<div className="fixed inset-0 bg-black/75 z-20 grid place-items-center p-4"><div className="card w-full max-w-md p-6"><h3 className="text-xl font-bold mb-4">Изменить фрагмент</h3><label className="text-sm muted">Начало (секунды)</label><input type="number" step=".1" value={edit.start} onChange={e=>setEdit({...edit,start:+e.target.value})} className="w-full bg-black/30 border border-line rounded-lg p-3 my-2"/><label className="text-sm muted">Конец (секунды)</label><input type="number" step=".1" value={edit.end} onChange={e=>setEdit({...edit,end:+e.target.value})} className="w-full bg-black/30 border border-line rounded-lg p-3 my-2"/><div className="flex gap-3 mt-4"><button onClick={()=>setEdit(null)} className="flex-1 border border-line rounded-xl p-3">Отмена</button><button onClick={saveEdit} className="btn flex-1">Перерендерить</button></div></div></div>}
 <footer className="border-t border-line py-7 text-center muted text-xs">ClipAI · MVP · Обрабатывайте только видео, на которые у вас есть права.</footer>
 </main>
}
