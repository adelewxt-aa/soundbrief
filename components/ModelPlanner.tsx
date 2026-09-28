"use client";
import { Check, Sparkles } from "lucide-react";
import type { CreativePlan } from "@/lib/creative-plan";
import { estimateMusic, recommendMusic, musicProviders, PRICE_CHECKED_AT, ESTIMATE_USD_CNY, SERVICE_RATE } from "@/lib/model-catalog";
import { directions } from "@/lib/creative-plan";

type Props = { plan: CreativePlan; onChange: (value: CreativePlan) => void; duration?: number; context?: string };
export function ModelPlanner({ plan, onChange, duration = 0, context = "" }: Props) {
  const seconds = Number.isFinite(duration) && duration > 0 ? duration : 30;
  const recommendation = recommendMusic(plan, context, seconds);
  const chosen = plan.provider === "auto" ? recommendation.model : musicProviders.find(p => p.id === plan.provider);
  const quote = chosen ? estimateMusic(chosen.id, seconds) : null;
  const count = plan.directions.length;
  const total = quote ? quote.totalCny * count : null;
  return <div className="model-planner matching-planner">
    <div className="matching-intro"><span className="matching-kicker">先匹配视频，再选模型</span><h2>让模型服务你的画面。</h2><p>结合你填写的用途、情绪、人声与节奏要求，挑一个值得先试的音乐模型。当前是规则建议，尚未分析视频或生成音乐。</p></div>
    <div className="matching-context"><span>{plan.purpose === "帮我判断" ? "用途待确认" : plan.purpose}</span><span>{plan.feeling}</span><span>{plan.vocals}</span><span>{duration > 0 ? `${seconds.toFixed(1)} 秒视频` : "按 30 秒示例估算"}</span></div>
    <h2>这次更在意什么？</h2>
    <div className="creative-segments">{["效果优先", "平衡一点", "预算优先"].map(item => <button key={item} aria-pressed={plan.preference === item} onClick={() => onChange({ ...plan, preference: item })}>{item}</button>)}</div>
    <p className="creative-caption">{plan.preference === "预算优先" ? "在能力满足需求的候选中，先比较本次生成费用。" : plan.preference === "效果优先" ? "先看表达方式与控制能力是否合适；实际音质与画面适配仍需试听评估。" : "先按内容要求选择能力，再比较费用。每个方向先准备一版。"}</p>
    <section className="matching-recommendation" aria-live="polite">
      <div className="matching-recommendation-top"><Sparkles size={20}/><span>建议先试 · {recommendation.model.name}</span><small>规则建议</small></div>
      <p>{recommendation.reason}</p>
      <button className="matching-auto" aria-pressed={plan.provider === "auto"} onClick={() => onChange({ ...plan, provider: "auto" })}>{plan.provider === "auto" ? <Check size={17}/> : <Sparkles size={17}/>}随需求自动更新候选</button>
      <small>依据：你的文字要求与已公布能力。不是模型实测排名，也不是对视频的自动分析结果。</small>
    </section>
    <div className="model-heading"><h2>也可以自己挑</h2><span>选择仅保存计划 · 不扣费</span></div>
    <div className="matching-model-grid">{musicProviders.map(model => {
      const price = estimateMusic(model.id, seconds);
      const selected = chosen?.id === model.id;
      return <article key={model.id} className={`matching-model-card ${selected ? "selected" : ""}`}>
        <button className="matching-model-select" aria-pressed={plan.provider === model.id} onClick={() => onChange({ ...plan, provider: model.id })} aria-label={`选择 ${model.name} 作为计划模型`}>
          <div><span className="matching-maker">{model.maker}</span><span className={`matching-status ${model.billing === "unavailable" ? "restricted" : ""}`}>{model.status}</span></div>
          <div><h3>{model.name}</h3>{selected && <Check size={19}/>}</div>
          <p>{model.note}</p>
          <div className="matching-price"><span>单版平台预估</span><strong>{price ? `¥${price.totalCny.toFixed(2)}` : "待确认渠道"}</strong></div>
          <small>{price ? `约 ${seconds.toFixed(1)} 秒 · 一次生成 · 含拟定服务费` : "不参与自动推荐，可记录接入意向"}</small>
        </button>
        <div className="matching-model-reference"><span>官方参考：{model.official}</span><a href={model.source} target="_blank" rel="noopener noreferrer">查看官方价格 ↗</a><p>{model.caveat}</p></div>
      </article>;
    })}</div>
    <details className="model-details"><summary>预估费用怎么算？</summary>
      <p>价格核对：{PRICE_CHECKED_AT}。估算公式：官方生成成本 × 人民币预算汇率 {ESTIMATE_USD_CNY} ×（1 + {SERVICE_RATE * 100}% 拟定服务费），单版向上取整到分。汇率是预算假设，不是实时汇率。</p>
      <p>Eleven Music 按公布的分钟单价与片段秒数折算；Stable Audio 按每次生成计费。每个方向按一次生成计算，再生成会增加费用。这里只估音乐生成，不含视频理解、订阅摊销、税费、存储或中转加价。</p>
      <p>当前不调用、不扣费。正式接入后需确认账户报价、计费粒度与授权，并在生成前展示可确认的总价。商业发布需单独核对适用授权，价格不代表授权承诺。</p>
    </details>
    <div className="model-heading"><h2>选几个配乐方向</h2><span>已选 {count} 个方向</span></div>
    <div className="direction-picks">{directions.map(item => <button key={item.id} aria-pressed={plan.directions.includes(item.id)} className={plan.directions.includes(item.id) ? "selected" : ""} onClick={() => onChange({ ...plan, directions: plan.directions.includes(item.id) ? plan.directions.filter(id => id !== item.id) : [...plan.directions, item.id] })}><span>{item.label}</span><div><strong>{item.name}</strong><small>{item.badge}</small></div>{plan.directions.includes(item.id) && <Check size={18}/>}</button>)}</div>
    <div className="cost-summary" aria-live="polite"><div><strong>{count ? `${chosen?.name || "待选模型"} · ${count} 个版本` : "先选至少一个方向"}</strong><span>{!count ? "尚未选择版本" : total !== null ? `音乐生成预估合计：¥${total.toFixed(2)}` : "费用待接入渠道确认"}</span></div><p>这里只保存配乐计划，不会生成音乐或产生费用。可在下一步导入已有音乐，跟随视频试听。</p></div>
    <details className="model-details matching-roadmap"><summary>后续会怎样理解视频、生成配乐？</summary>
      <ol><li><strong>理解画面：</strong>规划提取带时间戳的关键帧，使用 DeepSeek 的图像理解能力结合文字要求整理场景和配乐重点。关键帧不等于完整视频理解，口播与声音还需单独转写和验证。<a href="https://api-docs.deepseek.com/guides/responses_api/" target="_blank" rel="noopener noreferrer">官方能力说明 ↗</a></li>
      <li><strong>匹配音乐：</strong>规划接入 Eleven Music、Stable Audio 等音乐 API；MiniMax 先确认可用渠道。按时长、情绪、人声、使用范围和预算筛选，再用实测结果改进推荐。</li>
      <li><strong>扩展视频创作：</strong>Seedance 属于视频生成候选，用于后续素材或音画创作，不作为当前纯音乐模型，也不计入配乐报价。<a href="https://docs.volcengine.com/docs/ark/seedance-1-5-pro?lang=zh" target="_blank" rel="noopener noreferrer">官方能力说明 ↗</a></li></ol>
      <p>以上均为接入规划；当前视频仅在浏览器预览，不发送给上述服务。</p>
    </details>
  </div>;
}

