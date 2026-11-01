/* 賽馬分析工具 v1.0 MVP — 純前端，數據存 localStorage */
'use strict';
var LS_KEY = 'hrt_v1';

function uid(){ return 'x' + Date.now().toString(36) + Math.floor(Math.random()*1e6).toString(36); }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function num(x, d){ var v = parseFloat(x); if(isNaN(v)) return d==null?'':v.toFixed(d); return v.toFixed(d==null?1:d); }
function money(x){ var v = Math.round(parseFloat(x)||0); return (v<0?'−$':'$') + Math.abs(v).toLocaleString('en-US'); }

/* ---------- 樣本數據 ---------- */
function sampleState(){
  return {
    version: 1, bankroll: 50000, sample: true,
    meetings: [{
      id:'m1', chip:'11-01 跑馬地', title:'跑馬地・2026-11-01（日）', sub:'頭場 13:00 開跑・草地「B」跑道', sample:true,
      races: [{
        id:'r3', label:'R3', info:'第三場・第四班・1200米',
        runners:[
          {gate:3, num:5, name:'電訊飛彈', rating:52, speed:98, form:'2-4-1-3-5-2', odds:4.6, fair:3.8, conf:'高'},
          {gate:7, num:2, name:'包裝旋風', rating:54, speed:91, form:'1-2-6-2-3-4', odds:3.2, fair:3.4, conf:'中'},
          {gate:1, num:8, name:'金鎗大將', rating:50, speed:87, form:'5-3-2-7-1-6', odds:6.5, fair:7.0, conf:'中'},
          {gate:5, num:11, name:'幸運星辰', rating:48, speed:88, form:'4-5-3-2-4-3', odds:8.0, fair:6.2, conf:'中'},
          {gate:9, num:3, name:'龍城飛將', rating:55, speed:93, form:'3-1-4-5-6-2', odds:2.8, fair:3.2, conf:'高'},
          {gate:4, num:7, name:'勝利神駒', rating:47, speed:82, form:'6-7-5-4-8-5', odds:12, fair:14, conf:'低'},
          {gate:11, num:9, name:'晨曦勇士', rating:49, speed:84, form:'7-6-8-3-5-7', odds:15, fair:18, conf:'低'},
          {gate:6, num:12, name:'駿馬飛馳', rating:46, speed:79, form:'8-9-6-9-7-8', odds:21, fair:26, conf:'低'}
        ]
      }]
    }],
    horses: {
      '電訊飛彈': {name:'電訊飛彈',sample:true, info:'5歲・澳洲自購馬・評分 52', tj:'練馬師 蔡約翰／騎師 潘頓（樣本）', speed:98,
        form:[['10-28','沙田','1200','好地','1/12','1:09.2','126','潘頓'],['10-11','跑馬地','1200','好地','2/12','1:10.1','124','潘頓'],['09-27','沙田','1400','好地','4/14','1:22.8','122','潘頓'],['09-06','跑馬地','1200','黏地','1/12','1:10.8','120','潘頓']]},
      '包裝旋風': {name:'包裝旋風',sample:true, info:'4歲・紐西蘭自購馬・評分 54', tj:'練馬師 告東尼／騎師 布文（樣本）', speed:91,
        form:[['10-25','跑馬地','1200','好地','5/12','1:10.5','128','布文'],['10-04','沙田','1200','好地','2/12','1:09.6','126','布文'],['09-20','跑馬地','1650','好地','6/12','1:40.2','124','布文']]},
      '幸運星辰': {name:'幸運星辰',sample:true, info:'6歲・香港國際馬匹拍賣會・評分 48', tj:'練馬師 沈集成／騎師 何澤堯（樣本）', speed:88,
        form:[['10-28','沙田','1200','好地','2/12','1:09.4','118','何澤堯'],['10-11','跑馬地','1200','好地','3/12','1:10.3','117','何澤堯'],['09-27','沙田','1200','黏地','4/12','1:10.9','116','何澤堯']]}
    },
    bets: [
      {id:uid(), sample:true, date:'2026-10-28', race:'10-28 R6', horse:'電訊飛彈', type:'獨贏', odds:4.6, stake:200, result:'win', payout:920},
      {id:uid(), sample:true, date:'2026-10-28', race:'10-28 R6', horse:'幸運星辰', type:'位置', odds:8.0, stake:100, result:'win', payout:290},
      {id:uid(), sample:true, date:'2026-10-25', race:'10-25 R4', horse:'包裝旋風', type:'獨贏', odds:3.2, stake:200, result:'lose', payout:0},
      {id:uid(), sample:true, date:'2026-10-25', race:'10-25 R8', horse:'龍城飛將', type:'獨贏', odds:2.8, stake:150, result:'lose', payout:0}
    ],
    sel: {meet:'m1', race:'r3', horse:'電訊飛彈'}
  };
}

