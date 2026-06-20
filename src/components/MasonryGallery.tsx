"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, MoreHorizontal, Bookmark } from "lucide-react";
import type { Category } from "@/components/Header";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export interface Photo {
  id: string;
  src: string;
  category: Exclude<Category, "all">;
  title: string;
  caption: string;
  width: number;
  height: number;
  aspect: number;
}

interface MasonryGalleryProps {
  photos: Photo[];
  filter: Category;
}

interface CommentType {
  user_email: string;
  content: string;
}

function mixPhotos(photos: Photo[]): Photo[] {
  const groups: Record<string, Photo[]> = {};
  photos.forEach((p) => {
    if (!groups[p.category]) groups[p.category] = [];
    groups[p.category].push(p);
  });
  const mixed: Photo[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const cat in groups) {
      if (groups[cat].length > 0) {
        mixed.push(groups[cat].shift()!);
        added = true;
      }
    }
  }
  return mixed;
}

function distributeColumns(photos: Photo[], columnCount: number): Photo[][] {
  const columns: Photo[][] = Array.from({ length: columnCount }, () => []);
  const heights = new Array(columnCount).fill(0);
  if (!photos) return columns;
  photos.forEach((photo) => {
    let target = 0;
    for (let i = 1; i < columnCount; i++) {
      if (heights[i] < heights[target]) target = i;
    }
    columns[target].push(photo);
    heights[target] += (1 / photo.aspect);
  });
  return columns;
}

