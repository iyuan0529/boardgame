var players=[],cardPool=[],usedCards=[],roleList=[],roleChecked=[],isFlipping=false;
var storageKey="boardgame_v5";

var lotteryMessages=["澶栨槦浜烘敾鍗犲湴鐞冿紒","涓栫晫澶ф垬","鐗规湕鏅笅鍙颁簡","璋佸張绌胯秺浜?,"涓浗闃熻繘涓栫晫鏉?,"鍦扮悆鍋滆浆涔嬫棩","鍍靛案宸茬粡鍖呭洿浜嗗煄甯?,"宸插紑鍚笂甯濇ā寮?,"绗叚娆＄敓鐗╁ぇ鐏粷","浜虹被宸茬粡鏃犳硶闃绘鎴戜簡"];
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
var WORD_BANKS={animals:["鐚?,"鐙?,"鍏斿瓙","鑰佽檸","澶ц薄","鐔婄尗","闀块楣?,"浼侀箙","娴疯睔","铦磋澏","鑰侀拱","椴ㄩ奔","鐙瓙","鐚村瓙","鏂戦┈","瀛旈泙","楣﹂箟","鑰冩媺","鍖楁瀬鐔?,"琚嬮紶"],fruits:["鑻规灉","棣欒晧","瑗跨摐","钁¤悇","鑽夎帗","姗欏瓙","鑺掓灉","妯辨","鑿犺悵","鏌犳","妗冨瓙","姊?,"鑽旀灊","鐚曠尨妗?,"鐭虫Υ","钃濊帗","鏌氬瓙","妞板瓙","鐢樿敆","鏌垮瓙"],sports:["绡悆","瓒崇悆","娓告吵","璺戞","缃戠悆","鎺掔悆","涔掍箵鐞?,"缇芥瘺鐞?,"婊戦洩","鍐叉氮","鎷冲嚮","鍑诲墤","鐟滀冀","涓鹃噸","浣撴搷","璺嗘嫵閬?,"灏勭","璺抽珮","鑺辨牱婊戝啺","鑷杞?],jobs:["鍖荤敓","鑰佸笀","璀﹀療","娑堥槻鍛?,"鍘ㄥ笀","椋炶鍛?,"绉戝瀹?,"鑹烘湳瀹?,"娉曞畼","璁拌€?,"鎶ゅ＋","寤虹瓚甯?,"绋嬪簭鍛?,"寰嬪笀","浼氳","璁捐甯?,"鍏藉尰","婕斿憳","浣滃","宸ョ▼甯?],movies:["鍔熷か鐔婄尗","鍐伴洩濂囩紭","鐤媯鍔ㄧ墿鍩?,"瀵绘ⅵ鐜父璁?,"绁炲伔濂剁埜","鐜╁叿鎬诲姩鍛?,"娴峰簳鎬诲姩鍛?,"鐙瓙鐜?,"椋炲眿鐜父璁?,"榄斿彂濂囩紭","灏忕編浜洪奔","鐧介洩鍏富","鐏板濞?,"鐫＄編浜?,"缇庡コ涓庨噹鍏?,"闃挎媺涓?,"娉板北","鑺辨湪鍏?,"娴锋磱濂囩紭","瓒呰兘闄嗘垬闃?],foods:["鐏攨","楗哄瓙","闈㈡潯","绫抽キ","鍖呭瓙","鏄ュ嵎","鑷眴鑵?,"鐑ら腑","灏忛緳铏?,"楹昏荆鐑?,"瀵垮徃","鐗涙帓","鎶惃","鎰忛潰","姹夊牎","涓夋槑娌?,"娌欐媺","娴撴堡","铔嬬硶","鍐版穱娣?]};
var scoreRounds=[],scoreCurRound=0,scoreKey="boardgame_score_v1";
function saveScore(){try{localStorage.setItem(scoreKey,JSON.stringify(scoreRounds));svrSave("score",scoreRounds)}catch(e){}}
function loadScore(){try{svrLoad("score",function(v){if(v&&v.length){scoreRounds=v;scoreCurRound=scoreRounds.length-1;scoreRender()}});var d=localStorage.getItem(scoreKey);if(d)scoreRounds=JSON.parse(d);if(scoreRounds.length>0)scoreCurRound=scoreRounds.length-1;else scoreCurRound=0}catch(e){scoreRounds=[]}}
/* ===== 鏈嶅姟绔暟鎹寔涔呭寲 ===== */
var DATA_URL=location.protocol+"//"+location.host+"/api";
function svrSave(key,val){try{fetch(DATA_URL+"/"+key,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({value:val})}).catch(function(){})}catch(e){}}
function svrLoad(key,cb){try{fetch(DATA_URL+"/"+key).then(function(r){return r.json()}).then(function(d){if(d&&d.value!==null&&d.value!==undefined)cb(d.value)}).catch(function(){})}catch(e){}}

