const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const screens = $$('.screen');
const music = $('#bgMusic');
const musicToggle = $('#musicToggle');
let musicOn = false;
let completed = new Set();
let toastTimer;

function showScreen(id){
  screens.forEach(s=>s.classList.toggle('active',s.id===id));
  window.scrollTo({top:0,behavior:'smooth'});
}
function showToast(message){
  const t=$('#toast'); t.textContent=message; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),2100);
}
function updateProgress(){
  $('#progressLabel').textContent=`${completed.size} / 3 adventures`;
}
async function startMusic(){
  try{await music.play();musicOn=true;musicToggle.innerHTML='♫ <span>Music on</span>';}
  catch(e){musicOn=false;musicToggle.innerHTML='♫ <span>Tap for music</span>';}
}
musicToggle.addEventListener('click',async()=>{
  if(music.paused){await startMusic();}else{music.pause();musicOn=false;musicToggle.innerHTML='♫ <span>Music off</span>';}
});
$('#enterBtn').addEventListener('click',()=>{startMusic();showScreen('hub');});
$$('[data-open]').forEach(b=>b.addEventListener('click',()=>openAdventure(b.dataset.open)));
$$('[data-back]').forEach(b=>b.addEventListener('click',()=>showScreen('hub')));
$('#letterBtn').addEventListener('click',()=>showScreen('letter'));
$('#openEnvelope').addEventListener('click',()=>{
  $('#envelopeWrap').classList.add('hidden');$('#letterContent').classList.remove('hidden');
});
$('#finalBtn').addEventListener('click',()=>showScreen('final'));
$('#replayBtn').addEventListener('click',()=>showScreen('hub'));
$('#homeBtn').addEventListener('click',()=>showScreen('welcome'));

function openAdventure(id){
  showScreen(id);
  if(id==='collector') startCollector();
  if(id==='quiz') startQuiz();
  if(id==='bubble') startBubbleGame();
}

/* Heart collector */
const heartMessages=[
  'You deserve soft days and happy surprises. ♡',
  'Your smile should honestly be a national treasure.',
  'Tiny reminder: you are pretty wonderful.',
  'If kindness were stars, you would light the whole sky.',
  'You make ordinary moments feel a little special.',
  'Sending you one pocket-sized hug. ♡',
  'Never forget how lovely your energy is.',
  'You are somebody’s favourite notification.',
  'The universe did a cute thing when it made you.',
  'One more heart, one more reason to smile.'
];
let heartCount=0, heartInterval=null, heartTimeout=null;
function startCollector(){
  clearInterval(heartInterval);clearTimeout(heartTimeout);
  heartCount=0;$('#heartScore').innerHTML='0 <small>/ 10</small>';
  $('#collectorCaption').textContent='Each heart comes with a tiny reminder.';
  $('#collectorDone').classList.add('hidden');
  const field=$('#playfield');$$('.heart-pop',field).forEach(x=>x.remove());
  $('#fieldHint').style.display='grid';
  setTimeout(()=>$('#fieldHint').style.display='none',1800);
  spawnHeart();
  heartInterval=setInterval(spawnHeart,850);
  heartTimeout=setTimeout(()=>{if(heartCount<10){clearInterval(heartInterval);$('#collectorCaption').textContent='The hearts got shy! You collected '+heartCount+'. Try again?';$('#collectorDone').classList.remove('hidden');}},18000);
}
function spawnHeart(){
  if(heartCount>=10){clearInterval(heartInterval);return;}
  const field=$('#playfield');if($$('.heart-pop',field).length>9)return;
  const h=document.createElement('button');h.className='heart-pop';h.textContent=Math.random()>.5?'♡':'♥';
  h.setAttribute('aria-label','Collect heart');
  h.style.left=(5+Math.random()*85)+'%';h.style.top=(10+Math.random()*72)+'%';
  h.style.fontSize=(25+Math.random()*18)+'px';h.style.animationDelay=(Math.random()*-2)+'s';
  h.addEventListener('click',()=>{
    if(h.dataset.hit)return;h.dataset.hit='1';h.remove();heartCount++;
    $('#heartScore').innerHTML=`${heartCount} <small>/ 10</small>`;
    $('#collectorCaption').textContent=heartMessages[heartCount-1]||'A little more love for you. ♡';
    if(heartCount>=10){clearInterval(heartInterval);clearTimeout(heartTimeout);$('#collectorCaption').textContent='You caught all 10! Consider this a basket full of affection. 💗';completed.add('collector');updateProgress();$('#collectorDone').classList.remove('hidden');}
  });
  field.appendChild(h);setTimeout(()=>h.remove(),4500);
}
$('#collectorDone').addEventListener('click',()=>showScreen('hub'));

