// src/types/project.ts
export type ProjectStatus = '意見収集中' | '投票中' | '可決済';

export function canTransit(from: ProjectStatus, to: ProjectStatus) {
  if (from === '意見収集中' && to === '投票中') return true;
  if (from === '投票中'     && to === '可決済') return true;
  return false; // 逆戻りや飛び級は不可
}