function getPlayerTotal(idx){var t=0;for(var i=0;i<scoreRounds.length;i++){var s=scoreRounds[i].scores;if(s&&s[idx]!==undefined)t+=s[idx]}return t}
function go(id){var p=document.querySelectorAll(".page");for(var i=0;i<p.length;i++)p[i].classList.remove("active");document.getElementById(id).classList.add("active")}
function loadPlayers(){var d=localStorage.getItem(storageKey);svrLoad("players",function(v){if(v&&v.length){players=v;renderPlayerList()}});if(!d){initDefaultPlayers();return}players=JSON.parse(d);var oa=["\ud83d\udc36","\ud83d\udc31","\ud83d\udc30","\ud83e\udd8a","\ud83d\udc3c","\ud83d\udc28","\ud83e\udd81","\ud83d\udc2f","\ud83d\udc38","\ud83d\udc35","\ud83e\udd84","\ud83d\udc37"];for(var i=0;i<players.length;i++){if(typeof players[i].avatar==="string"){var idx=oa.indexOf(players[i].avatar);players[i].avatar=idx>=0?idx:0}if(typeof players[i].avatar!=="number"||players[i].avatar<0||players[i].avatar>11)players[i].avatar=i%12}renderPlayerList()}
function initDefaultPlayers(){var c=["#007aff","#34c759","#ff3b30","#ff9500","#af52de"];players=[];for(var i=0;i<5;i++)players.push({name:"鐜╁"+(i+1),color:c[i],avatar:i});renderPlayerList()}
function renderPlayerList(){var w=document.getElementById("playerList");w.innerHTML="";var c=parseInt(document.getElementById("playerCount").value)||5;while(players.length<c)players.push({name:"鏂扮帺瀹?,color:"#007aff",avatar:"\ud83d\udc36"});while(players.length>c)players.pop();for(var i=0;i<players.length;i++){var p=players[i];var it=document.createElement("div");it.className="player-item";var av=document.createElement("div");av.className="avatar-preview";av.style.borderColor=p.color;var ai=document.createElement("img");ai.src=avatarImg(p.avatar);av.onclick=(function(idx){return function(){showAvatarPicker(idx)}})(i);var inp=document.createElement("input");inp.type="text";inp.value=p.name;inp.style.color=p.color;inp.oninput=(function(idx){return function(e){players[idx].name=e.target.value;savePlayers()}})(i);var cb=document.createElement("input");cb.type="color";cb.value=p.color;cb.className="color-btn";cb.onchange=(function(idx,inp2,av2){return function(e){players[idx].color=e.target.value;inp2.style.color=e.target.value;av2.style.borderColor=e.target.value;savePlayers()}})(i,inp,av);it.append(av,inp,cb);w.appendChild(it)}}
document.getElementById("playerCount").onchange=renderPlayerList;
function showAvatarPicker(idx){avatarPickerIdx=idx;var g=document.getElementById("avatarGridPop");g.innerHTML="";for(var i=0;i<12;i++){(function(ii){var d=document.createElement("div");d.className="avatar-opt"+(players[idx].avatar===ii?" sel":"");var di=document.createElement("img");di.src="images/photo/"+ii+".jpg";d.appendChild(di);d.onclick=function(){players[avatarPickerIdx].avatar=ii;renderPlayerList();closeAvatarPop()};g.appendChild(d)})(i)}document.getElementById("avatarPop").style.display="flex"}
function closeAvatarPop(){document.getElementById("avatarPop").style.display="none"}
function savePlayers(){localStorage.setItem(storageKey,JSON.stringify(players));svrSave("players",players);alert("淇濆瓨鎴愬姛锛?)}
function startLottery(){if(players.length===0)return alert("璇峰厛璁剧疆鐜╁");var btn=document.getElementById("lotBtn");btn.disabled=true;var dom=document.getElementById("lotTxt");dom.classList.add("rolling");var t=setInterval(function(){var r=Math.floor(Math.random()*players.length);dom.innerText=players[r].name;dom.style.color=players[r].color},70);setTimeout(function(){clearInterval(t);dom.classList.remove("rolling");var win=players[Math.floor(Math.random()*players.length)];dom.innerText="璧峰锛?+win.name;btn.disabled=false},3000)}
function initCards(){cardPool=[];usedCards=[];for(var i=1;i<=17;i++)cardPool.push(i);updateCardRemain();updateCardDisplay()}
function updateCardRemain(){var el=document.getElementById("cardRemain");if(el)el.innerText=cardPool.length}
function updateCardDisplay(){var empty=cardPool.length===0;document.getElementById("cardWrap").style.display=empty?"none":"block";document.getElementById("cardEmpty").style.display=empty?"block":"none"}
function flipCard(){if(cardPool.length===0)return;if(isFlipping)return;isFlipping=true;var wrap=document.getElementById("cardWrap");var idx=Math.floor(Math.random()*cardPool.length);var card=cardPool.splice(idx,1)[0];usedCards.push(card);document.getElementById("cardFrontImg").src="images/card/"+card+".jpg";updateCardRemain();wrap.classList.remove("hide");void wrap.offsetWidth;wrap.classList.add("flipped");setTimeout(function(){document.getElementById("bigCardTxt").innerHTML="<img src='images/card/"+card+".jpg' style='height:260px;max-width:90vw;object-fit:contain;border-radius:16px'>";document.getElementById("bigCard").style.display="flex";setTimeout(function(){wrap.classList.remove("hide","flipped");wrap.onclick=function(){flipCard()};isFlipping=false;updateCardDisplay()},100)},600)}
function showUsedCards(){var list=document.getElementById("usedCardList");list.innerHTML="";if(usedCards.length===0){list.innerHTML='<div style="color:#8e8e93;padding:20px;font-size:14px">鏆傛棤宸叉娊鍗＄墝</div>'}else{for(var i=0;i<usedCards.length;i++){(function(c){var d=document.createElement("div");d.className="card-small";var di=document.createElement("img");di.src="images/card/"+c+".jpg";d.appendChild(di);d.onclick=function(){document.getElementById("bigCardTxt").innerHTML='<img src="images/card/'+c+'.jpg" style="width:auto;height:auto;max-width:100%;max-height:95vh;object-fit:contain;border-radius:16px">';document.getElementById("bigCard").style.display="flex"};list.appendChild(d)})(usedCards[i])}}document.getElementById("usedPop").style.display="flex"}
function closeUsed(){document.getElementById("usedPop").style.display="none"}
function closeBigCard(){document.getElementById("bigCard").style.display="none"}
function resetCards(){if(isFlipping)return;isFlipping=true;var w=document.getElementById("cardWrap");w.style.transition="transform .6s";w.style.transform="rotate(360deg) scale(0.7)";setTimeout(function(){initCards();w.style.transform="";w.style.transition="";isFlipping=false;document.getElementById("cardFrontImg").src="";document.getElementById("cardWrap").onclick=function(){flipCard()};document.getElementById("cardWrap").style.display="block";document.getElementById("cardEmpty").style.display="none"},600)}
function timerUpdateDisplay(){var m=Math.floor(timer.remaining/60),s=timer.remaining%60;document.getElementById("timerTime").innerText=(m<10?"0":"")+m+":"+(s<10?"0":"")+s;var pr=timer.total>0?timer.remaining/timer.total:0;document.getElementById("timerProgress").style.strokeDashoffset=CIRCUMFERENCE*(1-pr);var w=document.getElementById("timerDisplayWrap"),b=document.getElementById("timerBadge");if(timer.remaining<=0&&timer.total>0){w.classList.add("timer-up");b.className="timer-badge done";b.innerText="鏃堕棿鍒帮紒"}else{w.classList.remove("timer-up");if(timer.running){b.className="timer-badge running";b.innerText="姝ｅ湪璁℃椂"}else if(timer.paused){b.className="timer-badge paused";b.innerText="宸叉殏鍋?}else{b.className="timer-badge idle";b.innerText="灏辩华"}}}
function timerSet(s){if(timer.running)return;timer.total=s;timer.remaining=s;timer.paused=false;timerUpdateDisplay();var ps=document.querySelectorAll(".timer-preset");for(var i=0;i<ps.length;i++){var b=ps[i];if(parseInt(b.dataset.sec)===s)b.classList.add("active");else b.classList.remove("active")}}
function timerStart(){if(timer.remaining<=0){timerReset();return}if(timer.running)return;timer.running=true;timer.paused=false;document.getElementById("timerStartBtn").style.display="none";document.getElementById("timerPauseBtn").style.display="block";timer.interval=setInterval(function(){timer.remaining--;timerUpdateDisplay();if(timer.remaining<=0){clearInterval(timer.interval);timer.running=false;timerTimeUp();document.getElementById("timerStartBtn").style.display="block";document.getElementById("timerPauseBtn").style.display="none"}},1000);timerUpdateDisplay()}
function timerTimeUp(){timerPlayBeep();var fl=document.getElementById("timerFlash");fl.classList.remove("active");void fl.offsetWidth;fl.classList.add("active");setTimeout(function(){fl.classList.remove("active")},1500);if(document.getElementById("timerVoiceToggle").checked)speak("鏃堕棿鍒?);try{navigator.vibrate([200,100,200,100,200])}catch(e){}}
function timerPause(){if(!timer.running)return;clearInterval(timer.interval);timer.running=false;timer.paused=true;document.getElementById("timerStartBtn").style.display="block";document.getElementById("timerStartBtn").innerText="缁х画";document.getElementById("timerPauseBtn").style.display="none";timerUpdateDisplay()}
function timerReset(){timerStopAll();timer.remaining=timer.total;timerUpdateDisplay();document.getElementById("timerStartBtn").style.display="block";document.getElementById("timerStartBtn").innerText="寮€濮?;document.getElementById("timerPauseBtn").style.display="none";document.getElementById("timerDisplayWrap").classList.remove("timer-up")}
function timerStopAll(){if(timer.interval){clearInterval(timer.interval);timer.interval=null}timer.running=false;timer.paused=false}
function timerPlayBeep(){try{var c=new(window.AudioContext||window.webkitAudioContext)();var o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=880;o.type="sine";g.gain.setValueAtTime(0.4,c.currentTime);g.gain.exponentialRampToValueAtTime(0.01,c.currentTime+0.5);o.start();o.stop(c.currentTime+0.5)}catch(e){}}
(function(){var ps=document.querySelectorAll(".timer-preset");for(var i=0;i<ps.length;i++){(function(b){b.addEventListener("click",function(){timerSet(parseInt(b.dataset.sec))})})(ps[i])}document.getElementById("timerCustomBtn").addEventListener("click",function(){var v=parseInt(document.getElementById("timerCustom").value);if(v&&v>0&&v<=3600)timerSet(v)})})();
function speak(t){try{window.speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(t);u.lang="zh-CN";u.rate=1.0;window.speechSynthesis.speak(u)}catch(e){}}
function bgmPlay(){if(!bgmAudio)return;bgmAudio.play();document.getElementById("bgmPlayBtn").innerText="鈴?鏆傚仠";document.getElementById("bgmPlayBtn").onclick=bgmPause}
function bgmPause(){if(!bgmAudio)return;bgmAudio.pause();document.getElementById("bgmPlayBtn").innerText="鈻?鎾斁";document.getElementById("bgmPlayBtn").onclick=bgmPlay}
function bgmStop(){if(!bgmAudio)return;bgmAudio.pause();bgmAudio.currentTime=0;document.getElementById("bgmPlayBtn").innerText="鈻?鎾斁";document.getElementById("bgmPlayBtn").onclick=bgmPlay;document.getElementById("bgmTime").innerText="00:00 / 00:00"}
function bgmSetVolume(){if(bgmAudio)bgmAudio.volume=parseInt(document.getElementById("bgmVolume").value)/100}
document.getElementById("bgmInput").addEventListener("change",function(e){var f=e.target.files[0];if(!f)return;if(bgmAudio){bgmAudio.pause();bgmAudio=null}var url=URL.createObjectURL(f);bgmAudio=new Audio(url);bgmAudio.loop=document.getElementById("bgmLoop").checked;bgmAudio.volume=parseInt(document.getElementById("bgmVolume").value)/100;bgmAudio.addEventListener("loadedmetadata",function(){var t=bgmAudio.duration,sm=Math.floor(t/60),ss=Math.floor(t%60);document.getElementById("bgmTime").innerText="00:00 / "+(sm<10?"0":"")+sm+":"+(ss<10?"0":"")+ss});bgmAudio.addEventListener("timeupdate",function(){var ct=bgmAudio.currentTime,dt=bgmAudio.duration,cm=Math.floor(ct/60),cs=Math.floor(ct%60),dm=Math.floor(dt/60),ds=Math.floor(dt%60);document.getElementById("bgmTime").innerText=(cm<10?"0":"")+cm+":"+(cs<10?"0":"")+cs+" / "+(dm<10?"0":"")+dm+":"+(ds<10?"0":"")+ds});bgmPlay()});
document.getElementById("bgmLoop").addEventListener("change",function(){if(bgmAudio)bgmAudio.loop=this.checked});
document.getElementById("sfxInput").addEventListener("change",function(e){var f=e.target.files[0];if(!f)return;var url=URL.createObjectURL(f);sfxAudio=new Audio(url);sfxAudio.play()});
function sfxPlay(){if(sfxAudio){sfxAudio.currentTime=0;sfxAudio.play()}}
function buildRoles(){var str=document.getElementById("rolePreset").value;roleList=[];var pts=str.split(",");for(var i=0;i<pts.length;i++){var s=pts[i],sep=s.indexOf("脳")!==-1?"脳":"x",kv=s.split(sep);if(kv.length!==2)continue;var nm=kv[0].trim(),num=parseInt(kv[1].trim());for(var j=0;j<num;j++)roleList.push(nm)}if(roleList.length!==players.length)return alert("韬唤鏁?"+roleList.length+")涓庣帺瀹舵暟("+players.length+")涓嶇");for(var i=roleList.length-1;i>0;i--){var r=Math.floor(Math.random()*(i+1)),tmp=roleList[i];roleList[i]=roleList[r];roleList[r]=tmp}roleChecked=[];for(var i=0;i<players.length;i++)roleChecked.push(false);renderRoleAvatars()}
function renderRoleAvatars(){var w=document.getElementById("roleAvatars");w.innerHTML="";for(var i=0;i<players.length;i++){(function(idx,pl){var it=document.createElement("div");it.className="avatar-item";var av=document.createElement("div");av.className="ava"+(roleChecked[idx]?" checked":"");av.style.borderColor=pl.color;var ai=document.createElement("img");ai.src=avatarImg(pl.avatar);var nm=document.createElement("div");nm.className="ava-name";nm.innerText=pl.name;nm.style.color=pl.color;av.onclick=function(){if(roleChecked[idx])return;roleChecked[idx]=true;renderRoleAvatars();document.getElementById("roleInfo").innerText=pl.name+"锛?+roleList[idx];document.getElementById("rolePop").style.display="flex";if(document.getElementById("roleVoiceToggle").checked)speak(roleList[idx])};it.append(av,nm);w.appendChild(it)})(i,players[i])}}
function closeRole(){document.getElementById("rolePop").style.display="none"}
function scoreRender(){var list=document.getElementById("scoreList");list.innerHTML="";if(players.length===0){list.innerHTML='<div style="text-align:center;padding:30px;color:#8e8e93">璇峰厛鍦ㄣ€岀帺瀹惰缃€嶄腑娣诲姞鐜╁</div>';return}if(scoreRounds.length===0){scoreRounds.push({scores:{}})}scoreCurRound=Math.min(scoreCurRound,scoreRounds.length-1);document.getElementById("scoreRoundLabel").innerText="绗?"+(scoreCurRound+1)+" 灞€";for(var i=0;i<players.length;i++){(function(idx,pl){var row=document.createElement("div");row.className="score-row";var top=document.createElement("div");top.className="score-row-top";var av=document.createElement("div");av.className="score-row-avatar";av.style.borderColor=pl.color;var ai=document.createElement("img");ai.src=avatarImg(pl.avatar);var nm=document.createElement("div");nm.className="score-row-name";nm.innerText=pl.name;nm.style.color=pl.color;var tl=document.createElement("div");tl.className="score-row-total";tl.innerText=getPlayerTotal(idx);top.append(av,nm,tl);row.appendChild(top);var rv=scoreRounds[scoreCurRound].scores[idx];var rs=document.createElement("div");rs.className="score-row-round";rs.innerText="鏈眬: "+(rv!==undefined?rv:0)+" 鍒?;row.appendChild(rs);var btns=document.createElement("div");btns.className="score-btns";var vals=[1,5,10,-1,-5];for(var vi=0;vi<vals.length;vi++){(function(v){var b=document.createElement("button");b.className=v>0?"scb-p":"scb-n";b.innerText=v>0?"+"+v:v;b.onclick=function(){if(!scoreRounds[scoreCurRound].scores[idx])scoreRounds[scoreCurRound].scores[idx]=0;scoreRounds[scoreCurRound].scores[idx]+=v;saveScore();scoreRender()};btns.appendChild(b)})(vals[vi])}var cusb=document.createElement("button");cusb.className="scb-custom";cusb.innerText="鑷畾涔?;cusb.onclick=function(){var inp=document.createElement("input");inp.type="number";inp.className="score-custom-input";inp.placeholder="鍒嗗€?;inp.style.display="inline-block";cusb.style.display="none";btns.insertBefore(inp,cusb.nextSibling);inp.focus();inp.onkeydown=function(e){if(e.key==="Enter"){var v=parseInt(inp.value);if(!isNaN(v)&&v!==0){if(!scoreRounds[scoreCurRound].scores[idx])scoreRounds[scoreCurRound].scores[idx]=0;scoreRounds[scoreCurRound].scores[idx]+=v;saveScore();scoreRender()}}}};btns.appendChild(cusb);row.appendChild(btns);list.appendChild(row)})(i,players[i])}}
function scoreNewRound(){if(players.length===0)return alert("璇峰厛璁剧疆鐜╁");scoreRounds.push({scores:{}});scoreCurRound=scoreRounds.length-1;saveScore();scoreRender()}
function scoreReset(){if(!confirm("纭畾閲嶇疆鎵€鏈夌Н鍒嗘暟鎹紵"))return;scoreRounds=[];scoreCurRound=0;saveScore();scoreRender()}
function scoreShowDetail(){var pop=document.getElementById("scoreDetailList");pop.innerHTML="";if(scoreRounds.length===0){pop.innerHTML='<div style="color:#8e8e93;padding:20px;text-align:center">鏆傛棤鏁版嵁</div>';document.getElementById("scorePop").style.display="flex";return}var tbl="<table style=\"width:100%;border-collapse:collapse;font-size:14px\">";tbl+="<tr style=\"border-bottom:1px solid #e5e5ea\"><th style=\"padding:8px;text-align:left\">鐜╁</th>";for(var r=0;r<scoreRounds.length;r++)tbl+="<th style=\"padding:8px;text-align:center\">绗?+(r+1)+"灞€</th>";tbl+="<th style=\"padding:8px;text-align:center;color:#007aff\">鎬诲垎</th></tr>";for(var i=0;i<players.length;i++){tbl+="<tr style=\"border-bottom:1px solid #f2f2f7\"><td style=\"padding:8px\">"+players[i].name+"</td>";for(var r=0;r<scoreRounds.length;r++){var sv=scoreRounds[r].scores[i]||0;tbl+="<td style=\"padding:8px;text-align:center\">"+(sv>0?"+":"")+sv+"</td>"}tbl+="<td style=\"padding:8px;text-align:center;font-weight:700;color:#007aff\">"+getPlayerTotal(i)+"</td></tr>"}tbl+="</table>";pop.innerHTML=tbl;document.getElementById("scorePop").style.display="flex"}
document.getElementById("wordBank").addEventListener("change",function(){var v=this.value;document.getElementById("wordCustomRow").style.display=v==="custom"?"flex":"none";if(v!=="custom"){currentWords=WORD_BANKS[v]||[];wordIndex=-1;wordVisible=false;document.getElementById("wordText").innerText="鐐瑰嚮涓嬫柟寮€濮?;document.getElementById("wordText").classList.add("hidden");updateWordCounter()}});
function importCustomWords(){var inp=document.getElementById("wordCustomInput").value;var ws=inp.split(",").map(function(w){return w.trim()}).filter(function(w){return w.length>0});if(ws.length===0)return alert("璇疯緭鍏ヨ嚦灏戜竴涓瘝璇?);currentWords=ws;wordIndex=-1;wordVisible=false;document.getElementById("wordText").innerText="鐐瑰嚮涓嬫柟寮€濮?;document.getElementById("wordText").classList.add("hidden");updateWordCounter()}
function nextWord(){if(currentWords.length===0)return;wordIndex=(wordIndex+1)%currentWords.length;wordVisible=false;document.getElementById("wordText").innerText=currentWords[wordIndex];document.getElementById("wordText").classList.add("hidden");updateWordCounter();document.getElementById("wordText").classList.remove("hidden");void document.getElementById("wordText").offsetWidth;document.getElementById("wordText").classList.add("hidden")}
function toggleWord(){if(currentWords.length===0||wordIndex<0)return;wordVisible=!wordVisible;if(wordVisible)document.getElementById("wordText").classList.remove("hidden");else document.getElementById("wordText").classList.add("hidden")}
function shuffleWords(){if(currentWords.length===0)return;for(var i=currentWords.length-1;i>0;i--){var r=Math.floor(Math.random()*(i+1)),tmp=currentWords[i];currentWords[i]=currentWords[r];currentWords[r]=tmp}wordIndex=-1;wordVisible=false;document.getElementById("wordText").innerText="宸查殢鏈烘墦涔?;document.getElementById("wordText").classList.add("hidden");updateWordCounter();setTimeout(function(){nextWord()},500)}
function resetWords(){var v=document.getElementById("wordBank").value;if(v!=="custom")currentWords=WORD_BANKS[v]||[];else currentWords=[];wordIndex=-1;wordVisible=false;document.getElementById("wordText").innerText="鐐瑰嚮涓嬫柟寮€濮?;document.getElementById("wordText").classList.add("hidden");updateWordCounter()}
function updateWordCounter(){document.getElementById("wordCounter").innerText="绗?"+(wordIndex<0?0:wordIndex+1)+" / "+currentWords.length+" 涓瘝"}
window.onload=function(){loadPlayers();initCards();timerSet(30);loadScore();currentWords=WORD_BANKS.animals;wordIndex=-1;go("pageHome");if("serviceWorker"in navigator)navigator.serviceWorker.register("/boardgame/sw.js")};

/* ===== 璧峰鐜╁ - 鍏ㄥ睆鐐叿鎽囧彿 ===== */
var lotteryRunning = false;
startLottery = function() {
  if (players.length === 0) return alert('璇峰厛鍦ㄣ€岀帺瀹惰缃€嶄腑娣诲姞鐜╁');
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
      dom.innerText = '馃弳 ' + win.name
      dom.style.color = win.color;
      
      dom.className = 'lottery-name winner';
      if (icon) icon.className = 'lottery-icon winner';
      if (ring) ring.className = 'lottery-ring winner';
      
      setTimeout(function() {
        lotteryRunning = false;
        dom.className = 'lottery-name';
        dom.innerText = '鐐瑰嚮鎽囧彿';
        dom.style.color = '';
        if (icon) icon.className = 'lottery-icon';
        if (ring) ring.className = 'lottery-ring';
        if (sub) { sub.style.display = 'block'; sub.innerText = '鐐瑰嚮灞忓箷閲嶆柊鎽囧彿'; } document.getElementById('lotMsgToggle').style.display='block';
      }, 3000);
    }
  })();
};

/* ===== 鍗＄墝鍙屾寚缂╂斁 ===== */
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


/* ===== 鎭舵悶娑堟伅缂栬緫 ===== */
function toggleMsgEditor(){var e=document.getElementById("msgEditor");e.style.display=e.style.display==="flex"?"none":"flex";if(e.style.display==="flex"){document.getElementById("msgTextarea").value=lotteryMessages.join("\n")}}
function saveMsgEditor(){var v=document.getElementById("msgTextarea").value;var arr=v.split("\n").map(function(s){return s.trim()}).filter(function(s){return s.length>0});if(arr.length===0)return alert("鑷冲皯闇€瑕佷竴涓秷鎭紒");lotteryMessages=arr;saveLotteryMessages();document.getElementById("msgEditor").style.display="none";alert("淇濆瓨鎴愬姛锛?)}

/* ===== 鏁版嵁瀵煎叆/瀵煎嚭锛堣法璁惧鍚屾锛?===== */
function exportData(){try{var d={players:players,messages:lotteryMessages,scores:scoreRounds};var blob=new Blob([JSON.stringify(d,null,2)],{type:"application/json"});var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="boardgame_data_" + new Date().toISOString().slice(0,10) + ".json";a.click();URL.revokeObjectURL(a.href)}catch(e){alert("瀵煎嚭澶辫触锛?+e.message)}}
function importData(){var inp=document.getElementById("importFileInput");if(!inp){inp=document.createElement("input");inp.id="importFileInput";inp.type="file";inp.accept=".json";inp.style.display="none";document.body.appendChild(inp)}inp.onchange=function(e){var file=e.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(ev){try{var d=JSON.parse(ev.target.result);if(d.players){players=d.players;localStorage.setItem(storageKey,JSON.stringify(players));renderPlayerList()}if(d.messages){lotteryMessages=d.messages;saveLotteryMessages()}if(d.scores){scoreRounds=d.scores;saveScore();scoreRender()}alert("瀵煎叆鎴愬姛锛?)}catch(e){alert("瀵煎叆澶辫触锛?+e.message)}};reader.readAsText(file)};inp.click()}
window.onload = function() {
  if (origOnload) origOnload();loadLotteryMessages();
  setTimeout(initPinchZoom, 500);
};