/* ---------- state ---------- */
function load(){
  try{
    var raw = localStorage.getItem(LS_KEY);
    if(!raw) return sampleState();
    var s = JSON.parse(raw);
    if(!s || s.version!==1 || !Array.isArray(s.meetings)) return sampleState();
    s.bets = s.bets||[]; s.horses = s.horses||{}; s.sel = s.sel||{};
    /* 遷移：舊版 sampleState 冇 sample 標記；S.sample=true 即全份係樣本 */
    if(s.sample && !s.bets.some(function(b){return b.sample;})){
      s.bets.forEach(function(b){ b.sample=true; });
    }
    return s;
  }catch(e){ return sampleState(); }
}
function hasSample(){
  if(S.sample) return true;
  if(S.bets.some(function(b){return b.sample;})) return true;
  if(S.meetings.some(function(m){return m.sample;})) return true;
  return Object.keys(S.horses).some(function(n){return S.horses[n].sample;});
}
var S = load();
function save(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(S)); }catch(e){} }
function curMeet(){ return S.meetings.find(function(m){return m.id===S.sel.meet;}) || S.meetings[0]; }
function curRace(){ var m=curMeet(); if(!m) return null; return m.races.find(function(r){return r.id===S.sel.race;}) || m.races[0]; }

/* ---------- CSV ---------- */
function parseCSV(text){
  var rows=[], row=[], cur='', q=false, i, c;
  for(i=0;i<text.length;i++){
    c=text[i];
    if(q){
      if(c==='"'){ if(text[i+1]==='"'){cur+='"';i++;} else q=false; }
      else cur+=c;
    }else if(c==='"'){ q=true; }
    else if(c===','){ row.push(cur); cur=''; }
    else if(c==='\n'||c==='\r'){
      if(c==='\r'&&text[i+1]==='\n') i++;
      row.push(cur); cur='';
      if(row.some(function(x){return x.trim()!=='';})) rows.push(row);
      row=[];
    }else cur+=c;
  }
  if(cur!==''||row.length){ row.push(cur); if(row.some(function(x){return x.trim()!=='';})) rows.push(row); }
  return rows;
}
function csvDownload(name, text){
  var blob = new Blob(["\ufeff"+text], {type:'text/csv;charset=utf-8'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

/* 匯入排位表：會議chip,會議標題,會議副題,場次,場次資訊,檔位,馬號,馬名,評分,速度評分,近績,賠率,Fair,信心 */
function importRaceCSV(text){
  var rows = parseCSV(text);
  if(rows.length<2) throw new Error('CSV 冇數據列');
  var h = rows[0].map(function(x){return x.trim();});
  function col(){ for(var i=0;i<arguments.length;i++){ var k=h.indexOf(arguments[i]); if(k>=0) return k; } return -1; }
  var cChip=col('會議chip','會議'), cTitle=col('會議標題'), cSub=col('會議副題'),
      cRace=col('場次'), cInfo=col('場次資訊'), cGate=col('檔位'), cNum=col('馬號'),
      cName=col('馬名'), cRating=col('評分'), cSpeed=col('速度評分'), cForm=col('近績'),
      cOdds=col('賠率'), cFair=col('Fair','fair'), cConf=col('信心');
  if(cChip<0||cRace<0||cName<0) throw new Error('缺少必要欄位（會議chip／場次／馬名）');
  var added=0;
  for(var i=1;i<rows.length;i++){
    var r=rows[i], g=function(c){return c<0?'':(r[c]||'').trim();};
    var chip=g(cChip), raceLabel=g(cRace), name=g(cName);
    if(!chip||!raceLabel||!name) continue;
    var m=S.meetings.find(function(x){return x.chip===chip;});
    if(!m){ m={id:uid(), chip:chip, title:g(cTitle)||chip, sub:g(cSub)||'', races:[]}; S.meetings.push(m); }
    var rc=m.races.find(function(x){return x.label===raceLabel;});
    if(!rc){ rc={id:uid(), label:raceLabel, info:g(cInfo)||'', runners:[]}; m.races.push(rc); }
    var num=parseInt(g(cNum))||0;
    var key=num+'|'+name;
    var ex=rc.runners.find(function(x){return (x.num+'|'+x.name)===key;});
    var rec={
      gate:parseInt(g(cGate))||0, num:num, name:name,
      rating:parseFloat(g(cRating))||0, speed:parseFloat(g(cSpeed))||0,
      form:g(cForm), odds:parseFloat(g(cOdds))||0, fair:parseFloat(g(cFair))||0, conf:g(cConf)||'中'
    };
    if(ex){
      /* 已存在：更新官方數據；CSV 留空的欄位保留用戶手填值 */
      ex.gate=rec.gate; ex.rating=rec.rating; ex.form=rec.form;
      if(g(cSpeed)!=='') ex.speed=rec.speed;
      if(g(cOdds)!=='') ex.odds=rec.odds;
      if(g(cFair)!=='') ex.fair=rec.fair;
      if(g(cConf)!=='') ex.conf=rec.conf;
    }else{
      rc.runners.push(rec);
    }
    added++;
  }
  if(!S.sel.meet && S.meetings.length){ S.sel.meet=S.meetings[0].id; }
  save();
  return added;
}

/* ---------- 更新賠率 ---------- */
function parseOddsCSV(text){
  var rows=parseCSV(text), out=[];
  if(!rows.length) return out;
  var h=rows[0].map(function(x){return x.trim();});
  var cRace=h.indexOf('場次'), cNum=h.indexOf('馬號'), cOdds=h.indexOf('獨贏');
  if(cRace<0||cNum<0||cOdds<0) throw new Error('賠率 CSV 缺少欄位（場次,馬號,獨贏）');
  rows.slice(1).forEach(function(r){
    var num=parseInt(r[cNum],10), odds=parseFloat(r[cOdds]);
    if(r[cRace]&&num>0&&odds>0) out.push({race:r[cRace].trim(), num:num, odds:odds});
  });
  return out;
}

/* 匯入馬匹往績：馬名,基本資料,騎練組合,速度評分,日期,馬場,途程,場地,名次,時間,負磅,騎師 */
function importHorseCSV(text){
  var rows=parseCSV(text);
  if(rows.length<2) throw new Error('CSV 冇數據列');
  var h=rows[0].map(function(x){return x.trim();});
  function col(){ for(var i=0;i<arguments.length;i++){ var k=h.indexOf(arguments[i]); if(k>=0) return k; } return -1; }
  var cName=col('馬名'), cInfo=col('基本資料'), cTj=col('騎練組合'), cSpeed=col('速度評分'),
      cDate=col('日期'), cTrack=col('馬場'), cDist=col('途程'), cGoing=col('場地'),
      cPos=col('名次'), cTime=col('時間'), cWt=col('負磅'), cJoc=col('騎師');
  if(cName<0) throw new Error('缺少必要欄位（馬名）');
  var n=0;
  for(var i=1;i<rows.length;i++){
    var r=rows[i], g=function(c){return c<0?'':(r[c]||'').trim();};
    var name=g(cName); if(!name) continue;
    var hz=S.horses[name]||{name:name, info:g(cInfo), tj:g(cTj), speed:parseFloat(g(cSpeed))||0, form:[]};
    if(g(cInfo)) hz.info=g(cInfo);
    if(g(cTj)) hz.tj=g(cTj);
    if(g(cSpeed)) hz.speed=parseFloat(g(cSpeed))||hz.speed;
    /* 往績列去重：同馬同日同途程同馬場只保留一列 */
    var fkey=g(cDate)+'|'+g(cDist)+'|'+g(cTrack);
    var dup=hz.form.some(function(f){return (f[0]+'|'+f[2]+'|'+f[1])===fkey;});
    if(g(cDate) && !dup) hz.form.push([g(cDate),g(cTrack),g(cDist),g(cGoing),g(cPos),g(cTime),g(cWt),g(cJoc)]);
    S.horses[name]=hz; n++;
  }
  save();
  return n;
}

/* ---------- 共用 ---------- */
function tagOf(r){
  if(r.odds>0 && r.fair>0){
    if(r.odds > r.fair*1.05) return 'value';
    if(r.odds < r.fair*0.9) return 'hot';
  }
  return 'none';
}

/* ---------- 電腦估 Fair ---------- */
function formPoints(formStr){
  var w=[1,0.85,0.7,0.55,0.4,0.3], pts=[10,7,5,3,2,1], total=0;
  (formStr||'').split('/').slice(0,6).forEach(function(s,i){
    var p=parseInt(s,10);
    if(p>=1&&p<=6) total+=pts[p-1]*w[i];
    else if(p>6) total+=0.5*w[i];
  });
  return total;
}
function cdBonus(runner, track, dist){
  var h=S.horses[runner.name];
  if(!h||!h.form||!h.form.length||!dist) return {bonus:0,note:''};
  var wins=0, places=0, n=0;
  h.form.slice(0,12).forEach(function(f){
    var fd=parseInt(f[2],10);
    if(f[1]===track && Math.abs(fd-dist)<=100){
      n++;
      var m=/^(\d+)/.exec(f[4]||'');
      if(m){ var p=parseInt(m[1],10); if(p===1) wins++; if(p<=3) places++; }
    }
  });
  return {bonus:Math.min(12, wins*4+(places-wins)*1.5), note:n?('同程'+n+'戰'+wins+'冠'):''};
}
function estimateFair(rc, track){
  var distM=/(\d+)\s*米/.exec(rc.info||''), dist=distM?parseInt(distM[1],10):0;
  var T=25; /* softmax 溫度：v1校準（2026-11-01十場數據，loglik+合理封頂），數據累積後再調 */
  var items=rc.runners.map(function(r){
    var fp=formPoints(r.form), cd=cdBonus(r, track, dist);
    return {r:r, score:(r.rating||50)+fp+cd.bonus, fp:fp, cd:cd};
  });
  var mx=Math.max.apply(null, items.map(function(x){return x.score;}));
  var exps=items.map(function(x){return Math.exp((x.score-mx)/T);});
  var sum=exps.reduce(function(a,b){return a+b;},0);
  items.forEach(function(x,i){
    var p=exps[i]/sum;
    x.r.fairEst=Math.max(1.1, Math.round(10/p)/10);
    x.r.fairNote='評分 '+(x.r.rating||'—')+'・近績 '+Math.round(x.fp)+' 分'+(x.cd.note?'・'+x.cd.note:'');
  });
}
function tagHtml(t){
  if(t==='value') return '<span class="badge value">有值</span>';
  if(t==='hot') return '<span class="badge hot">偏熱</span>';
  return '<span class="badge none">—</span>';
}
function edgePct(r){ return ((r.odds-r.fair)/r.fair*100); }

/* ---------- TAB: 賽事 ---------- */
function renderRace(){
  var mp = S.meetings.map(function(m){
    return '<button class="pill'+(S.sel.meet===m.id?' active':'')+'" data-meet="'+m.id+'">'+esc(m.chip)+'</button>';
  }).join('');
  document.getElementById('meetPills').innerHTML = mp || '<span class="sub">未有賽事數據</span>';
  var m = curMeet(), body = document.getElementById('raceBody');
  if(!m){
    document.getElementById('meetHead').innerHTML='';
    document.getElementById('racePills').innerHTML='';
    body.innerHTML='<div class="empty">未有賽事數據。<br>匯入排位表 CSV，或用樣本數據試下。</div>';
    return;
  }
  document.getElementById('meetHead').innerHTML='<h3>'+esc(m.title)+'</h3><span>'+esc(m.sub)+'</span>';
  document.getElementById('racePills').innerHTML = m.races.map(function(r){
    return '<button class="pill'+(S.sel.race===r.id?' active':'')+'" data-race="'+r.id+'">'+esc(r.label)+'</button>';
  }).join('');
  var rc = curRace();
  if(!rc){ body.innerHTML='<div class="empty">呢個賽期未有場次。</div>'; return; }
  var rows = rc.runners.map(function(r){
    var t=tagOf(r);
    var fairCell = r.fair
      ? esc(String(r.fair))+(r.fairAuto?' <span class="auto">估</span>':'')
      : '—';
    return '<tr><td class="num">'+r.gate+'</td><td class="num">'+r.num+'</td>'+
      '<td><span class="horse" data-horse="'+esc(r.name)+'">'+esc(r.name)+'</span><br><span class="sub">評分 '+r.rating+'・近績 '+esc(r.form)+'</span></td>'+
      '<td class="num editable" data-f="odds" data-n="'+r.num+'">'+(r.odds||'—')+'</td>'+
      '<td class="num editable" data-f="fair" data-n="'+r.num+'"'+(r.fairNote?' title="'+esc(r.fairNote)+'"':'')+'>'+fairCell+'</td>'+
      '<td>'+tagHtml(t)+'</td><td><span class="badge '+(r.conf==='高'?'high':'none')+'">'+esc(r.conf)+'</span></td></tr>';
  }).join('');
  body.innerHTML='<p class="raceinfo">'+esc(rc.info||rc.label)+'</p>'+
    '<div class="btnrow"><button class="btn" id="btnEstFair">電腦估算 Fair</button>'+
    '<span class="sub">按評分・近績・同程往績估算（v1校準：10場數據，信心已調低）；撳數字可手改</span></div>'+
    '<div class="scrollx"><table class="tbl"><thead><tr><th>檔</th><th>馬號</th><th>馬匹</th><th>賠率</th><th>Fair</th><th>Value</th><th>信心</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    pickHtml(rc);
  document.querySelectorAll('#meetPills .pill').forEach(function(b){
    b.onclick=function(){ S.sel.meet=b.getAttribute('data-meet'); var mm=curMeet(); S.sel.race=mm&&mm.races[0]?mm.races[0].id:null; save(); renderRace(); renderValue(); };
  });
  document.querySelectorAll('#racePills .pill').forEach(function(b){
    b.onclick=function(){ S.sel.race=b.getAttribute('data-race'); save(); renderRace(); renderValue(); };
  });
  /* 撳數字手改賠率 / Fair */
  document.querySelectorAll('#raceBody .editable').forEach(function(c){
    c.onclick=function(){
      var f=c.getAttribute('data-f'), num=parseInt(c.getAttribute('data-n'),10);
      var rc2=curRace(); if(!rc2) return;
      var ru=null;
      rc2.runners.forEach(function(x){ if(x.num===num) ru=x; });
      if(!ru) return;
      var v=prompt((f==='odds'?'市場賠率':'Fair（合理賠率）')+' — '+ru.name, (f==='odds'?ru.odds:ru.fair)||'');
      if(v===null) return;
      var nv=parseFloat(v);
      if(f==='odds'){ ru.odds=nv>0?nv:0; }
      else { ru.fair=nv>0?nv:0; ru.fairAuto=false; }
      save(); renderRace(); renderValue();
    };
  });
  /* 撳馬名睇估算理據 */
  document.querySelectorAll('#raceBody .horse').forEach(function(h){
    h.onclick=function(){
      var nm=h.getAttribute('data-horse'), rc2=curRace(); if(!rc2) return;
      var ru=null;
      rc2.runners.forEach(function(x){ if(x.name===nm) ru=x; });
      if(!ru) return;
      var msg=ru.name+'（'+ru.num+'號）\n評分 '+ru.rating+'・近績 '+ru.form;
      if(ru.fairNote) msg+='\n電腦估算：'+ru.fairNote+' → fair '+ru.fairEst;
      if(ru.fair&&!ru.fairAuto) msg+='\nFair（手填）：'+ru.fair;
      alert(msg);
    };
  });
  /* 電腦估算 Fair */
  var eb=document.getElementById('btnEstFair');
  if(eb) eb.onclick=function(){
    var mm=curMeet(), rc2=curRace(); if(!rc2) return;
    var track=((mm&&mm.chip)||'').split(' ')[1]||'';
    estimateFair(rc2, track);
    var n=0;
    rc2.runners.forEach(function(r){
      if(!r.fair&&r.fairEst){ r.fair=r.fairEst; r.fairAuto=true; n++; }
    });
    save(); renderRace(); renderValue();
    alert('已為 '+n+' 匹估算 Fair（有「估」標記）。\n開賽前填返市場賠率，就會計出 value。\n估算只係起點，你識嘅嘢（晨操、換人意圖）電腦唔識——隨時撳數字手改。');
  };
}
function pickHtml(rc){
  var vals = rc.runners.filter(function(r){return tagOf(r)==='value';})
    .sort(function(a,b){return edgePct(b)-edgePct(a);});
  var topSpeed = rc.runners.slice().sort(function(a,b){return (b.speed||0)-(a.speed||0);})[0];
  if(!vals.length) return '<div class="note">呢場暫時冇「有值」嘅馬。有 value 先買——冇就唔買，呢個就係紀律。</div>';
  var p1=vals[0], html='<div class="pick"><b>推介：'+esc(p1.name)+'</b>（'+p1.num+'號）——賠率 '+p1.odds+' 對 fair '+p1.fair+'，錯價 +'+edgePct(p1).toFixed(0)+'%';
  if(topSpeed && topSpeed.name===p1.name && topSpeed.speed) html+='・速度評分全場最高（'+topSpeed.speed+' 分）';
  html+='。';
  if(vals[1]){ var p2=vals[1]; html+='<br><b>次選：'+esc(p2.name)+'</b>——'+p2.odds+' 倍對 '+p2.fair+'，值博率亦唔錯，適合小注。'; }
  var hot=rc.runners.find(function(r){return tagOf(r)==='hot';});
  if(hot) html+='<br>'+esc(hot.name)+'雖然係大熱門，但 '+hot.odds+' 倍偏熱，冇 value 唔建議。';
  return html+'</div>';
}

/* ---------- TAB: 馬匹 ---------- */
function renderHorse(){
  var names=Object.keys(S.horses);
  document.getElementById('horseChips').innerHTML = names.map(function(n){
    return '<button class="chip'+(S.sel.horse===n?' active':'')+'" data-h="'+esc(n)+'">'+esc(n)+'</button>';
  }).join('') || '<span class="sub">未有馬匹數據</span>';
  /* chips 綁定要喺 early return 之前，否則清馬後會撳唔到 */
  document.querySelectorAll('#horseChips .chip').forEach(function(b){
    b.onclick=function(){ S.sel.horse=b.getAttribute('data-h'); save(); renderHorse(); };
  });
  var box=document.getElementById('horseBody');
  /* 未選馬但有數據：自動選第一隻 */
  if(!S.sel.horse&&names.length){ S.sel.horse=names[0]; save(); }
  var h=S.horses[S.sel.horse];
  if(!h){ box.innerHTML='<div class="empty">未有馬匹數據。<br>匯入馬匹往績 CSV，或用樣本數據試下。</div>'; return; }
  var wins=h.form.filter(function(f){return parseInt(f[4],10)===1;}).length;
  var stats=[['<div class="v">'+h.form.length+'戰</div><div class="k">往績 '+wins+'冠</div>'],
             ['<div class="v">'+(h.speed||'—')+'分</div><div class="k">速度評分</div>']];
  var statHtml=stats.map(function(s){return '<div class="stat">'+s[0]+'</div>';}).join('');
  var form=h.form.map(function(f){
    return '<tr><td class="num">'+esc(f[0])+'</td><td>'+esc(f[1])+'</td><td class="num">'+esc(f[2])+'</td><td>'+esc(f[3])+'</td><td><b>'+esc(f[4])+'</b></td><td class="num">'+esc(f[5])+'</td><td class="num">'+esc(f[6])+'</td><td>'+esc(f[7])+'</td></tr>';
  }).join('');
  box.innerHTML='<div class="card"><div class="meet"><h3>'+esc(h.name)+'</h3><span>'+esc(h.info||'')+'</span></div>'+
    '<p class="racesub">'+esc(h.tj||'')+'</p><div class="grid3" style="grid-template-columns:repeat(2,1fr)">'+statHtml+'</div></div>'+
    '<div class="card scrollx" style="padding:6px 10px"><table class="tbl"><thead><tr><th>日期</th><th>馬場</th><th>途程</th><th>場地</th><th>名次</th><th>時間</th><th>負磅</th><th>騎師</th></tr></thead><tbody>'+form+'</tbody></table></div>';
}

/* ---------- TAB: Value ---------- */
function renderValue(){
  var box=document.getElementById('valueBody'), rc=curRace();
  if(!rc){ box.innerHTML='<div class="empty">未有賽事數據。</div>'; return; }
  var vals=rc.runners.filter(function(r){return tagOf(r)==='value';})
    .sort(function(a,b){return edgePct(b)-edgePct(a);});
  if(!vals.length){ box.innerHTML='<div class="empty">呢場暫時冇「有值」嘅馬。<br>有 value 先買——冇就唔買。</div>'; return; }
  box.innerHTML=vals.map(function(r){
    var e=edgePct(r), p=r.fair>0?1/r.fair:0.22,
        kelly=((p*r.odds-1)/(r.odds-1))*100,
        stake=kelly>0?Math.round(S.bankroll*kelly/100*0.5):0;
    return '<div class="vcard"><div class="row"><span class="nm">'+esc(rc.label)+'・'+esc(r.name)+'</span><span class="badge value">有值 +'+e.toFixed(0)+'%</span></div>'+
      '<div class="meta">檔位 '+r.gate+'・評分 '+r.rating+'・信心'+esc(r.conf)+'</div>'+
      '<div class="vgrid"><div>市場賠率<b>'+r.odds+'</b></div><div>Fair odds<b>'+r.fair+'</b></div><div>錯價<b>+'+e.toFixed(0)+'%</b></div><div class="pos">半Kelly 建議<b>'+money(stake)+'</b></div></div></div>';
  }).join('')+'<div class="note">Kelly 用 Fair 隱含勝率（1÷fair）估算：即係假設你嘅 fair 啱，呢個注碼長期唔會清袋。正式落注前請按自己判斷調整。資金設定喺「記賬・資金」分頁。</div>';
}

/* ---------- TAB: 記賬 ---------- */
function betPnl(b){
  if(b.result==='win') return (parseFloat(b.payout)||0)-(parseFloat(b.stake)||0);
  if(b.result==='lose') return -(parseFloat(b.stake)||0);
  return 0;
}
function renderMoney(){
  var settled=S.bets.filter(function(b){return b.result!=='pending';});
  var stake=settled.reduce(function(s,b){return s+(parseFloat(b.stake)||0);},0);
  var pnl=settled.reduce(function(s,b){return s+betPnl(b);},0);
  var roi=stake>0?(pnl/stake*100):0;
  var vBets=S.bets.filter(function(b){return b.valuePick;});
  var vSettled=vBets.filter(function(b){return b.result!=='pending';});
  var vStake=vSettled.reduce(function(s,b){return s+(parseFloat(b.stake)||0);},0);
  var vPnl=vSettled.reduce(function(s,b){return s+betPnl(b);},0);
  var vRoi=vStake>0?(vPnl/vStake*100):0;
  document.getElementById('roiCards').innerHTML=
    statCard((roi>=0?'+':'')+roi.toFixed(1)+'%', roi>=0?'var(--brand)':'var(--neg)', '整體 ROI')+
    statCard(String(S.bets.length), null, '投注注數')+
    statCard(vSettled.length?((vRoi>=0?'+':'')+vRoi.toFixed(1)+'%'):'—', vSettled.length?(vRoi>=0?'var(--value)':'var(--neg)'):null, 'Value 注 ROI');
  var rows=S.bets.slice().reverse().map(function(b){
    var p=betPnl(b), badge=b.result==='win'?'<span class="badge high">中</span>':(b.result==='lose'?'<span class="badge none">唔中</span>':'<span class="badge none">待定</span>');
    var pnlHtml=b.result==='pending'?'<span class="sub">—</span>':'<span class="num" style="color:'+(p>=0?'var(--brand)':'var(--neg)')+'">'+(p>=0?'+':'−')+money(Math.abs(p))+'</span>';
    return '<tr><td class="num">'+esc(b.date)+'</td><td>'+esc(b.race)+'</td><td><span class="horse">'+esc(b.horse)+'</span></td><td>'+esc(b.type)+'</td><td class="num">'+b.odds+'</td><td class="num">'+money(b.stake)+'</td><td>'+badge+'</td><td>'+pnlHtml+'</td><td><button class="btn" data-del="'+b.id+'" style="padding:4px 10px;font-size:12px">刪</button></td></tr>';
  }).join('');
  document.getElementById('ledgerBody').innerHTML = S.bets.length?
    '<table class="tbl"><thead><tr><th>日期</th><th>場次</th><th>馬匹</th><th>種類</th><th>賠率</th><th>注碼</th><th>賽果</th><th>盈虧</th><th></th></tr></thead><tbody>'+rows+'</tbody></table>':
    '<div class="empty">未有投注記錄。上面表格新增第一注，記賬係紀律嘅開始。</div>';
  document.querySelectorAll('#ledgerBody [data-del]').forEach(function(btn){
    btn.onclick=function(){
      var id=btn.getAttribute('data-del');
      S.bets=S.bets.filter(function(b){return b.id!==id;});
      save(); renderMoney();
    };
  });
  document.getElementById('setBank').value=S.bankroll;
  paintKelly();
}
function statCard(v,color,k){
  return '<div class="stat"><div class="v"'+(color?' style="color:'+color+'"':'')+'>'+v+'</div><div class="k">'+k+'</div></div>';
}

/* ---------- 綁定 ---------- */
function todayStr(){ var d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }

function bind(){
  document.querySelectorAll('.tab').forEach(function(b){
    b.onclick=function(){
      document.querySelectorAll('.tab').forEach(function(x){x.classList.remove('active');});
      document.querySelectorAll('.panel').forEach(function(x){x.classList.remove('active');});
      b.classList.add('active');
      document.getElementById('p-'+b.getAttribute('data-tab')).classList.add('active');
    };
  });

  document.getElementById('bDate').value=todayStr();

  document.getElementById('btnAddBet').onclick=function(){
    var horse=document.getElementById('bHorse').value.trim();
    var stake=parseFloat(document.getElementById('bStake').value);
    if(!horse||!(stake>0)){ alert('請填馬匹同注碼'); return; }
    S.bets.push({
      id:uid(),
      date:document.getElementById('bDate').value||todayStr(),
      race:document.getElementById('bRace').value.trim(),
      horse:horse,
      type:document.getElementById('bType').value,
      odds:parseFloat(document.getElementById('bOdds').value)||0,
      stake:stake,
      result:document.getElementById('bResult').value,
      payout:parseFloat(document.getElementById('bPayout').value)||0
    });
    save(); renderMoney();
    document.getElementById('bHorse').value='';
    document.getElementById('bStake').value='';
    document.getElementById('bPayout').value='';
    document.getElementById('bResult').value='pending';
  };

  ['kBank','kProb','kOdds'].forEach(function(id){
    document.getElementById(id).addEventListener('input', paintKelly);
  });
  document.getElementById('btnSetBank').onclick=function(){
    var v=parseFloat(document.getElementById('setBank').value);
    if(v>0){ S.bankroll=v; save(); renderValue(); paintKelly(); }
  };

  document.getElementById('btnExport').onclick=function(){
    var blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
    var a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='hrt-backup-'+todayStr()+'.json';
    document.body.appendChild(a); a.click();
    setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},500);
  };
  document.getElementById('btnImport').onclick=function(){ document.getElementById('fileImport').click(); };
  document.getElementById('fileImport').addEventListener('change', function(e){
    var f=e.target.files[0]; if(!f) return;
    var rd=new FileReader();
    rd.onload=function(){
      try{
        var s=JSON.parse(rd.result);
        if(!s||s.version!==1||!Array.isArray(s.meetings)) throw new Error('bad file');
        S=s; save(); renderAll();
        alert('匯入成功');
      }catch(err){ alert('匯入失敗：檔案格式唔啱'); }
    };
    rd.readAsText(f); e.target.value='';
  });

  document.getElementById('btnCloudUpdate').onclick=function(){
    var st=document.getElementById('cloudStatus');
    st.textContent='更新緊…';
    fetch('data/manifest.json').then(function(r){
      if(!r.ok) throw new Error('no manifest');
      return r.json();
    }).then(function(m){
      return fetch('data/'+m.racecard).then(function(r){
        if(!r.ok) throw new Error('no racecard');
        return r.text();
      }).then(function(t){
        /* 備份用戶手填值（按 場次|馬號），換新 meeting 後還原 */
        var userVals={}, oldNames={};
        var oldM=S.meetings.find(function(x){return x.chip===m.meeting;});
        if(oldM) oldM.races.forEach(function(rc){
          rc.runners.forEach(function(ru){
            userVals[rc.label+'|'+ru.num]={odds:ru.odds,fair:ru.fair,conf:ru.conf,speed:ru.speed};
            oldNames[ru.name]=true;
          });
        });
        /* 成個 meeting 換新：場次順序啱（R1→R10），舊/sample 馬唔殘留 */
        S.meetings=S.meetings.filter(function(x){return x.chip!==m.meeting;});
        var n1=importRaceCSV(t);
        var newM=S.meetings.find(function(x){return x.chip===m.meeting;});
        if(newM){
          newM.races.forEach(function(rc){
            rc.runners.forEach(function(ru){
              var uv=userVals[rc.label+'|'+ru.num];
              if(uv){
                if(!ru.odds&&uv.odds) ru.odds=uv.odds;
                if(!ru.fair&&uv.fair) ru.fair=uv.fair;
                if(uv.conf&&uv.conf!=='中') ru.conf=uv.conf;
                if(!ru.speed&&uv.speed) ru.speed=uv.speed;
              }
            });
          });
          /* 選中新 meeting 第一場 */
          S.sel.meet=newM.id;
          if(newM.races.length) S.sel.race=newM.races[0].id;
        }
        save();
        return fetch('data/'+m.horses).then(function(r){
          if(!r.ok) throw new Error('no horses');
          return r.text();
        }).then(function(t2){
          var n2=importHorseCSV(t2);
          /* 清走舊 meeting 獨有嘅馬（例如上一版英文馬名、sample 馬） */
          var newNames={};
          parseCSV(t2).slice(1).forEach(function(row){
            if(row[0]&&row[0].trim()) newNames[row[0].trim()]=true;
          });
          Object.keys(S.horses).forEach(function(nm){
            if(oldNames[nm]&&!newNames[nm]) delete S.horses[nm];
          });
          if(S.sel.horse&&!S.horses[S.sel.horse]) S.sel.horse='';
          save();
          return {n1:n1,n2:n2,meeting:m.meeting,updated:m.updated};
        });
      });
    }).then(function(res){
      S.sample=false; /* 數據已係真實，樣本徽章改由 hasSample() 按殘留樣本投注決定 */
      save(); renderAll();
      st.textContent='已更新：'+res.meeting;
      alert('更新完成：'+res.n1+' 匹排位＋'+res.n2+' 列往績（'+res.meeting+'）');
    }).catch(function(){
      st.textContent='暫無線上數據，可先用 CSV 匯入';
    });
  };

  document.getElementById('btnRaceCsv').onclick=function(){ document.getElementById('fileRaceCsv').click(); };  document.getElementById('fileRaceCsv').addEventListener('change', function(e){
    var f=e.target.files[0]; if(!f) return;
    var rd=new FileReader();
    rd.onload=function(){
      try{ var n=importRaceCSV(rd.result); renderRace(); renderValue(); alert('匯入 '+n+' 匹馬匹數據'); }
      catch(err){ alert('匯入失敗：'+err.message); }
    };
    rd.readAsText(f,'utf-8'); e.target.value='';
  });
  document.getElementById('btnRaceTpl').onclick=function(){
    csvDownload('race-template.csv','會議chip,會議標題,會議副題,場次,場次資訊,檔位,馬號,馬名,評分,速度評分,近績,賠率,Fair,信心\n11-01 跑馬地,跑馬地・2026-11-01（日）,頭場 13:00 開跑,R3,第三場・第四班・1200米,3,5,電訊飛彈,52,98,2-4-1-3-5-2,4.6,3.8,高\n');
  };
  document.getElementById('btnHorseCsv').onclick=function(){ document.getElementById('fileHorseCsv').click(); };
  document.getElementById('fileHorseCsv').addEventListener('change', function(e){
    var f=e.target.files[0]; if(!f) return;
    var rd=new FileReader();
    rd.onload=function(){
      try{ var n=importHorseCSV(rd.result); renderHorse(); alert('匯入 '+n+' 列往績'); }
      catch(err){ alert('匯入失敗：'+err.message); }
    };
    rd.readAsText(f,'utf-8'); e.target.value='';
  });
  document.getElementById('btnHorseTpl').onclick=function(){
    csvDownload('horse-template.csv','馬名,基本資料,騎練組合,速度評分,日期,馬場,途程,場地,名次,時間,負磅,騎師\n電訊飛彈,5歲・澳洲自購馬・評分 52,練馬師 蔡約翰／騎師 潘頓,98,10-28,沙田,1200,好地,1/12,1:09.2,126,潘頓\n');
  };

  /* 更新賠率：由 manifest 攞 odds CSV，一次填晒成個 meeting 嘅獨贏賠率 */
  document.getElementById('btnOdds').onclick=function(){
    var m=curMeet();
    var st=document.getElementById('oddsStatus');
    if(!m){ st.textContent='未有賽事數據，先撳「從 GitHub 更新數據」'; return; }
    st.textContent='讀緊賠率…';
    fetch('data/manifest.json').then(function(r){
      if(!r.ok) throw new Error('no manifest');
      return r.json();
    }).then(function(mf){
      if(!mf.odds) throw new Error('no odds');
      return fetch('data/'+mf.odds).then(function(r){
        if(!r.ok) throw new Error('no odds file');
        return r.text();
      }).then(function(t){ return {t:t, mf:mf}; });
    }).then(function(x){
      var list=parseOddsCSV(x.t), n=0;
      m.races.forEach(function(rc){
        list.forEach(function(o){
          if(o.race===rc.label){
            rc.runners.forEach(function(r){ if(r.num===o.num&&o.odds>0){ r.odds=o.odds; n++; } });
          }
        });
      });
      S.oddsUpdated=x.mf.oddsUpdated||'';
      save(); renderRace(); renderValue();
      st.textContent='賠率已更新：'+n+' 匹'+(S.oddsUpdated?'（'+S.oddsUpdated+'）':'');
    }).catch(function(){
      st.textContent='未有賠率數據（開賽日先有）';
    });
  };

  var cs=document.getElementById('btnClearSample');
  if(cs) cs.onclick=function(){
    if(!confirm('清除所有樣本數據？（你自己匯入／記錄的數據會保留）')) return;
    S.bets=S.bets.filter(function(b){return !b.sample;});
    S.meetings=S.meetings.filter(function(m){return !m.sample;});
    Object.keys(S.horses).forEach(function(nm){ if(S.horses[nm].sample) delete S.horses[nm]; });
    if(S.sel.meet&&!S.meetings.some(function(m){return m.id===S.sel.meet;})) S.sel.meet=null;
    if(S.sel.race&&!S.meetings.some(function(m){return m.races.some(function(r){return r.id===S.sel.race;});})) S.sel.race=null;
    if(S.sel.horse&&!S.horses[S.sel.horse]) S.sel.horse='';
    S.sample=false;
    save(); renderAll();
  };
}

function paintKelly(){
  var bank=parseFloat(document.getElementById('kBank').value)||S.bankroll||0;
  var p=parseFloat(document.getElementById('kProb').value)||0;
  var o=parseFloat(document.getElementById('kOdds').value)||0;
  var out=document.getElementById('kOut');
  if(o<=1||p<=0||p>=1){ out.innerHTML='輸入勝率（0–1）同賠率（>1）先計到。'; return; }
  var f=(p*o-1)/(o-1);
  if(f<=0){ out.innerHTML='呢個注係 <b>−EV</b>，Kelly 建議：<b>唔買</b>。'; return; }
  out.innerHTML='Kelly 值 <b>'+(f*100).toFixed(1)+'%</b>・半 Kelly 建議注碼 <b>'+money(bank*f/2)+'</b>';
}

function renderAll(){
  var hs=hasSample();
  document.getElementById('sampleTag').style.display=hs?'':'none';
  document.getElementById('sampleCtl').style.display=hs?'':'none';
  var os=document.getElementById('oddsStatus');
  if(os) os.textContent=S.oddsUpdated?('上次賠率更新：'+S.oddsUpdated):'';
  document.getElementById('kBank').value=S.bankroll;
  renderRace(); renderHorse(); renderValue(); renderMoney();
}

bind();
renderAll();
