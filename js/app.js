var players=[],cardPool=[],usedCards=[],roleList=[],roleChecked=[],isFlipping=false;
var storageKey="boardgame_v5";

var lotteryMessages=["外星人攻占地球！","世界大战","特朗普下台了","谁又穿越了","中国队进世界杯","地球停转之日","僵尸已经包围了城市","已开启上帝模式","第六次生物大灭绝","人类已经无法阻止我了"];
var lotteryMsgKey="boardgame_msgs_v1";
function loadLotteryMessages(){try{svrLoad("messages",function(v){if(v&&v.length)lotteryMessages=v});var d=localStorage.getItem(lotteryMsgKey);if(d){var p=JSON.parse(d);if(p&&p.length>0)lotteryMessages=p}}catch(e){}}
function saveLotteryMessages(){try{localStorage.setItem(lotteryMsgKey,JSON.stringify(lotteryMessages));svrSave("messages",lotteryMessages)}catch(e){}}
var AVATARS=[0,1,2,3,4,5,6,7,8,9,10,11];
var avatarPickerIdx=-1;
function avatarImg(i){return "images/photo/"+i+".jpg"}
var timer={total:30,remaining:30,running:false,paused:false,interval:null};
var CIRCUMFERENCE=2*Math.PI*88;
var bgmAudio=null,sfxAudio=null;
var currentWords=[],wordIndex=-1,wordVisible=false;
var WORD_BANKS={animals:["猫","狗","兔子","老虎","大象","熊猫","长颈鹿","企鹅","海豚","蝴蝶","老鹰","鲨鱼","狮子","猴子","斑马","孔雀","鹦鹉","考拉","北极熊","袋鼠"],fruits:["苹果","香蕉","西瓜","葡萄","草莓","橙子","芒果","樱桃","菠萝","柠檬","桃子","梨","荔枝","猕猴桃","石榴","蓝莓","柚子","椰子","甘蔗","柿子"],sports:["篮球","足球","游泳","跑步","网球","排球","乒乓球","羽毛球","滑雪","冲浪","拳击","击剑","瑜伽","举重","体操","跆拳道","射箭","跳高","花样滑冰","自行车"],jobs:["医生","老师","警察","消防员","厨师","飞行员","科学家","艺术家","法官","记者","护士","建筑师","程序员","律师","会计","设计师","兽医","演员","作家","工程师"],movies:["功夫熊猫","冰雪奇缘","疯狂动物城","寻梦环游记","神偷奶爸","玩具总动员","海底总动员","狮子王","飞屋环游记","魔发奇缘","小美人鱼","白雪公主","灰姑娘","睡美人","美女与野兽","阿拉丁","泰山","花木兰","海洋奇缘","超能陆战队"],foods:["火锅","饺子","面条","米饭","包子","春卷","臭豆腐","烤鸭","小龙虾","麻辣烫","寿司","牛排","披萨","意面","汉堡","三明治","沙拉","浓汤","蛋糕","冰淇淋"]};
var scoreRounds=[],scoreCurRound=0,scoreKey="boardgame_score_v1";
function saveScore(){try{localStorage.setItem(scoreKey,JSON.stringify(scoreRounds));svrSave("score",scoreRounds)}catch(e){}}
function loadScore(){try{svrLoad("score",function(v){if(v&&v.length){scoreRounds=v;scoreCurRound=scoreRounds.length-1;scoreRender()}});var d=localStorage.getItem(scoreKey);if(d)scoreRounds=JSON.parse(d);if(scoreRounds.length>0)scoreCurRound=scoreRounds.length-1;else scoreCurRound=0}catch(e){scoreRounds=[]}}
/* ===== 服务端数据持久化 ===== */
var DATA_URL=location.protocol+"//"+location.host+"/api";
function svrSave(key,val){try{fetch(DATA_URL+"/"+key,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({value:val})}).catch(function(){})}catch(e){}}
function svrLoad(key,cb){try{fetch(DATA_URL+"/"+key).then(function(r){return r.json()}).then(function(d){if(d&&d.value!==null&&d.value!==undefined)cb(d.value)}).catch(function(){})}catch(e){}}

