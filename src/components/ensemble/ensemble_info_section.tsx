// src/components/ensemble/ensemble_info_section.tsx
"use client"

import { useState, useEffect, useMemo } from "react";
import type { Ensemble, Participant } from "@/types/ensemble_detail";
import BackToMainButton from "../common/BackToMainButton";

type Props = {
  ensemble: Ensemble;
  participants: Participant[];
};

type LocalComment = {
  id: string;
  content: string;
  created_at: string;
}

function format_time_range(start_time: string, end_time: string) {
  return `${start_time} ~ ${end_time}`;
}

function make_storage_key(ensemble_id: string) {
  return `bandmeet:ensemble:${ensemble_id}:comments`;
}

function load_comments(ensemble_id: string): LocalComment[] {
  try {
    const raw = localStorage.getItem(make_storage_key(ensemble_id));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save_comments(ensemble_id: string, comments: LocalComment[]) {
  try {
    localStorage.setItem(make_storage_key(ensemble_id), JSON.stringify(comments));
  } catch {
    // storage full / blocked 등은 무시
  }
}

function get_instrument_icon(instrument?: string) {
  switch (instrument) {
    case "Bass":
      return "🎸";
    case "Guitar":
      return "🎸";
    case "Drums":
      return "🥁";
    case "Keyboard":
      return "🎹";
    case "Vocal":
      return "🎤";
    default:
      return "🎵";
  }
}

export default function EnsembleInfoSection({ ensemble, participants }: Props) {
  const storage_key = useMemo(() => make_storage_key(ensemble.id), [ensemble.id]);

  // 최초 로드
  const [comments, set_comments] = useState<LocalComment[]>(() => {
    if (typeof window === "undefined") return [];
    return load_comments(ensemble.id);
  });
  
  const [comment_text, set_comment_text] = useState("");

  // 변경 시 저장 (옵션)
  useEffect(() => {
    if (typeof window === "undefined") return;
    save_comments(ensemble.id, comments);
  }, [ensemble.id, comments]);

    const on_add_comment = () => {
    const content = comment_text.trim();
    if (!content) return;

    const new_comment: LocalComment = {
      id: crypto.randomUUID(),
      content,
      created_at: new Date().toISOString(),
    };

    set_comments((prev) => [new_comment, ...prev]); // 최신이 위
    set_comment_text("");
  };

  const on_delete_comment = (id: string) => {
    set_comments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <section>
    <header className="mb-6">
    {/* 1행: 좌 로고 / 우 버튼 */}
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded bg-gray-300" />
        <span className="text-sm font-semibold">BandMeet</span>
        </div>

        <div className="flex items-center gap-2">
        <button className="rounded-full border px-3 py-1 text-xs">로그아웃</button>
        <div className="h-8 w-8 rounded-full bg-gray-300" />
        </div>
    </div>

    {/* 2행: (모바일) 캡슐 */}
    <div className="mt-3 md:hidden">
        <div className="mx-auto rounded-full border px-6 py-3 text-lg font-semibold truncate text-center">
        {ensemble.title}
        </div>
    </div>

    {/* (데스크탑) 캡슐: 1행 위에 겹쳐서 중앙 고정 */}
    <div className="relative hidden md:block">
        <div className="absolute left-1/2 top-[-38px] -translate-x-1/2">
        <div className="rounded-full border px-25 py-3 text-xl font-semibold truncate max-w-[60vw] text-center">
            {ensemble.title}
        </div>
        </div>
    </div>
    </header>
        <div className="text-xl font-semibold">합주 정보</div>
      <div className="mt-4 mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        {/* 날짜 */}
        <div className="rounded-xl border p-4">
          <div className="text-sm opacity-70">날짜</div>
          <div className="mt-1 text-base font-medium">{ensemble.date}</div>
        </div>

        {/* 시간 */}
        <div className="rounded-xl border p-4">
          <div className="text-sm opacity-70">시간</div>
          <div className="mt-1 text-base font-medium">
            {format_time_range(ensemble.start_time, ensemble.end_time)}
          </div>
        </div>

        {/* 장소 */}
        <div className="rounded-xl border p-4">
          <div className="text-sm opacity-70">장소</div>
          <div className="mt-1 text-base font-medium">
            {ensemble.location ?? "-"}
          </div>
        </div>
      </div>
      <div className="mt-6 mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* 참여자 */}
        <div className="rounded-xl border p-4 flex flex-col">
        <div className="text-sm opacity-70">참여자</div>

        <div className="mt-3 max-h-[384px] overflow-y-auto pr-1">
            {participants.length === 0 ? (
            <div className="text-sm opacity-70">참여자가 없습니다.</div>
            ) : (
            <ul className="space-y-3">
                {participants.map((p) => (
                <li
                    key={p.id}
                    className="flex items-center justify-between rounded-lg bg-gray-100 p-2"
                >
                    <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-200">
                        {get_instrument_icon(p.instrument)}
                    </div>
                    <span className="text-base font-medium">{p.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{p.instrument ?? "-"}</span>
                </li>
                ))}
            </ul>
            )}
        </div>
        </div>
        {/* 회고 = 댓글 UI */}
        <div className="rounded-xl border p-4 flex flex-col">
          <div className="text-sm opacity-70">회고</div>

          {/* 입력 */}
          <div className="mt-2 flex gap-2">
            <textarea
              className="w-full resize-none rounded-lg border p-3 text-sm"
              rows={3}
              placeholder="댓글을 입력하세요"
              value={comment_text}
              onChange={(e) => set_comment_text(e.target.value)}
            />
          </div>

          <div className="mt-2 flex justify-end">
            <button
              type="button"
              className="rounded-lg border px-3 py-1 text-sm"
              onClick={on_add_comment}
            >
              등록
            </button>
          </div>

          {/* 목록 */}
          <div className="mt-4 max-h-64 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <div className="text-sm opacity-70">아직 댓글이 없습니다.</div>
            ) : (
              <ul className="space-y-2">
                {comments.map((c) => (
                  <li key={c.id} className="rounded-lg border p-3">
                    <div className="text-sm">{c.content}</div>
                    <div className="mt-2 flex items-center justify-between text-xs opacity-70">
                      <span>{new Date(c.created_at).toLocaleString()}</span>
                      <button
                        type="button"
                        className="underline"
                        onClick={() => on_delete_comment(c.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-3 text-xs opacity-60">
            * 이 댓글은 현재 브라우저에만 저장됩니다.
          </div>
        </div>
      </div>
    </section>
  );
}