import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 60;

type GithubRepo = { full_name:string; html_url:string; description:string|null; stargazers_count:number; topics?:string[]; language?:string|null; updated_at:string };

export async function GET(request:NextRequest) {
  const secret=process.env.CRON_SECRET;
  if(!secret || request.headers.get('authorization')!==`Bearer ${secret}`) return NextResponse.json({error:'Unauthorized'},{status:401});
  const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!serviceKey) return NextResponse.json({error:'Supabase server credentials are missing.'},{status:503});
  const supabase=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const weekStart=new Date();
  weekStart.setUTCHours(0,0,0,0);
  const day=(weekStart.getUTCDay()+6)%7;
  weekStart.setUTCDate(weekStart.getUTCDate()-day);
  const week=weekStart.toISOString().slice(0,10);
  const searches=[
    {q:'topic:model-context-protocol',kind:'Serveur MCP',category:'Écosystème MCP'},
    {q:'"claude skills" OR "agent skills"',kind:'Skill Claude',category:'Claude Skills'},
    {q:'topic:ai-agents',kind:'Agent IA',category:'Agents IA'},
    {q:'topic:automation-workflow',kind:'Workflow',category:'Automatisation'}
  ];
  const headers:Record<string,string>={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
  if(process.env.GITHUB_TOKEN)headers.Authorization=`Bearer ${process.env.GITHUB_TOKEN}`;
  const candidates:Record<string,any>={};
  for(const search of searches){
    const response=await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(search.q+' fork:false archived:false')}&sort=updated&order=desc&per_page=12`,{headers,cache:'no-store'});
    if(!response.ok) continue;
    const payload=await response.json() as {items?:GithubRepo[]};
    for(const repo of payload.items||[]){
      if(!repo.html_url||!repo.full_name)continue;
      candidates[repo.html_url]={title:repo.full_name,url:repo.html_url,kind:search.kind,category:search.category,description:(repo.description||'Dépôt open source à évaluer pour le catalogue Le Shift.').slice(0,1200),source:'GitHub weekly discovery',relevance_score:Math.max(1,Math.min(5,Math.ceil(Math.log10(repo.stargazers_count+1)))),week_start:week,status:'suggested'};
    }
  }
  const suggestions=Object.values(candidates);
  if(!suggestions.length)return NextResponse.json({ok:true,week,inserted:0,note:'GitHub returned no new candidates.'});
  const {error}=await supabase.from('weekly_resource_suggestions').upsert(suggestions,{onConflict:'url,week_start',ignoreDuplicates:true});
  if(error)return NextResponse.json({error:'Could not save weekly suggestions.'},{status:500});
  return NextResponse.json({ok:true,week,candidates:suggestions.length});
}