/* Light-hearted quiz: customize the questions to match your own story. */
const questions=[
  {q:'What is the most powerful relationship superpower?',a:['Reading minds (slightly scary)','Making each other laugh','Sharing snacks without asking','All of the above'],reply:'Correct answer: all of them. Especially the snacks. 😌'},
  {q:'If we were in a movie, what would our genre be?',a:['Rom-com with silly scenes','A mystery about missing snacks','Space adventure','A little bit of everything'],reply:'Honestly, I would watch every episode. 🍿'},
  {q:'What should a perfect little date include?',a:['Good food','Long conversations','Random laughter','All three, obviously'],reply:'A very excellent answer. Date-planning skills: 100/10.'},
  {q:'When the day gets a little tiring, what helps most?',a:['A kind message','A favourite song','A silly joke','A warm conversation'],reply:'A little kindness can make a whole day softer. ♡'},
  {q:'Final question: what is the best thing about this tiny universe?',a:['The stars','The games','The secret letter','The person exploring it'],reply:'You knew it. The universe agrees. 💗'}
];
let qIndex=0;
function startQuiz(){qIndex=0;renderQuestion();}
function renderQuestion(){
  const q=questions[qIndex];$('#quizCount').textContent=`QUESTION ${qIndex+1} / ${questions.length}`;
  $('#quizQuestion').textContent=q.q;$('#quizFeedback').textContent='';
  $('#nextQuestion').classList.add('hidden');const area=$('#answers');area.innerHTML='';
  q.a.forEach(answer=>{
    const b=document.createElement('button');b.className='answer-btn';b.textContent=answer;
    b.addEventListener('click',()=>{
      $$('.answer-btn',area).forEach(x=>x.disabled=true);
      $('#quizFeedback').textContent=q.reply;
      $('#nextQuestion').textContent=qIndex===questions.length-1?'Finish adventure ✓':'Next question →';
      $('#nextQuestion').classList.remove('hidden');
    });area.appendChild(b);
  });
}
$('#nextQuestion').addEventListener('click',()=>{
  if(qIndex<questions.length-1){qIndex++;renderQuestion();}
  else{completed.add('quiz');updateProgress();showToast('Quiz complete! You passed the cute test. ✨');showScreen('hub');}
});

/* Bubble pop — cheerful third mini-game */
const bubbleThoughts=[
'A little joy just popped into your day. ♡','You deserve all the lovely little things.',
'Sending a tiny sparkle your way ✨','Hope this made you smile!',
'The world feels brighter with kind people in it.','One bubble, one happy thought.',
'Keep that lovely smile of yours.','A pocketful of sunshine, just for you.',
'You are doing better than you think.','Here is a little virtual high-five!',
'May your day be soft and sweet.','Final pop! A big warm hug. 💗'
];
let bubblesPopped=0;
function startBubbleGame(){
  bubblesPopped=0;$('#bubbleScore').innerHTML='0 <small>/ 12</small>';
  $('#bubbleCaption').textContent='Every pop comes with a tiny happy thought.';
  $('#bubbleDone').classList.add('hidden');
  const field=$('#bubbleField');field.innerHTML='';
  for(let i=0;i<12;i++){
    const b=document.createElement('button');b.className='bubble';b.type='button';b.setAttribute('aria-label','Pop bubble');
    const size=38+Math.random()*35;b.style.width=size+'px';b.style.height=size+'px';
    b.style.left=(4+Math.random()*83)+'%';b.style.top=(5+Math.random()*78)+'%';b.style.animationDelay=(-Math.random()*3)+'s';
    b.addEventListener('click',()=>{
      if(b.dataset.popped)return;b.dataset.popped='1';b.style.transform='scale(1.7)';b.style.opacity='0';setTimeout(()=>b.remove(),160);
      bubblesPopped++;$('#bubbleScore').innerHTML=`${bubblesPopped} <small>/ 12</small>`;
      $('#bubbleCaption').textContent=bubbleThoughts[bubblesPopped-1];
      if(bubblesPopped===12){completed.add('bubble');updateProgress();$('#bubbleCaption').textContent='You popped all 12! Sending you a whole sky full of happy thoughts. 💗';$('#bubbleDone').classList.remove('hidden');}
    });field.appendChild(b);
  }
}
$('#bubbleDone').addEventListener('click',()=>showScreen('hub'));

/* Ambient starfield */
const canvas=$('#stars'),ctx=canvas.getContext('2d');let stars=[];
function resizeCanvas(){
  const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;
  canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
  stars=Array.from({length:Math.min(150,Math.floor(innerWidth/7))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.5+.25,a:Math.random()*.65+.2,s:Math.random()*.012+.003}));
}
function drawStars(){
  ctx.clearRect(0,0,innerWidth,innerHeight);
  for(const s of stars){s.a+=s.s;if(s.a>.9||s.a<.15)s.s*=-1;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(183,139,190,${s.a * 0.62})`;ctx.fill();}
  requestAnimationFrame(drawStars);
}
window.addEventListener('resize',resizeCanvas);resizeCanvas();drawStars();