function getPlayerTotal(idx){var t=0;for(var i=0;i<scoreRounds.length;i++){var s=scoreRounds[i].scores;if(s&&s[idx]!==undefined)t+=s[idx]}return t}
function go(id){var p=document.querySelectorAll(".page");for(var i=0;i<p.length;i++)p[i].classList.remove("active");document.getElementById(id).classList.add("active")}
function loadPlayers(){var d=localStorage.getItem(storageKey);svrLoad("players",function(v){if(v&&v.length){players=v;renderPlayerList()}});if(!d){initDefaultPlayers();return}players=JSON.parse(d);var oa=["\ud83d\udc36","\ud83d\udc31","\ud83d\udc30","\ud83e\udd8a","\ud83d\udc3c","\ud83d\udc28","\ud83e\udd81","\ud83d\udc2f","\ud83d\udc38","\ud83d\udc35","\ud83e\udd84","\ud83d\udc37"];for(var i=0;i<players.length;i++){if(typeof players[i].avatar==="string"){var idx=oa.indexOf(players[i].avatar);players[i].avatar=idx>=0?idx:0}if(typeof players[i].avatar!=="number"||players[i].avatar<0||players[i].avatar>11)players[i].avatar=i%12}renderPlayerList()}
function initDefaultPlayers(){var c=["#007aff","#34c759","#ff3b30","#ff9500","#af52de"];players=[];for(var i=0;i<5;i++)players.push({name:"玩家"+(i+1),color:c[i],avatar:i});renderPlayerList()}
function renderPlayerList(){var w=document.getElementById("playerList");w.innerHTML="";var c=parseInt(document.getElementById("playerCount").value)||5;while(players.length<c)players.push({name:"新玩家",color:"#007aff",avatar:"\ud83d\udc36"});while(players.length>c)players.pop();for(var i=0;i<players.length;i++){var p=players[i];var it=document.createElement("div");it.className="player-item";var av=document.createElement("div");av.className="avatar-preview";av.style.borderColor=p.color;var ai=document.createElement("img");ai.src=avatarImg(p.avatar);av.onclick=(function(idx){return function(){showAvatarPicker(idx)}})(i);var inp=document.createElement("input");inp.type="text";inp.value=p.name;inp.style.color=p.color;inp.oninput=(function(idx){return function(e){players[idx].name=e.target.value;savePlayers()}})(i);var cb=document.createElement("input");cb.type="color";cb.value=p.color;cb.className="color-btn";cb.onchange=(function(idx,inp2,av2){return function(e){players[idx].color=e.target.value;inp2.style.color=e.target.value;av2.style.borderColor=e.target.value;savePlayers()}})(i,inp,av);it.append(av,inp,cb);w.appendChild(it)}}
document.getElementById("playerCount").onchange=renderPlayerList;
function showAvatarPicker(idx){avatarPickerIdx=idx;var g=document.getElementById("avatarGridPop");g.innerHTML="";for(var i=0;i<12;i++){(function(ii){var d=document.createElement("div");d.className="avatar-opt"+(players[idx].avatar===ii?" sel":"");var di=document.createElement("img");di.src="images/photo/"+ii+".jpg";d.appendChild(di);d.onclick=function(){players[avatarPickerIdx].avatar=ii;renderPlayerList();closeAvatarPop()};g.appendChild(d)})(i)}document.getElementById("avatarPop").style.display="flex"}
function closeAvatarPop(){document.getElementById("avatarPop").style.display="none"}
function savePlayers(){localStorage.setItem(storageKey,JSON.stringify(players));svrSave("players",players);alert("保存成功！")}
function startLottery(){if(players.length===0)return alert("请先设置玩家");var btn=document.getElementById("lotBtn");btn.disabled=true;var dom=document.getElementById("lotTxt");dom.classList.add("rolling");var t=setInterval(function(){var r=Math.floor(Math.random()*players.length);dom.innerText=players[r].name;dom.style.color=players[r].color},70);setTimeout(function(){clearInterval(t);dom.classList.remove("rolling");var win=players[Math.floor(Math.random()*players.length)];dom.innerText="起始："+win.name;btn.disabled=false},3000)}
function initCards(){cardPool=[];usedCards=[];for(var i=1;i<=17;i++)cardPool.push(i);updateCardRemain();updateCardDisplay()}
function updateCardRemain(){var el=document.getElementById("cardRemain");if(el)el.innerText=cardPool.length}
function updateCardDisplay(){var empty=cardPool.length===0;document.getElementById("cardWrap").style.display=empty?"none":"block";document.getElementById("cardEmpty").style.display=empty?"block":"none"}
function flipCard(){if(cardPool.length===0)return;if(isFlipping)return;isFlipping=true;var wrap=document.getElementById("cardWrap");var idx=Math.floor(Math.random()*cardPool.length);var card=cardPool.splice(idx,1)[0];usedCards.push(card);document.getElementById("cardFrontImg").src="images/card/"+card+".jpg";updateCardRemain();wrap.classList.remove("hide");void wrap.offsetWidth;wrap.classList.add("flipped");setTimeout(function(){document.getElementById("bigCardTxt").innerHTML="<img src='images/card/"+card+".jpg' style='height:260px;max-width:90vw;object-fit:contain;border-radius:16px'>";document.getElementById("bigCard").style.display="flex";setTimeout(function(){wrap.classList.remove("hide","flipped");wrap.onclick=function(){flipCard()};isFlipping=false;updateCardDisplay()},100)},600)}
function showUsedCards(){var list=document.getElementById("usedCardList");list.innerHTML="";if(usedCards.length===0){list.innerHTML='<div style="color:#8e8e93;padding:20px;font-size:14px">暂无已抽卡牌</div>'}else{for(var i=0;i<usedCards.length;i++){(function(c){var d=document.createElement("div");d.className="card-small";var di=document.createElement("img");di.src="images/card/"+c+".jpg";d.appendChild(di);d.onclick=function(){document.getElementById("bigCardTxt").innerHTML='<img src="images/card/'+c+'.jpg" style="width:auto;height:auto;max-width:100%;max-height:95vh;object-fit:contain;border-radius:16px">';document.getElementById("bigCard").style.display="flex"};list.appendChild(d)})(usedCards[i])}}document.getElementById("usedPop").style.display="flex"}
function closeUsed(){document.getElementById("usedPop").style.display="none"}
function closeBigCard(){document.getElementById("bigCard").style.display="none"}
function resetCards(){if(isFlipping)return;isFlipping=true;var w=document.getElementById("cardWrap");w.style.transition="transform .6s";w.style.transform="rotate(360deg) scale(0.7)";setTimeout(function(){initCards();w.style.transform="";w.style.transition="";isFlipping=false;document.getElementById("cardFrontImg").src="";document.getElementById("cardWrap").onclick=function(){flipCard()};document.getElementById("cardWrap").style.display="block";document.getElementById("cardEmpty").style.display="none"},600)}
function timerUpdateDisplay(){var m=Math.floor(timer.remaining/60),s=timer.remaining%60;document.getElementById("timerTime").innerText=(m<10?"0":"")+m+":"+(s<10?"0":"")+s;var pr=timer.total>0?timer.remaining/timer.total:0;document.getElementById("timerProgress").style.strokeDashoffset=CIRCUMFERENCE*(1-pr);var w=document.getElementById("timerDisplayWrap"),b=document.getElementById("timerBadge");if(timer.remaining<=0&&timer.total>0){w.classList.add("timer-up");b.className="timer-badge done";b.innerText="时间到！"}else{w.classList.remove("timer-up");if(timer.running){b.className="timer-badge running";b.innerText="正在计时"}else if(timer.paused){b.className="timer-badge paused";b.innerText="已暂停"}else{b.className="timer-badge idle";b.innerText="就绪"}}}
function timerSet(s){if(timer.running)return;timer.total=s;timer.remaining=s;timer.paused=false;timerUpdateDisplay();var ps=document.querySelectorAll(".timer-preset");for(var i=0;i<ps.length;i++){var b=ps[i];if(parseInt(b.dataset.sec)===s)b.classList.add("active");else b.classList.remove("active")}}
function timerStart(){if(timer.remaining<=0){timerReset();return}if(timer.running)return;timer.running=true;timer.paused=false;document.getElementById("timerStartBtn").style.display="none";document.getElementById("timerPauseBtn").style.display="block";timer.interval=setInterval(function(){timer.remaining--;timerUpdateDisplay();if(timer.remaining<=0){clearInterval(timer.interval);timer.running=false;timerTimeUp();document.getElementById("timerStartBtn").style.display="block";document.getElementById("timerPauseBtn").style.display="none"}},1000);timerUpdateDisplay()}
function timerTimeUp(){timerPlayBeep();var fl=document.getElementById("timerFlash");fl.classList.remove("active");void fl.offsetWidth;fl.classList.add("active");setTimeout(function(){fl.classList.remove("active")},1500);if(document.getElementById("timerVoiceToggle").checked)speak("时间到");try{navigator.vibrate([200,100,200,100,200])}catch(e){}}
function timerPause(){if(!timer.running)return;clearInterval(timer.interval);timer.running=false;timer.paused=true;document.getElementById("timerStartBtn").style.display="block";document.getElementById("timerStartBtn").innerText="继续";document.getElementById("timerPauseBtn").style.display="none";timerUpdateDisplay()}
function timerReset(){timerStopAll();timer.remaining=timer.total;timerUpdateDisplay();document.getElementById("timerStartBtn").style.display="block";document.getElementById("timerStartBtn").innerText="开始";document.getElementById("timerPauseBtn").style.display="none";document.getElementById("timerDisplayWrap").classList.remove("timer-up")}
function timerStopAll(){if(timer.interval){clearInterval(timer.interval);timer.interval=null}timer.running=false;timer.paused=false}
function timerPlayBeep(){try{var c=new(window.AudioContext||window.webkitAudioContext)();var o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=880;o.type="sine";g.gain.setValueAtTime(0.4,c.currentTime);g.gain.exponentialRampToValueAtTime(0.01,c.currentTime+0.5);o.start();o.stop(c.currentTime+0.5)}catch(e){}}
(function(){var ps=document.querySelectorAll(".timer-preset");for(var i=0;i<ps.length;i++){(function(b){b.addEventListener("click",function(){timerSet(parseInt(b.dataset.sec))})})(ps[i])}document.getElementById("timerCustomBtn").addEventListener("click",function(){var v=parseInt(document.getElementById("timerCustom").value);if(v&&v>0&&v<=3600)timerSet(v)})})();
function speak(t){try{window.speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(t);u.lang="zh-CN";u.rate=1.0;window.speechSynthesis.speak(u)}catch(e){}}
function bgmPlay(){if(!bgmAudio)return;bgmAudio.play();document.getElementById("bgmPlayBtn").innerText="⏸ 暂停";document.getElementById("bgmPlayBtn").onclick=bgmPause}
function bgmPause(){if(!bgmAudio)return;bgmAudio.pause();document.getElementById("bgmPlayBtn").innerText="▶ 播放";document.getElementById("bgmPlayBtn").onclick=bgmPlay}
function bgmStop(){if(!bgmAudio)return;bgmAudio.pause();bgmAudio.currentTime=0;document.getElementById("bgmPlayBtn").innerText="▶ 播放";document.getElementById("bgmPlayBtn").onclick=bgmPlay;document.getElementById("bgmTime").innerText="00:00 / 00:00"}
function bgmSetVolume(){if(bgmAudio)bgmAudio.volume=parseInt(document.getElementById("bgmVolume").value)/100}
document.getElementById("bgmInput").addEventListener("change",function(e){var f=e.target.files[0];if(!f)return;if(bgmAudio){bgmAudio.pause();bgmAudio=null}var url=URL.createObjectURL(f);bgmAudio=new Audio(url);bgmAudio.loop=document.getElementById("bgmLoop").checked;bgmAudio.volume=parseInt(document.getElementById("bgmVolume").value)/100;bgmAudio.addEventListener("loadedmetadata",function(){var t=bgmAudio.duration,sm=Math.floor(t/60),ss=Math.floor(t%60);document.getElementById("bgmTime").innerText="00:00 / "+(sm<10?"0":"")+sm+":"+(ss<10?"0":"")+ss});bgmAudio.addEventListener("timeupdate",function(){var ct=bgmAudio.currentTime,dt=bgmAudio.duration,cm=Math.floor(ct/60),cs=Math.floor(ct%60),dm=Math.floor(dt/60),ds=Math.floor(dt%60);document.getElementById("bgmTime").innerText=(cm<10?"0":"")+cm+":"+(cs<10?"0":"")+cs+" / "+(dm<10?"0":"")+dm+":"+(ds<10?"0":"")+ds});bgmPlay()});
document.getElementById("bgmLoop").addEventListener("change",function(){if(bgmAudio)bgmAudio.loop=this.checked});
document.getElementById("sfxInput").addEventListener("change",function(e){var f=e.target.files[0];if(!f)return;var url=URL.createObjectURL(f);sfxAudio=new Audio(url);sfxAudio.play()});
function sfxPlay(){if(sfxAudio){sfxAudio.currentTime=0;sfxAudio.play()}}
function buildRoles(){var str=document.getElementById("rolePreset").value;roleList=[];var pts=str.split(",");for(var i=0;i<pts.length;i++){var s=pts[i],sep=s.indexOf("×")!==-1?"×":"x",kv=s.split(sep);if(kv.length!==2)continue;var nm=kv[0].trim(),num=parseInt(kv[1].trim());for(var j=0;j<num;j++)roleList.push(nm)}if(roleList.length!==players.length)return alert("身份数("+roleList.length+")与玩家数("+players.length+")不符");for(var i=roleList.length-1;i>0;i--){var r=Math.floor(Math.random()*(i+1)),tmp=roleList[i];roleList[i]=roleList[r];roleList[r]=tmp}roleChecked=[];for(var i=0;i<players.length;i++)roleChecked.push(false);renderRoleAvatars()}
function renderRoleAvatars(){var w=document.getElementById("roleAvatars");w.innerHTML="";for(var i=0;i<players.length;i++){(function(idx,pl){var it=document.createElement("div");it.className="avatar-item";var av=document.createElement("div");av.className="ava"+(roleChecked[idx]?" checked":"");av.style.borderColor=pl.color;var ai=document.createElement("img");ai.src=avatarImg(pl.avatar);var nm=document.createElement("div");nm.className="ava-name";nm.innerText=pl.name;nm.style.color=pl.color;av.onclick=function(){if(roleChecked[idx])return;roleChecked[idx]=true;renderRoleAvatars();document.getElementById("roleInfo").innerText=pl.name+"："+roleList[idx];document.getElementById("rolePop").style.display="flex";if(document.getElementById("roleVoiceToggle").checked)speak(roleList[idx])};it.append(av,nm);w.appendChild(it)})(i,players[i])}}
function closeRole(){document.getElementById("rolePop").style.display="none"}
function scoreRender(){var list=document.getElementById("scoreList");list.innerHTML="";if(players.length===0){list.innerHTML='<div style="text-align:center;padding:30px;color:#8e8e93">请先在「玩家设置」中添加玩家</div>';return}if(scoreRounds.length===0){scoreRounds.push({scores:{}})}scoreCurRound=Math.min(scoreCurRound,scoreRounds.length-1);document.getElementById("scoreRoundLabel").innerText="第 "+(scoreCurRound+1)+" 局";for(var i=0;i<players.length;i++){(function(idx,pl){var row=document.createElement("div");row.className="score-row";var top=document.createElement("div");top.className="score-row-top";var av=document.createElement("div");av.className="score-row-avatar";av.style.borderColor=pl.color;var ai=document.createElement("img");ai.src=avatarImg(pl.avatar);var nm=document.createElement("div");nm.className="score-row-name";nm.innerText=pl.name;nm.style.color=pl.color;var tl=document.createElement("div");tl.className="score-row-total";tl.innerText=getPlayerTotal(idx);top.append(av,nm,tl);row.appendChild(top);var rv=scoreRounds[scoreCurRound].scores[idx];var rs=document.createElement("div");rs.className="score-row-round";rs.innerText="本局: "+(rv!==undefined?rv:0)+" 分";row.appendChild(rs);var btns=document.createElement("div");btns.className="score-btns";var vals=[1,5,10,-1,-5];for(var vi=0;vi<vals.length;vi++){(function(v){var b=document.createElement("button");b.className=v>0?"scb-p":"scb-n";b.innerText=v>0?"+"+v:v;b.onclick=function(){if(!scoreRounds[scoreCurRound].scores[idx])scoreRounds[scoreCurRound].scores[idx]=0;scoreRounds[scoreCurRound].scores[idx]+=v;saveScore();scoreRender()};btns.appendChild(b)})(vals[vi])}var cusb=document.createElement("button");cusb.className="scb-custom";cusb.innerText="自定义";cusb.onclick=function(){var inp=document.createElement("input");inp.type="number";inp.className="score-custom-input";inp.placeholder="分值";inp.style.display="inline-block";cusb.style.display="none";btns.insertBefore(inp,cusb.nextSibling);inp.focus();inp.onkeydown=function(e){if(e.key==="Enter"){var v=parseInt(inp.value);if(!isNaN(v)&&v!==0){if(!scoreRounds[scoreCurRound].scores[idx])scoreRounds[scoreCurRound].scores[idx]=0;scoreRounds[scoreCurRound].scores[idx]+=v;saveScore();scoreRender()}}}};btns.appendChild(cusb);row.appendChild(btns);list.appendChild(row)})(i,players[i])}}
function scoreNewRound(){if(players.length===0)return alert("请先设置玩家");scoreRounds.push({scores:{}});scoreCurRound=scoreRounds.length-1;saveScore();scoreRender()}
function scoreReset(){if(!confirm("确定重置所有积分数据？"))return;scoreRounds=[];scoreCurRound=0;saveScore();scoreRender()}
function scoreShowDetail(){var pop=document.getElementById("scoreDetailList");pop.innerHTML="";if(scoreRounds.length===0){pop.innerHTML='<div style="color:#8e8e93;padding:20px;text-align:center">暂无数据</div>';document.getElementById("scorePop").style.display="flex";return}var tbl="<table style=\"width:100%;border-collapse:collapse;font-size:14px\">";tbl+="<tr style=\"border-bottom:1px solid #e5e5ea\"><th style=\"padding:8px;text-align:left\">玩家</th>";for(var r=0;r<scoreRounds.length;r++)tbl+="<th style=\"padding:8px;text-align:center\">第"+(r+1)+"局</th>";tbl+="<th style=\"padding:8px;text-align:center;color:#007aff\">总分</th></tr>";for(var i=0;i<players.length;i++){tbl+="<tr style=\"border-bottom:1px solid #f2f2f7\"><td style=\"padding:8px\">"+players[i].name+"</td>";for(var r=0;r<scoreRounds.length;r++){var sv=scoreRounds[r].scores[i]||0;tbl+="<td style=\"padding:8px;text-align:center\">"+(sv>0?"+":"")+sv+"</td>"}tbl+="<td style=\"padding:8px;text-align:center;font-weight:700;color:#007aff\">"+getPlayerTotal(i)+"</td></tr>"}tbl+="</table>";pop.innerHTML=tbl;document.getElementById("scorePop").style.display="flex"}
document.getElementById("wordBank").addEventListener("change",function(){var v=this.value;document.getElementById("wordCustomRow").style.display=v==="custom"?"flex":"none";if(v!=="custom"){currentWords=WORD_BANKS[v]||[];wordIndex=-1;wordVisible=false;document.getElementById("wordText").innerText="点击下方开始";document.getElementById("wordText").classList.add("hidden");updateWordCounter()}});
function importCustomWords(){var inp=document.getElementById("wordCustomInput").value;var ws=inp.split(",").map(function(w){return w.trim()}).filter(function(w){return w.length>0});if(ws.length===0)return alert("请输入至少一个词语");currentWords=ws;wordIndex=-1;wordVisible=false;document.getElementById("wordText").innerText="点击下方开始";document.getElementById("wordText").classList.add("hidden");updateWordCounter()}
function nextWord(){if(currentWords.length===0)return;wordIndex=(wordIndex+1)%currentWords.length;wordVisible=false;document.getElementById("wordText").innerText=currentWords[wordIndex];document.getElementById("wordText").classList.add("hidden");updateWordCounter();document.getElementById("wordText").classList.remove("hidden");void document.getElementById("wordText").offsetWidth;document.getElementById("wordText").classList.add("hidden")}
function toggleWord(){if(currentWords.length===0||wordIndex<0)return;wordVisible=!wordVisible;if(wordVisible)document.getElementById("wordText").classList.remove("hidden");else document.getElementById("wordText").classList.add("hidden")}
function shuffleWords(){if(currentWords.length===0)return;for(var i=currentWords.length-1;i>0;i--){var r=Math.floor(Math.random()*(i+1)),tmp=currentWords[i];currentWords[i]=currentWords[r];currentWords[r]=tmp}wordIndex=-1;wordVisible=false;document.getElementById("wordText").innerText="已随机打乱";document.getElementById("wordText").classList.add("hidden");updateWordCounter();setTimeout(function(){nextWord()},500)}
function resetWords(){var v=document.getElementById("wordBank").value;if(v!=="custom")currentWords=WORD_BANKS[v]||[];else currentWords=[];wordIndex=-1;wordVisible=false;document.getElementById("wordText").innerText="点击下方开始";document.getElementById("wordText").classList.add("hidden");updateWordCounter()}
function updateWordCounter(){document.getElementById("wordCounter").innerText="第 "+(wordIndex<0?0:wordIndex+1)+" / "+currentWords.length+" 个词"}
window.onload=function(){loadPlayers();initCards();timerSet(30);loadScore();currentWords=WORD_BANKS.animals;wordIndex=-1;go("pageHome");if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js")};

/* ===== 起始玩家 - 全屏炫酷摇号 ===== */
var lotteryRunning = false;
startLottery = function() {
  if (players.length === 0) return alert('请先在「玩家设置」中添加玩家');
  if (lotteryRunning) return;
  lotteryRunning = true;
  
  var dom = document.getElementById('lotTxt');
  var icon = document.getElementById('lotIcon');
  var ring = document.getElementById('lotRing');
  var sub = document.getElementById('lotSub');
  
  dom.className = 'lottery-name';
  void dom.offsetWidth;
  dom.className = 'lottery-name rolling';
  if (icon) { icon.className = 'lottery-icon spinning'; }
  if (ring) { ring.className = 'lottery-ring spinning'; }
  if (sub) sub.style.display = 'none';
  
  var steps = 0;
  var maxSteps = 22 + Math.floor(Math.random() * 18);
  
  (function nextStep() {
    var idx = Math.floor(Math.random() * players.length);
    dom.innerText = lotteryMessages[Math.floor(Math.random()*lotteryMessages.length)];
    dom.style.color = "#ffd700";
    steps++;
    
    if (steps < maxSteps) {
      var progress = steps / maxSteps;
      var delay = 40 + Math.pow(progress, 3.5) * 500;
      setTimeout(nextStep, Math.floor(delay));
    } else {
      var win = players[Math.floor(Math.random() * players.length)];
      dom.innerText = '🏆 ' + win.name
      dom.style.color = win.color;
      
      dom.className = 'lottery-name winner';
      if (icon) icon.className = 'lottery-icon winner';
      if (ring) ring.className = 'lottery-ring winner';
      
      setTimeout(function() {
        lotteryRunning = false;
        dom.className = 'lottery-name';
        dom.innerText = '点击摇号';
        dom.style.color = '';
        if (icon) icon.className = 'lottery-icon';
        if (ring) ring.className = 'lottery-ring';
        if (sub) { sub.style.display = 'block'; sub.innerText = '点击屏幕重新摇号'; } document.getElementById('lotMsgToggle').style.display='block';
      }, 3000);
    }
  })();
};

/* ===== 卡牌双指缩放 ===== */
function initPinchZoom() {
  var el = document.getElementById('bigCardTxt');
  if (!el) return;
  var s = 1, ld = 0;
  
  el.addEventListener('touchstart', function(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      ld = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    }
  }, { passive: false });
  
  el.addEventListener('touchmove', function(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      var d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      s = Math.max(0.5, Math.min(3, s * (d / (ld || 1))));
      el.style.transform = 'scale(' + s + ')';
      ld = d;
    }
  }, { passive: false });
  
  el.addEventListener('touchend', function() { ld = 0; });
  el.addEventListener('dblclick', function() { s = s === 1 ? 2 : 1; el.style.transform = 'scale(' + s + ')'; });
}

