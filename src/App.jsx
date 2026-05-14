import { useState, useRef, useEffect } from "react";


async function callGemini(messages, system) {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        system,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const apiError = data?.error;
      const errorMessage = typeof apiError === "string"
        ? apiError
        : apiError?.message || apiError?.description || data?.message;
      throw new Error(errorMessage || `API error: ${response.status}`);
    }

    if (typeof data === "string") {
      return data;
    }

    if (typeof data.completion === "string" && data.completion.trim()) {
      return data.completion;
    }

    if (typeof data.output_text === "string" && data.output_text.trim()) {
      return data.output_text;
    }

    if (Array.isArray(data.content) && data.content.length > 0) {
      const first = data.content[0];
      if (typeof first === "string") return first;
      if (first?.text) return first.text;
    }

    if (data.message?.content?.[0]?.text) {
      return data.message.content[0].text;
    }

    throw new Error("Resposta inválida da API: sem texto");
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    throw error;
  }
}

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#07071a;--surf:#0e0e27;--card:rgba(255,255,255,0.04);--bdr:rgba(255,255,255,0.08);
    --a1:#00e5a0;--a2:#7c3aed;--a3:#f97316;
    --txt:#f0eeff;--mut:#7070a0;
    --fd:'Syne',sans-serif;--fb:'Plus Jakarta Sans',sans-serif;
  }
  html,body{background:var(--bg);color:var(--txt);font-family:var(--fb)}
  input,textarea,select{
    background:rgba(255,255,255,0.05);border:1px solid var(--bdr);color:var(--txt);
    font-family:var(--fb);border-radius:10px;padding:11px 14px;width:100%;font-size:14px;
    outline:none;transition:border-color .2s,box-shadow .2s;
  }
  input:focus,textarea:focus,select:focus{border-color:var(--a1);box-shadow:0 0 0 3px rgba(0,229,160,0.12)}
  select option{background:#1a1a3e}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0.4}}
  .f1{animation:fadeUp .55s ease forwards}
  .f2{animation:fadeUp .55s ease .12s forwards;opacity:0}
  .f3{animation:fadeUp .55s ease .25s forwards;opacity:0}
  ::-webkit-scrollbar{width:5px}
  ::-webkit-scrollbar-track{background:var(--bg)}
  ::-webkit-scrollbar-thumb{background:#2a2a5a;border-radius:3px}
`;

const S = {
  card: {background:"var(--card)",border:"1px solid var(--bdr)",borderRadius:18,padding:22},
  tag: (c="a1")=>({
    display:"inline-block",
    background:{a1:"rgba(0,229,160,0.1)",a2:"rgba(124,58,237,0.12)",a3:"rgba(249,115,22,0.12)"}[c],
    color:{a1:"#00e5a0",a2:"#a78bfa",a3:"#fb923c"}[c],
    border:`1px solid ${{a1:"rgba(0,229,160,0.2)",a2:"rgba(124,58,237,0.25)",a3:"rgba(249,115,22,0.25)"}[c]}`,
    borderRadius:100,padding:"3px 12px",fontSize:12,fontWeight:600,letterSpacing:.3,
  }),
  btn:(v="primary",dis=false)=>{
    const base={fontFamily:"var(--fd)",fontWeight:700,fontSize:14,borderRadius:12,border:"none",
      cursor:dis?"not-allowed":"pointer",padding:"12px 22px",transition:"all .2s",opacity:dis?.5:1};
    return {...base,...{
      primary:{background:"var(--a1)",color:"#07071a"},
      outline:{background:"transparent",color:"var(--a1)",border:"1.5px solid var(--a1)"},
      ghost:{background:"rgba(255,255,255,0.06)",color:"var(--txt)",border:"1px solid var(--bdr)"},
    }[v]};
  },
};

function Btn({children,onClick,v="primary",dis,style:st}){
  return <button onClick={dis?undefined:onClick} style={{...S.btn(v,dis),...st}}>{children}</button>;
}
function Tag({c="a1",children}){return <span style={S.tag(c)}>{children}</span>;}
function Spin(){return <div style={{width:22,height:22,border:"3px solid rgba(0,229,160,0.15)",borderTopColor:"var(--a1)",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto"}}/>;}

function Nav({page,setPage}){
  const links=[["home","Início"],["profile","Meu Perfil"],["curriculum","Currículo"],["interview","Entrevista"]];
  return(
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,height:60,
      background:"rgba(7,7,26,0.88)",backdropFilter:"blur(18px)",
      borderBottom:"1px solid var(--bdr)",display:"flex",alignItems:"center",
      justifyContent:"space-between",padding:"0 28px"}}>
      
      <div style={{display:"flex",gap:2}}>
        {links.map(([id,label])=>(
          <button key={id} onClick={()=>setPage(id)} style={{
            background:page===id?"rgba(0,229,160,0.1)":"transparent",
            color:page===id?"var(--a1)":"var(--mut)",
            border:"none",cursor:"pointer",fontFamily:"var(--fb)",fontWeight:500,fontSize:13,
            padding:"7px 14px",borderRadius:8,transition:"all .2s"}}>
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function HomePage({setPage}){
  const feats=[
    {ic:"🧠",title:"Perfil com IA",desc:"Seus gostos viram um perfil profissional analítico em segundos.",c:"a1"},
    {ic:"📄",title:"Currículo Inteligente",desc:"Monte seu primeiro currículo do zero — a IA escreve com você.",c:"a2"},
    {ic:"🎤",title:"Simulador de Entrevista",desc:"Pratique entrevistas reais e receba feedback honesto na hora.",c:"a3"},
    {ic:"🗺️",title:"Caminhos Possíveis",desc:"Descubra áreas compatíveis e o que falta para chegar lá.",c:"a1"},
  ];
  return(
    <div style={{paddingTop:60}}>
      <div style={{minHeight:"calc(100vh - 60px)",display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",padding:"80px 24px",
        position:"relative",overflow:"hidden",textAlign:"center"}}>
        <div style={{position:"absolute",width:700,height:700,
          background:"radial-gradient(circle,rgba(0,229,160,0.07) 0%,transparent 65%)",
          top:"0%",left:"50%",transform:"translateX(-50%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",width:500,height:500,
          background:"radial-gradient(circle,rgba(124,58,237,0.09) 0%,transparent 65%)",
          bottom:"5%",right:"5%",pointerEvents:"none"}}/>
        <div className="f1"><Tag c="a1">🚀 Sua ponte para o primeiro emprego</Tag></div>
        <h1 className="f2" style={{fontFamily:"var(--fd)",fontSize:"clamp(42px,7vw,80px)",
          fontWeight:800,lineHeight:1.06,marginTop:22,letterSpacing:"-2.5px"}}>
          De jovem curioso<br/>
          <span style={{background:"linear-gradient(120deg,var(--a1) 0%,#00b4d8 100%)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            a profissional pronto.
          </span>
        </h1>
        <p className="f3" style={{marginTop:20,fontSize:17,color:"var(--mut)",maxWidth:480,lineHeight:1.75}}>
          IA que transforma seus gostos em perfil, cria seu currículo e simula entrevistas reais. Tudo de graça, sem experiência necessária.
        </p>
        <div className="f3" style={{marginTop:36,display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
          <Btn onClick={()=>setPage("profile")} st={{padding:"15px 30px",fontSize:15}}>Começar agora →</Btn>
          <Btn v="ghost" onClick={()=>setPage("interview")} st={{padding:"15px 30px",fontSize:15}}>Simular entrevista</Btn>
        </div>
        <div style={{marginTop:60,display:"flex",gap:32,justifyContent:"center",flexWrap:"wrap"}}>
          {["100% gratuito","Sem experiência necessária","IA de verdade"].map(t=>(
            <div key={t} style={{display:"flex",alignItems:"center",gap:7,color:"var(--mut)",fontSize:13}}>
              <span style={{color:"var(--a1)"}}>✓</span>{t}
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:"60px 24px 100px",maxWidth:960,margin:"0 auto"}}>
        <h2 style={{fontFamily:"var(--fd)",fontSize:38,fontWeight:800,textAlign:"center",
          letterSpacing:"-1px",marginBottom:6}}>Tudo que você precisa</h2>
        <p style={{textAlign:"center",color:"var(--mut)",marginBottom:44,fontSize:15}}>em um só lugar, em minutos</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:18}}>
          {feats.map((f,i)=>(
            <div key={i} style={{...S.card,cursor:"pointer",transition:"transform .2s"}}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-5px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
              <div style={{fontSize:34,marginBottom:14}}>{f.ic}</div>
              <h3 style={{fontFamily:"var(--fd)",fontWeight:700,marginBottom:8,fontSize:16}}>{f.title}</h3>
              <p style={{color:"var(--mut)",fontSize:13,lineHeight:1.65}}>{f.desc}</p>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:52}}>
          <Btn onClick={()=>setPage("profile")} st={{padding:"15px 36px",fontSize:15}}>
            Criar meu perfil com IA
          </Btn>
        </div>
      </div>
    </div>
  );
}

function ProfilePage({profileData,setProfileData,setPage}){
  const [form,setForm]=useState({name:"",age:"",interests:"",skills:"",dream:""});
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(profileData);
  const [err,setErr]=useState("");

  const analyze=async()=>{
    if(!form.interests.trim())return;
    setLoading(true);setErr("");
    try{
      const sys=`Você é especialista em orientação profissional para jovens no Brasil.
Responda SOMENTE com JSON válido, sem backticks, sem texto antes ou depois, com esta estrutura exata:
{"perfil_analitico":"2-3 frases","pontos_fortes":["p1","p2","p3"],
"areas_compativeis":[{"nome":"","descricao":"","compatibilidade":85,"emoji":""},{"nome":"","descricao":"","compatibilidade":75,"emoji":""},{"nome":"","descricao":"","compatibilidade":65,"emoji":""}],
"habilidades_faltando":[{"nome":"","importancia":"alta","como_aprender":""},{"nome":"","importancia":"media","como_aprender":""},{"nome":"","importancia":"alta","como_aprender":""},{"nome":"","importancia":"media","como_aprender":""}],
"mensagem_motivacional":"frase curta e animada"}`;
      const txt=await callGemini([{role:"user",content:`Nome:${form.name||"Jovem"} Idade:${form.age||"?"}\nInteresses/hobbies:${form.interests}\nHabilidades:${form.skills||"não mencionadas"}\nSonho:${form.dream||"não informado"}\nGere o JSON.`}],sys);
      const parsed=JSON.parse(txt.replace(/```json|```/g,"").trim());
      setResult(parsed);setProfileData({...parsed,form});
    }catch(e){setErr("Ocorreu um erro. Tente novamente.");}
    setLoading(false);
  };

  const fi=(key,label,ph,rows)=>(
    <div>
      <label style={{fontSize:12,color:"var(--mut)",display:"block",marginBottom:5}}>{label}</label>
      {rows
        ?<textarea placeholder={ph} rows={rows} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}/>
        :<input placeholder={ph} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}/>}
    </div>
  );

  return(
    <div style={{paddingTop:60,minHeight:"100vh"}}>
      <div style={{maxWidth:760,margin:"0 auto",padding:"44px 22px"}}>
        <div style={{marginBottom:36}}>
          <Tag c="a2">✨ Análise de Perfil com IA</Tag>
          <h1 style={{fontFamily:"var(--fd)",fontSize:38,fontWeight:800,marginTop:10,letterSpacing:"-1.5px"}}>Quem é você?</h1>
          <p style={{color:"var(--mut)",marginTop:6,fontSize:14}}>Conte seus gostos e a IA transforma em um perfil profissional de verdade.</p>
        </div>
        {!result?(
          <div style={S.card}>
            <div style={{display:"grid",gap:18}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                {fi("name","Nome","Seu nome")}
                {fi("age","Idade","Ex: 18")}
              </div>
              {fi("interests","🎮 Seus interesses e hobbies *","Ex: games, culinária, tecnologia, música, esportes, ajudar pessoas...",4)}
              {fi("skills","💪 O que você já sabe fazer?","Ex: Excel básico, inglês, edição de vídeo, CNH, atendimento...",3)}
              {fi("dream","🌟 Qual seu sonho profissional?","Ex: trabalhar com tecnologia, empreender, trabalhar com pessoas...")}
              {err&&<p style={{color:"var(--a3)",fontSize:13}}>{err}</p>}
              <Btn onClick={analyze} dis={loading||!form.interests.trim()} st={{padding:14}}>
                {loading?"Analisando com IA...":"✨ Analisar meu perfil"}
              </Btn>
              {loading&&<Spin/>}
            </div>
          </div>
        ):(
          <ProfileResult result={result} onRedo={()=>setResult(null)} setPage={setPage}/>
        )}
      </div>
    </div>
  );
}

function ProfileResult({result,onRedo,setPage}){
  const impCor={alta:"a3",media:"a2",baixa:"a1"};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{...S.card,borderColor:"rgba(0,229,160,0.22)",textAlign:"center",padding:28}}>
        <div style={{fontSize:44,marginBottom:10}}>🎯</div>
        <p style={{fontFamily:"var(--fd)",fontSize:19,fontWeight:700,lineHeight:1.4}}>{result.mensagem_motivacional}</p>
      </div>
      <div style={S.card}>
        <h3 style={{fontFamily:"var(--fd)",fontWeight:700,color:"var(--a1)",marginBottom:12,fontSize:15}}>🧠 Seu Perfil Analítico</h3>
        <p style={{lineHeight:1.75,fontSize:14,color:"var(--txt)",marginBottom:14}}>{result.perfil_analitico}</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
          {result.pontos_fortes.map((p,i)=><Tag key={i} c="a1">⚡ {p}</Tag>)}
        </div>
      </div>
      <div>
        <h3 style={{fontFamily:"var(--fd)",fontWeight:700,marginBottom:14,fontSize:15}}>🗺️ Áreas Compatíveis</h3>
        <div style={{display:"grid",gap:10}}>
          {result.areas_compativeis.map((a,i)=>(
            <div key={i} style={{...S.card,display:"flex",alignItems:"center",gap:14}}>
              <div style={{fontSize:30,flexShrink:0}}>{a.emoji}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <h4 style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:15}}>{a.nome}</h4>
                  <span style={{color:"var(--a1)",fontFamily:"var(--fd)",fontWeight:700,fontSize:15}}>{a.compatibilidade}%</span>
                </div>
                <p style={{color:"var(--mut)",fontSize:12,marginBottom:8}}>{a.descricao}</p>
                <div style={{height:3,background:"var(--bdr)",borderRadius:2}}>
                  <div style={{height:"100%",borderRadius:2,width:`${a.compatibilidade}%`,
                    background:"linear-gradient(90deg,var(--a1),#00b4d8)",transition:"width 1s ease"}}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 style={{fontFamily:"var(--fd)",fontWeight:700,marginBottom:14,fontSize:15}}>📈 Habilidades para Desenvolver</h3>
        <div style={{display:"grid",gap:9}}>
          {result.habilidades_faltando.map((h,i)=>(
            <div key={i} style={{...S.card,display:"flex",gap:12,alignItems:"flex-start",padding:16}}>
              <Tag c={impCor[h.importancia]||"a2"}>{h.importancia}</Tag>
              <div>
                <div style={{fontWeight:600,fontSize:14,marginBottom:2}}>{h.nome}</div>
                <p style={{color:"var(--mut)",fontSize:12,lineHeight:1.55}}>{h.como_aprender}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <Btn onClick={()=>setPage("curriculum")}>Criar meu currículo →</Btn>
        <Btn v="ghost" onClick={onRedo}>Refazer análise</Btn>
        <Btn v="outline" onClick={()=>setPage("interview")}>Praticar entrevista</Btn>
      </div>
    </div>
  );
}

function CurriculumPage({profileData}){
  const [step,setStep]=useState("form");
  const [form,setForm]=useState({
    name:profileData?.form?.name||"",email:"",phone:"",city:"",linkedin:"",
    school:"",course:"",experiences:"",skills:profileData?.form?.skills||"",languages:"",
  });
  const [loading,setLoading]=useState(false);
  const [gen,setGen]=useState(null);
  const [err,setErr]=useState("");

  const generate=async()=>{
    if(!form.name||!form.school)return;
    setLoading(true);setErr("");
    try{
      const sys=`Você é especialista em RH brasileiro que escreve currículos para jovens no primeiro emprego.
Responda SOMENTE com JSON válido:
{"objetivo":"objetivo em 2 frases bem escritas","experiencias_melhoradas":"experiências reescritas ou sugeridas se não houver","habilidades_lista":["h1","h2","h3","h4","h5"],"diferenciais":["d1","d2","d3"],"dicas":["dica personalizada 1","dica 2","dica 3"]}`;
      const prof=profileData?`Perfil IA: ${profileData.perfil_analitico}`:"";
      const txt=await callGemini([{role:"user",content:`Nome:${form.name} Cidade:${form.city}\nFormação:${form.school} - ${form.course}\nExperiências:${form.experiences||"nenhuma"}\nHabilidades:${form.skills}\nIdiomas:${form.languages||"não informado"}\n${prof}\nGere o JSON.`}],sys);
      setGen({...JSON.parse(txt.replace(/```json|```/g,"").trim()),form});
      setStep("preview");
    }catch(e){setErr("Erro ao gerar. Tente novamente.");}
    setLoading(false);
  };

  const fi=(key,label,ph,rows)=>(
    <div>
      <label style={{fontSize:12,color:"var(--mut)",display:"block",marginBottom:5}}>{label}</label>
      {rows
        ?<textarea placeholder={ph} rows={rows} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}/>
        :<input placeholder={ph} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}/>}
    </div>
  );

  if(step==="preview"&&gen)return <CvPreview data={gen} onEdit={()=>setStep("form")}/>;

  return(
    <div style={{paddingTop:60,minHeight:"100vh"}}>
      <div style={{maxWidth:680,margin:"0 auto",padding:"44px 22px"}}>
        <Tag c="a3">📄 Gerador de Currículo</Tag>
        <h1 style={{fontFamily:"var(--fd)",fontSize:38,fontWeight:800,marginTop:10,marginBottom:6,letterSpacing:"-1.5px"}}>Monte seu currículo</h1>
        <p style={{color:"var(--mut)",marginBottom:30,fontSize:14}}>Preencha os dados e a IA otimiza tudo para o mercado.</p>
        <div style={S.card}>
          <div style={{display:"grid",gap:18}}>
            <p style={{fontFamily:"var(--fd)",fontWeight:700,color:"var(--a1)",fontSize:14}}>📋 Dados Pessoais</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
              {fi("name","Nome completo *","Seu nome completo")}
              {fi("city","Cidade","São Paulo, SP")}
              {fi("email","E-mail","seu@email.com")}
              {fi("phone","Telefone","(11) 99999-9999")}
              {fi("linkedin","LinkedIn (opcional)","linkedin.com/in/seunome")}
            </div>
            <div style={{height:1,background:"var(--bdr)"}}/>
            <p style={{fontFamily:"var(--fd)",fontWeight:700,color:"var(--a1)",fontSize:14}}>🎓 Formação</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
              {fi("school","Escola / Faculdade *","Nome da instituição")}
              {fi("course","Curso / Série *","Ex: Ensino Médio / Administração")}
            </div>
            <div style={{height:1,background:"var(--bdr)"}}/>
            <p style={{fontFamily:"var(--fd)",fontWeight:700,color:"var(--a1)",fontSize:14}}>💼 Experiências</p>
            {fi("experiences","Conta tudo (mesmo que seja pouco)","Ex: ajudei no negócio da família, trabalho voluntário, projeto escolar, estágio, freelance...",4)}
            <div style={{height:1,background:"var(--bdr)"}}/>
            <p style={{fontFamily:"var(--fd)",fontWeight:700,color:"var(--a1)",fontSize:14}}>⚡ Habilidades & Idiomas</p>
            {fi("skills","Habilidades","Ex: pacote Office, edição de vídeo, atendimento, redes sociais...",3)}
            {fi("languages","Idiomas","Ex: Inglês básico, Espanhol intermediário")}
            {err&&<p style={{color:"var(--a3)",fontSize:13}}>{err}</p>}
            <Btn onClick={generate} dis={loading||!form.name||!form.school} st={{padding:14}}>
              {loading?"Gerando com IA...":"✨ Gerar currículo com IA"}
            </Btn>
            {loading&&<Spin/>}
          </div>
        </div>
      </div>
    </div>
  );
}

function CvPreview({data,onEdit}){
  const {form,objetivo,experiencias_melhoradas,habilidades_lista,diferenciais,dicas}=data;
  const Sec=({title,children})=>(
    <div style={{marginBottom:18}}>
      <h2 style={{fontSize:10,fontWeight:800,letterSpacing:2,color:"#1a1a3e",
        borderBottom:"1.5px solid #e0e0ee",paddingBottom:4,marginBottom:10}}>{title}</h2>
      {children}
    </div>
  );
  return(
    <div style={{paddingTop:60,minHeight:"100vh"}}>
      <div style={{maxWidth:920,margin:"0 auto",padding:"44px 22px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28,flexWrap:"wrap",gap:10}}>
          <div>
            <Tag c="a1">✅ Currículo pronto!</Tag>
            <h1 style={{fontFamily:"var(--fd)",fontSize:30,fontWeight:800,marginTop:8,letterSpacing:"-1px"}}>Seu currículo otimizado</h1>
          </div>
          <Btn v="ghost" onClick={onEdit}>Editar dados</Btn>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"minmax(0,2fr) minmax(0,1fr)",gap:18,alignItems:"start"}}>
          <div style={{background:"#ffffff",color:"#1a1a3e",borderRadius:14,padding:"36px 40px",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            <div style={{borderBottom:"3px solid #07071a",paddingBottom:18,marginBottom:20}}>
              <h1 style={{fontFamily:"var(--fd)",fontSize:26,fontWeight:800,color:"#07071a"}}>{form.name}</h1>
              <div style={{display:"flex",gap:16,marginTop:8,flexWrap:"wrap",fontSize:12,color:"#555"}}>
                {form.email&&<span>✉ {form.email}</span>}
                {form.phone&&<span>📱 {form.phone}</span>}
                {form.city&&<span>📍 {form.city}</span>}
                {form.linkedin&&<span>🔗 {form.linkedin}</span>}
              </div>
            </div>
            <Sec title="OBJETIVO PROFISSIONAL"><p style={{fontSize:13,lineHeight:1.75,color:"#333"}}>{objetivo}</p></Sec>
            <Sec title="FORMAÇÃO ACADÊMICA">
              <p style={{fontWeight:600,fontSize:14,color:"#1a1a3e"}}>{form.school}</p>
              <p style={{fontSize:13,color:"#555"}}>{form.course}</p>
            </Sec>
            {experiencias_melhoradas&&(
              <Sec title="EXPERIÊNCIAS">
                <p style={{fontSize:13,lineHeight:1.75,color:"#333",whiteSpace:"pre-line"}}>{experiencias_melhoradas}</p>
              </Sec>
            )}
            <Sec title="HABILIDADES">
              <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                {habilidades_lista.map((h,i)=>(
                  <span key={i} style={{background:"#f0f0f8",padding:"3px 11px",borderRadius:100,fontSize:12,color:"#333"}}>{h}</span>
                ))}
              </div>
            </Sec>
            {form.languages&&<Sec title="IDIOMAS"><p style={{fontSize:13,color:"#333"}}>{form.languages}</p></Sec>}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={S.card}>
              <h3 style={{fontFamily:"var(--fd)",fontWeight:700,color:"var(--a1)",marginBottom:12,fontSize:14}}>⭐ Seus diferenciais</h3>
              {diferenciais.map((d,i)=>(
                <div key={i} style={{display:"flex",gap:7,marginBottom:8,fontSize:13}}>
                  <span style={{color:"var(--a1)",flexShrink:0}}>✓</span>{d}
                </div>
              ))}
            </div>
            <div style={S.card}>
              <h3 style={{fontFamily:"var(--fd)",fontWeight:700,color:"var(--a3)",marginBottom:12,fontSize:14}}>💡 Dicas para você</h3>
              {dicas.map((d,i)=>(
                <div key={i} style={{marginBottom:10,fontSize:12,color:"var(--mut)",lineHeight:1.55}}>
                  <span style={{color:"var(--a3)",fontWeight:700}}>{i+1}. </span>{d}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InterviewPage({profileData}){
  const areas=["Atendimento ao Cliente","Administrativo","Tecnologia da Informação","Vendas","Marketing Digital","Logística","Saúde","Educação"];
  const [area,setArea]=useState("");
  const [started,setStarted]=useState(false);
  const [msgs,setMsgs]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [ended,setEnded]=useState(false);
  const [feedback,setFeedback]=useState(null);
  const [err,setErr]=useState("");
  const bottomRef=useRef(null);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"})},[msgs,feedback]);

  const sys=`Você é um entrevistador simpático e experiente de empresa brasileira, área: ${area}.
Entrevistando jovens para o primeiro emprego. Faça exatamente 5 perguntas, uma por vez.
Seja acolhedor e profissional. Português brasileiro informal mas educado.
Após a 5ª resposta do candidato, diga EXATAMENTE a string: FIM_DA_ENTREVISTA`;

  const start=async()=>{
    setErr("");
    setStarted(true);setLoading(true);
    try {
      const r=await callGemini([{role:"user",content:"Olá, cheguei para a entrevista."}],sys);
      setMsgs([{role:"assistant",content:r}]);
    } catch (error) {
      console.error(error);
      setErr(error?.message?.includes("401") ? "Chave Gemini ausente ou inválida. Verifique GEMINI_API_KEY." : error.message || "Erro ao iniciar a entrevista. Tente novamente.");
      setStarted(false);
      setMsgs([]);
    } finally {
      setLoading(false);
    }
  };

  const send=async()=>{
    if(!input.trim()||loading)return;
    setErr("");
    const nm={role:"user",content:input};
    const updated=[...msgs,nm];
    setMsgs(updated);setInput("");setLoading(true);
    try {
      const r=await callGemini(updated,sys);
      if(r.includes("FIM_DA_ENTREVISTA")){
        const clean=r.replace("FIM_DA_ENTREVISTA","").trim();
        if(clean)setMsgs(m=>[...m,{role:"assistant",content:clean}]);
        setEnded(true);
        const fsys=`Coach de carreira brasileiro. Responda SOMENTE JSON:
{"nota":8,"pontos_positivos":["p1","p2"],"pontos_melhorar":["p1","p2"],"dica_principal":"dica","frase_encorajadora":"mensagem curta"}`;
        const conv=updated.map(m=>`${m.role==="user"?"Candidato":"Entrevistador"}: ${m.content}`).join("\n");
        const ft=await callGemini([{role:"user",content:`Entrevista área ${area}:\n${conv}\nFeedback ao candidato.`}],fsys);
        try{setFeedback(JSON.parse(ft.replace(/```json|```/g,"").trim()));}catch(e){
          console.error("Erro ao parsear feedback:", e);
          setFeedback(null);
        }
      } else {
        setMsgs(m=>[...m,{role:"assistant",content:r}]);
      }
    } catch (error) {
      console.error(error);
      setErr(error.message || "Erro ao enviar sua resposta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const reset=()=>{setStarted(false);setMsgs([]);setEnded(false);setFeedback(null);setErr("");setArea("");setInput("");};

  if(!started){
    return(
      <div style={{paddingTop:60,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{maxWidth:460,width:"100%",padding:24,textAlign:"center"}}>
          <div style={{fontSize:52,animation:"float 3s ease-in-out infinite",marginBottom:16}}>🎤</div>
          <Tag c="a2">Simulador de Entrevista</Tag>
          <h1 style={{fontFamily:"var(--fd)",fontSize:34,fontWeight:800,marginTop:12,letterSpacing:"-1px"}}>Pratique antes da real</h1>
          <p style={{color:"var(--mut)",marginTop:8,marginBottom:30,fontSize:14}}>IA vai simular uma entrevista real e dar feedback detalhado no final.</p>
          <div style={S.card}>
            <label style={{fontSize:12,color:"var(--mut)",display:"block",marginBottom:7,textAlign:"left"}}>Área da vaga</label>
            <select value={area} onChange={e=>setArea(e.target.value)} style={{marginBottom:18}}>
              <option value="">Selecione uma área...</option>
              {areas.map(a=><option key={a} value={a}>{a}</option>)}
            </select>
            {err && <p style={{color:"var(--a3)",fontSize:13,marginBottom:14}}>{err}</p>}
            <Btn onClick={start} dis={!area} st={{width:"100%",padding:14}}>Começar entrevista →</Btn>
          </div>
        </div>
      </div>
    );
  }

  return(
    <div style={{paddingTop:60,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{maxWidth:700,margin:"0 auto",width:"100%",padding:"28px 22px",flex:1,display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:8}}>
          <div><Tag c="a2">🎤 Entrevista ao vivo</Tag>
            <h2 style={{fontFamily:"var(--fd)",fontWeight:700,marginTop:4,fontSize:16}}>Área: {area}</h2>
          </div>
          {ended&&<Tag c="a1">✅ Concluída!</Tag>}
        </div>
        {err && <p style={{color:"var(--a3)",fontSize:13,marginBottom:12}}>{err}</p>}
        <div style={{...S.card,overflowY:"auto",maxHeight:"55vh",marginBottom:14,padding:14}}>
          {msgs.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:14}}>
              {m.role==="assistant"&&(
                <div style={{width:30,height:30,borderRadius:"50%",marginRight:8,flexShrink:0,
                  background:"linear-gradient(135deg,var(--a1),var(--a2))",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🧑‍💼</div>
              )}
              <div style={{
                background:m.role==="user"?"var(--a1)":"rgba(255,255,255,0.06)",
                color:m.role==="user"?"#07071a":"var(--txt)",
                border:m.role==="user"?"none":"1px solid var(--bdr)",
                borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",
                padding:"10px 14px",maxWidth:"80%",fontSize:13,lineHeight:1.65,
              }}>{m.content}</div>
            </div>
          ))}
          {loading&&(
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:"rgba(255,255,255,0.06)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🧑‍💼</div>
              <div style={{display:"flex",gap:4}}>
                {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",
                  background:"var(--mut)",animation:`blink 1.2s ease ${i*.2}s infinite`}}/>)}
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>
        {!ended?(
          <div style={{display:"flex",gap:9}}>
            <input placeholder="Digite sua resposta... (Enter para enviar)"
              value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&send()} disabled={loading} style={{flex:1}}/>
            <Btn onClick={send} dis={loading||!input.trim()} st={{flexShrink:0}}>Enviar</Btn>
          </div>
        ):feedback?(
          <div style={{...S.card,borderColor:"rgba(0,229,160,0.2)"}}>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
              <div style={{fontFamily:"var(--fd)",fontSize:22,fontWeight:800}}>
                Nota: <span style={{color:"var(--a1)"}}>{feedback.nota}/10</span>
              </div>
              <div style={{flex:1,height:6,background:"var(--bdr)",borderRadius:3}}>
                <div style={{height:"100%",borderRadius:3,width:`${feedback.nota*10}%`,
                  background:"linear-gradient(90deg,var(--a1),#00b4d8)",transition:"width 1s ease"}}/>
              </div>
            </div>
            <p style={{color:"var(--mut)",fontSize:13,marginBottom:16,fontStyle:"italic"}}>"{feedback.frase_encorajadora}"</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <div>
                <div style={{color:"var(--a1)",fontSize:12,fontWeight:600,marginBottom:7}}>✅ Pontos positivos</div>
                {feedback.pontos_positivos.map((p,i)=><div key={i} style={{fontSize:12,marginBottom:5,color:"var(--txt)"}}>• {p}</div>)}
              </div>
              <div>
                <div style={{color:"var(--a3)",fontSize:12,fontWeight:600,marginBottom:7}}>📈 Para melhorar</div>
                {feedback.pontos_melhorar.map((p,i)=><div key={i} style={{fontSize:12,marginBottom:5,color:"var(--txt)"}}>• {p}</div>)}
              </div>
            </div>
            <div style={{background:"rgba(0,229,160,0.06)",border:"1px solid rgba(0,229,160,0.2)",
              borderRadius:10,padding:11,fontSize:12,marginBottom:14}}>
              💡 <strong>Dica principal:</strong> {feedback.dica_principal}
            </div>
            <Btn v="ghost" onClick={reset}>Tentar novamente</Btn>
          </div>
        ):<div style={{textAlign:"center",padding:20}}><Spin/><p style={{color:"var(--mut)",marginTop:12,fontSize:13}}>Gerando seu feedback...</p></div>}
      </div>
    </div>
  );
}

export default function App(){
  const [page,setPage]=useState("home");
  const [profileData,setProfileData]=useState(null);

  return(
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <style>{G}</style>
      <Nav page={page} setPage={setPage}/>
      {page==="home"&&<HomePage setPage={setPage}/>}
      {page==="profile"&&<ProfilePage profileData={profileData} setProfileData={setProfileData} setPage={setPage}/>}
      {page==="curriculum"&&<CurriculumPage profileData={profileData}/>}
      {page==="interview"&&<InterviewPage profileData={profileData}/>}
    </div>
  );
}