export default function MasonryGallery({ photos, filter }: MasonryGalleryProps) {
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!photos) return [];
    if (filter === "all") return mixPhotos([...photos]);
    return photos.filter((p) => p.category === filter);
  }, [photos, filter]);

  const colsDesktop = useMemo(() => distributeColumns(filtered, 2), [filtered]);
  const colsMobile = useMemo(() => distributeColumns(filtered, 1), [filtered]);

  return (
    <section className="mx-auto w-full max-w-[840px] px-0 md:px-6 pb-32 pt-0 md:pt-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col gap-4 md:hidden">
            {colsMobile.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-4">
                {col.map((photo, pi) => (
                  <GalleryItem
                    key={photo.id}
                    photo={photo}
                    index={pi}
                    user={user}
                    onRequireAuth={() => setIsAuthOpen(true)}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="hidden md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {colsDesktop.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-10">
                {col.map((photo, pi) => (
                  <GalleryItem
                    key={photo.id}
                    photo={photo}
                    index={ci * 10 + pi}
                    user={user}
                    onRequireAuth={() => setIsAuthOpen(true)}
                  />
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </section>
  );
}

interface GalleryItemProps {
  photo: Photo;
  index: number;
  user: User | null;
  onRequireAuth: () => void;
}

function GalleryItem({ photo, index, user, onRequireAuth }: GalleryItemProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState("");

  const baseLikes = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < photo.id.length; i++) {
      hash = photo.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return 180 + (Math.abs(hash) % 750);
  }, [photo.id]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      const { data: likes } = await supabase
        .from("likes")
        .select("user_id")
        .eq("photo_id", photo.id);

      if (!mounted) return;

      if (likes) {
        setLikeCount(likes.length + baseLikes);
        if (user) setIsLiked(likes.some((l: { user_id: string }) => l.user_id === user.id));
      } else {
        setLikeCount(baseLikes);
      }

      if (user) {
        const { data: saves } = await supabase
          .from("saves")
          .select("id")
          .eq("photo_id", photo.id)
          .eq("user_id", user.id);
        if (mounted && saves && saves.length > 0) setIsSaved(true);
      }

      const { data: fetchedComments } = await supabase
        .from("comments")
        .select("user_email, content")
        .eq("photo_id", photo.id)
        .order("created_at", { ascending: true });

      if (mounted && fetchedComments) setComments(fetchedComments as CommentType[]);
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [photo.id, user, baseLikes]);

  const handleLike = async () => {
    if (!user) return onRequireAuth();

    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : prev - 1));

    if (nextLiked) {
      const { error } = await supabase.from("likes").insert({ user_id: user.id, photo_id: photo.id });
      if (error) {
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);
      }
    } else {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("photo_id", photo.id);
      if (error) {
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    }
  };

  const handleSave = async () => {
    if (!user) return onRequireAuth();

    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    if (nextSaved) {
      const { error } = await supabase.from("saves").insert({ user_id: user.id, photo_id: photo.id });
      if (error) setIsSaved(false);
    } else {
      const { error } = await supabase
        .from("saves")
        .delete()
        .eq("user_id", user.id)
        .eq("photo_id", photo.id);
      if (error) setIsSaved(true);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return onRequireAuth();
    const trimmed = newComment.trim();
    if (!trimmed) return;

    const commentData = {
      user_id: user.id,
      user_email: user.email || "guest",
      photo_id: photo.id,
      content: trimmed.slice(0, 500),
    };

    setComments((prev) => [...prev, { user_email: commentData.user_email, content: commentData.content }]);
    setNewComment("");

    const { error } = await supabase.from("comments").insert(commentData);
    if (error) {
      setComments((prev) => prev.filter((c) => c !== commentData));
    }
  };

  return (
    <motion.article
      ref={ref}
      className="flex flex-col bg-white w-full border-b border-[#362C28]/10 md:border md:border-[#362C28]/15 md:rounded-[8px] md:shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (index % 2) * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3.5 border-b border-[#362C28]/5 bg-white z-10">
        <div className="flex items-center gap-2 md:gap-2.5">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-[#8C6A53] to-[#D9CFC1] p-[1.5px] md:p-[2px] shrink-0">
            <div className="relative w-full h-full bg-white rounded-full overflow-hidden border border-white">
              <Image
                src="/gallery/user.png"
                alt="framedby.sara Profile"
                fill
                sizes="(max-width: 768px) 28px, 32px"
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-[11.5px] md:text-[13px] font-semibold text-[#362C28] leading-none mb-0.5 md:mb-1">
              framedby.sara
            </span>
            <span className="font-mono text-[8px] md:text-[9px] text-[#362C28]/60 uppercase tracking-widest leading-none">
              {photo.category.replace("-", " ")}
            </span>
          </div>
        </div>
        <MoreHorizontal
          className="w-4 h-4 md:w-5 md:h-5 text-[#362C28]/50 cursor-pointer hover:text-[#362C28] transition-colors"
          strokeWidth={1.5}
        />
      </div>

      <div
        className="group relative w-full bg-[#FCFAF8] overflow-hidden cursor-crosshair"
        style={{ aspectRatio: photo.aspect }}
      >
        <Image
          src={photo.src}
          alt={photo.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={index < 4}
          className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-[1.02]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#362C28]/90 via-[#362C28]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-between p-4 md:p-6 z-10 pointer-events-none">
          <div className="flex justify-between items-start w-full transform -translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
            <span className="font-mono text-[9px] md:text-[10px] text-[#FCFAF8] tracking-widest uppercase bg-[#8C6A53]/90 backdrop-blur-md px-2 py-1 rounded-[4px] shadow-sm">
              {`<${photo.category.replace("-", "")} />`}
            </span>
            <span className="font-mono text-[9px] md:text-[10px] text-[#FCFAF8] tracking-[0.2em] uppercase drop-shadow-md font-medium">
              F/2.8 · ISO100
            </span>
          </div>
          <div className="w-full transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
            <h3 className="font-serif text-lg md:text-xl text-[#FCFAF8] tracking-wide mb-1.5 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              {photo.title}
            </h3>
            <span className="font-mono text-[9px] md:text-[10px] text-[#FCFAF8]/90 tracking-[0.2em] uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
              Analyzing light geometry...
            </span>
          </div>
        </div>
      </div>

      <div className="px-3 md:px-4 py-2.5 md:py-4 flex flex-col bg-white">
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <div className="flex items-center gap-3">
            <button onClick={handleLike} className="focus:outline-none transition-transform active:scale-90">
              <Heart
                className={`w-[20px] h-[20px] md:w-[22px] md:h-[22px] transition-colors ${
                  isLiked ? "text-red-500 fill-red-500" : "text-[#362C28] hover:text-[#8C6A53]"
                }`}
                strokeWidth={1.5}
              />
            </button>
            <button
              onClick={() => {
                if (!user) onRequireAuth();
                else document.getElementById(`comment-${photo.id}`)?.focus();
              }}
              className="focus:outline-none transition-transform active:scale-90"
            >
              <MessageCircle className="w-[20px] h-[20px] md:w-[22px] md:h-[22px] text-[#362C28] hover:text-[#8C6A53] transition-colors" strokeWidth={1.5} />
            </button>
          </div>
          <button onClick={handleSave} className="focus:outline-none transition-transform active:scale-90">
            <Bookmark
              className={`w-[20px] h-[20px] md:w-[22px] md:h-[22px] transition-colors ${
                isSaved ? "text-[#362C28] fill-[#362C28]" : "text-[#362C28] hover:text-[#8C6A53]"
              }`}
              strokeWidth={1.5}
            />
          </button>
        </div>

        <div className="font-sans text-[11.5px] md:text-[13px] font-semibold text-[#362C28] mb-1">
          {likeCount.toLocaleString()} likes
        </div>

        <p className="font-sans text-[11.5px] md:text-[13px] text-[#362C28] leading-relaxed mb-1">
          <span className="font-semibold mr-1.5 cursor-pointer hover:text-[#8C6A53] transition-colors">
            framedby.sara
          </span>
          <span className="font-medium">{photo.title}</span>{" "}
          <span className="text-[#362C28]/70">— {photo.caption}</span>
        </p>

        {comments.map((comment, i) => (
          <p key={i} className="font-sans text-[11.5px] md:text-[13px] text-[#362C28] leading-relaxed mb-0.5">
            <span className="font-semibold mr-1.5">{comment.user_email?.split("@")[0] || "user"}</span>
            <span className="text-[#362C28]/70">{comment.content}</span>
          </p>
        ))}

        <form onSubmit={handleAddComment} className="mt-2 flex items-center border-t border-[#362C28]/10 pt-2 md:pt-3">
          <input
            id={`comment-${photo.id}`}
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onClick={() => {
              if (!user) onRequireAuth();
            }}
            maxLength={500}
            className="flex-1 text-[11.5px] md:text-[13px] bg-transparent outline-none placeholder-[#362C28]/50 text-[#362C28]"
            autoComplete="off"
          />
          {newComment.trim() && user && (
            <button
              type="submit"
              className="text-[11.5px] md:text-[13px] font-semibold text-[#8C6A53] ml-2 hover:text-[#362C28] transition-colors"
            >
              Post
            </button>
          )}
        </form>
      </div>
    </motion.article>
  );
}