// Init pinch zoom on page load
var origOnload = window.onload;


/* ===== 恶搞消息编辑 ===== */
function toggleMsgEditor(){var e=document.getElementById("msgEditor");e.style.display=e.style.display==="flex"?"none":"flex";if(e.style.display==="flex"){document.getElementById("msgTextarea").value=lotteryMessages.join("\n")}}
function saveMsgEditor(){var v=document.getElementById("msgTextarea").value;var arr=v.split("\n").map(function(s){return s.trim()}).filter(function(s){return s.length>0});if(arr.length===0)return alert("至少需要一个消息！");lotteryMessages=arr;saveLotteryMessages();document.getElementById("msgEditor").style.display="none";alert("保存成功！")}

/* ===== 数据导入/导出（跨设备同步） ===== */
function exportData(){try{var d={players:players,messages:lotteryMessages,scores:scoreRounds};var blob=new Blob([JSON.stringify(d,null,2)],{type:"application/json"});var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="boardgame_data_" + new Date().toISOString().slice(0,10) + ".json";a.click();URL.revokeObjectURL(a.href)}catch(e){alert("导出失败："+e.message)}}
function importData(){var inp=document.getElementById("importFileInput");if(!inp){inp=document.createElement("input");inp.id="importFileInput";inp.type="file";inp.accept=".json";inp.style.display="none";document.body.appendChild(inp)}inp.onchange=function(e){var file=e.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(ev){try{var d=JSON.parse(ev.target.result);if(d.players){players=d.players;localStorage.setItem(storageKey,JSON.stringify(players));renderPlayerList()}if(d.messages){lotteryMessages=d.messages;saveLotteryMessages()}if(d.scores){scoreRounds=d.scores;saveScore();scoreRender()}alert("导入成功！")}catch(e){alert("导入失败："+e.message)}};reader.readAsText(file)};inp.click()}
window.onload = function() {
  if (origOnload) origOnload();loadLotteryMessages();
  setTimeout(initPinchZoom, 500);
};
