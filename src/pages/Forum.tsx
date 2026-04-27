import { useEffect, useState } from "react";
import { z } from "zod";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  MessageSquare,
  PlusCircle,
  Send,
  Users,
  AlertTriangle,
  Loader2,
  Languages,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

type Language = "en" | "hi";

type ForumPost = {
  id: string;
  author_name: string;
  title: string;
  content: string;
  category: string;
  language: string;
  created_at: string;
};

type ForumComment = {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  created_at: string;
};

const translations = {
  en: {
    pageTitle: "Community Forum",
    pageSubtitle:
      "Share your experiences with cyber crimes & phishing attacks. Help others stay aware.",
    newPost: "New Post",
    newPostTitle: "Share an incident or warning",
    newPostDesc:
      "Tell the community what happened to you, a friend, or a family member. Your story can save someone else.",
    yourName: "Your name",
    title: "Title",
    titlePlaceholder: "e.g. Fake bank SMS asked for OTP",
    category: "Category",
    language: "Language",
    content: "Describe what happened",
    contentPlaceholder: "Share details — when, how, what they asked for, how you noticed...",
    submit: "Post to Forum",
    submitting: "Posting...",
    allPosts: "All Posts",
    english: "English",
    hindi: "Hindi (हिंदी)",
    noPosts: "No posts yet. Be the first to share an incident.",
    comments: "Comments",
    addComment: "Add a comment",
    commentPlaceholder: "Share your thoughts or similar experience...",
    sendComment: "Send",
    noComments: "No comments yet — start the discussion.",
    totalPosts: "Total Posts",
    activeMembers: "Contributors",
    discussions: "Discussions",
    by: "by",
    categories: {
      phishing: "Phishing",
      scam: "Online Scam",
      ransomware: "Ransomware",
      identity: "Identity Theft",
      upi: "UPI / Bank Fraud",
      social: "Social Engineering",
      general: "General",
    },
  },
  hi: {
    pageTitle: "कम्युनिटी फ़ोरम",
    pageSubtitle:
      "साइबर अपराध और फ़िशिंग के अनुभव साझा करें। दूसरों को जागरूक रखने में मदद करें।",
    newPost: "नई पोस्ट",
    newPostTitle: "कोई घटना या चेतावनी साझा करें",
    newPostDesc:
      "कम्युनिटी को बताएं कि आपके, किसी दोस्त या परिवार के साथ क्या हुआ। आपकी कहानी किसी और को बचा सकती है।",
    yourName: "आपका नाम",
    title: "शीर्षक",
    titlePlaceholder: "जैसे — नकली बैंक SMS ने OTP माँगा",
    category: "श्रेणी",
    language: "भाषा",
    content: "क्या हुआ बताएं",
    contentPlaceholder: "विवरण साझा करें — कब, कैसे, क्या माँगा गया, कैसे पकड़ा...",
    submit: "फ़ोरम पर पोस्ट करें",
    submitting: "पोस्ट हो रहा है...",
    allPosts: "सभी पोस्ट",
    english: "अंग्रेज़ी (English)",
    hindi: "हिंदी",
    noPosts: "अभी कोई पोस्ट नहीं। पहली घटना साझा करने वाले बनें।",
    comments: "टिप्पणियाँ",
    addComment: "टिप्पणी जोड़ें",
    commentPlaceholder: "अपने विचार या मिलता-जुलता अनुभव साझा करें...",
    sendComment: "भेजें",
    noComments: "अभी कोई टिप्पणी नहीं — चर्चा शुरू करें।",
    totalPosts: "कुल पोस्ट",
    activeMembers: "योगदानकर्ता",
    discussions: "चर्चाएँ",
    by: "द्वारा",
    categories: {
      phishing: "फ़िशिंग",
      scam: "ऑनलाइन धोखा",
      ransomware: "रैनसमवेयर",
      identity: "पहचान की चोरी",
      upi: "UPI / बैंक धोखा",
      social: "सोशल इंजीनियरिंग",
      general: "सामान्य",
    },
  },
};

const postSchema = z.object({
  author_name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(140),
  content: z.string().trim().min(20, "Please describe with at least 20 characters").max(4000),
  category: z.string().min(1).max(40),
  language: z.enum(["en", "hi"]),
});

const commentSchema = z.object({
  author_name: z.string().trim().min(2).max(60),
  content: z.string().trim().min(2).max(1000),
});

const categoryColors: Record<string, string> = {
  phishing: "bg-destructive/10 text-destructive border-destructive/30",
  scam: "bg-warning/10 text-warning border-warning/30",
  ransomware: "bg-destructive/10 text-destructive border-destructive/30",
  identity: "bg-primary/10 text-primary border-primary/30",
  upi: "bg-warning/10 text-warning border-warning/30",
  social: "bg-accent/10 text-accent border-accent/30",
  general: "bg-muted text-muted-foreground border-border",
};

const Forum = () => {
  const [lang, setLang] = useState<Language>("en");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [filter, setFilter] = useState<"all" | "en" | "hi">("all");

  const { profile, user } = useAuth();

  const [form, setForm] = useState({
    author_name: "",
    title: "",
    content: "",
    category: "phishing",
    language: "en" as Language,
  });

  const { toast } = useToast();
  const t = translations[lang];

  useEffect(() => {
    fetchPosts();
  }, []);

  // Auto-fill author name when user logs in
  useEffect(() => {
    if (profile?.display_name) {
      setForm((f) => ({ ...f, author_name: profile.display_name }));
    }
  }, [profile?.display_name]);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("forum_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error && data) setPosts(data);
    setLoading(false);
  };

  const handleSubmit = async () => {
    const parsed = postSchema.safeParse({ ...form, language: form.language });
    if (!parsed.success) {
      toast({
        title: "Invalid input",
        description: parsed.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("forum_posts").insert(parsed.data as any);
    setSubmitting(false);
    if (error) {
      toast({ title: "Could not post", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Posted!", description: "Your story is now visible to the community." });
    setForm({ author_name: "", title: "", content: "", category: "phishing", language: lang });
    setOpenDialog(false);
    fetchPosts();
  };

  const filteredPosts =
    filter === "all" ? posts : posts.filter((p) => p.language === filter);

  const uniqueAuthors = new Set(posts.map((p) => p.author_name.toLowerCase())).size;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <header className="border-b border-border bg-card/50">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-accent">
                <MessageSquare className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{t.pageTitle}</h1>
                <p className="text-muted-foreground mt-1 max-w-2xl">{t.pageSubtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={lang} onValueChange={(v) => setLang(v as Language)}>
                <SelectTrigger className="w-[160px]">
                  <Languages className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button variant="hero">
                    <PlusCircle className="w-4 h-4" />
                    {t.newPost}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t.newPostTitle}</DialogTitle>
                    <DialogDescription>{t.newPostDesc}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div>
                      <label className="text-sm font-medium mb-1 block">{t.yourName}</label>
                      <Input
                        value={form.author_name}
                        onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                        maxLength={60}
                        placeholder="Anonymous OK"
                        disabled={!!user}
                      />
                      {user && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Posting as <span className="font-semibold">{profile?.display_name}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">{t.title}</label>
                      <Input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        maxLength={140}
                        placeholder={t.titlePlaceholder}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium mb-1 block">{t.category}</label>
                        <Select
                          value={form.category}
                          onValueChange={(v) => setForm({ ...form, category: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(t.categories).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">{t.language}</label>
                        <Select
                          value={form.language}
                          onValueChange={(v) => setForm({ ...form, language: v as Language })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">{t.english}</SelectItem>
                            <SelectItem value="hi">{t.hindi}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">{t.content}</label>
                      <Textarea
                        value={form.content}
                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                        maxLength={4000}
                        rows={6}
                        placeholder={t.contentPlaceholder}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {form.content.length}/4000
                      </p>
                    </div>
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      variant="hero"
                      className="w-full"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t.submitting}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {t.submit}
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 max-w-2xl">
            <div className="p-3 rounded-lg bg-card border border-border flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-primary" />
              <div>
                <div className="text-xl font-bold">{posts.length}</div>
                <div className="text-xs text-muted-foreground">{t.totalPosts}</div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-card border border-border flex items-center gap-3">
              <Users className="w-5 h-5 text-accent" />
              <div>
                <div className="text-xl font-bold">{uniqueAuthors}</div>
                <div className="text-xs text-muted-foreground">{t.activeMembers}</div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-card border border-border flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <div>
                <div className="text-xl font-bold">
                  {posts.filter((p) => p.category !== "general").length}
                </div>
                <div className="text-xs text-muted-foreground">{t.discussions}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">{t.allPosts}</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="hi">हिंदी</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              {t.noPosts}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} t={t} lang={lang} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const PostCard = ({
  post,
  t,
  lang,
}: {
  post: ForumPost;
  t: typeof translations["en"];
  lang: Language;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentForm, setCommentForm] = useState({ author_name: "", content: "" });
  const [posting, setPosting] = useState(false);
  const { toast } = useToast();

  // Per-post display language (defaults to UI language). Translates content on demand.
  const [displayLang, setDisplayLang] = useState<Language>(lang);
  const [translations_, setTranslations_] = useState<
    Partial<Record<Language, { title: string; content: string }>>
  >({});
  const [translating, setTranslating] = useState(false);

  // Whenever the global UI language changes, follow it for this post too.
  useEffect(() => {
    setDisplayLang(lang);
  }, [lang]);

  // When displayLang differs from the original post language and we
  // haven't fetched a translation yet, fetch it.
  useEffect(() => {
    const needsTranslation =
      displayLang !== (post.language as Language) && !translations_[displayLang];
    if (!needsTranslation) return;

    let cancelled = false;
    const run = async () => {
      setTranslating(true);
      const { data, error } = await supabase.functions.invoke("translate-post", {
        body: {
          title: post.title,
          content: post.content,
          targetLanguage: displayLang,
        },
      });
      if (cancelled) return;
      setTranslating(false);
      if (error || data?.error) {
        toast({
          title: "Translation failed",
          description: data?.error ?? error?.message ?? "Try again later.",
          variant: "destructive",
        });
        // Fall back to original language so the user sees something
        setDisplayLang(post.language as Language);
        return;
      }
      setTranslations_((prev) => ({
        ...prev,
        [displayLang]: { title: data.title, content: data.content },
      }));
    };
    run();

    return () => {
      cancelled = true;
    };
  }, [displayLang, post, translations_, toast]);

  const loadComments = async () => {
    setLoadingComments(true);
    const { data } = await supabase
      .from("forum_comments")
      .select("*")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });
    if (data) setComments(data);
    setLoadingComments(false);
  };

  const handleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && comments.length === 0) loadComments();
  };

  const handleComment = async () => {
    const parsed = commentSchema.safeParse(commentForm);
    if (!parsed.success) {
      toast({
        title: "Invalid input",
        description: parsed.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }
    setPosting(true);
    const { error } = await supabase
      .from("forum_comments")
      .insert({ ...parsed.data, post_id: post.id } as any);
    setPosting(false);
    if (error) {
      toast({ title: "Could not comment", description: error.message, variant: "destructive" });
      return;
    }
    setCommentForm({ author_name: "", content: "" });
    loadComments();
  };

  const categoryLabel =
    t.categories[post.category as keyof typeof t.categories] ?? post.category;
  const timeAgo = new Date(post.created_at).toLocaleString(
    lang === "hi" ? "hi-IN" : "en-US",
    { dateStyle: "medium", timeStyle: "short" },
  );

  // Decide what title/content to render
  const isOriginal = displayLang === (post.language as Language);
  const displayed = isOriginal
    ? { title: post.title, content: post.content }
    : translations_[displayLang] ?? { title: post.title, content: post.content };

  return (
    <Card className="border-2 hover:border-primary/30 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg break-words">{displayed.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="font-medium">
                {t.by} {post.author_name}
              </span>
              <span className="text-muted-foreground">•</span>
              <Clock className="w-3 h-3" />
              {timeAgo}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={categoryColors[post.category] ?? categoryColors.general}
            >
              {categoryLabel}
            </Badge>
            <Badge variant="outline">
              {post.language === "hi" ? "हिंदी" : "EN"}
            </Badge>
            {/* Per-post translation toggle */}
            <div className="flex items-center gap-1 p-0.5 rounded-md bg-muted text-xs">
              <button
                type="button"
                onClick={() => setDisplayLang("en")}
                className={`px-2 py-1 rounded transition-colors ${
                  displayLang === "en"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                disabled={translating}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setDisplayLang("hi")}
                className={`px-2 py-1 rounded transition-colors ${
                  displayLang === "hi"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                disabled={translating}
              >
                हिं
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {translating ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {displayLang === "hi" ? "अनुवाद हो रहा है..." : "Translating..."}
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {displayed.content}
          </p>
        )}
        {!isOriginal && !translating && (
          <p className="mt-2 text-[11px] text-muted-foreground italic">
            {displayLang === "hi"
              ? "स्वचालित अनुवाद — मूल पोस्ट " + (post.language === "hi" ? "हिंदी" : "अंग्रेज़ी") + " में थी।"
              : "Auto-translated — original post was in " + (post.language === "hi" ? "Hindi" : "English") + "."}
          </p>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleExpand}
          className="mt-4 -ml-2"
        >
          <MessageSquare className="w-4 h-4" />
          {t.comments} {comments.length > 0 && `(${comments.length})`}
        </Button>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-border space-y-4">
            {loadingComments ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">{t.noComments}</p>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="p-3 rounded-md bg-muted/40 border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold">{c.author_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(c.created_at).toLocaleString(
                          lang === "hi" ? "hi-IN" : "en-US",
                          { dateStyle: "short", timeStyle: "short" },
                        )}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium">{t.addComment}</p>
              <Input
                placeholder={t.yourName}
                value={commentForm.author_name}
                onChange={(e) =>
                  setCommentForm({ ...commentForm, author_name: e.target.value })
                }
                maxLength={60}
              />
              <Textarea
                placeholder={t.commentPlaceholder}
                value={commentForm.content}
                onChange={(e) =>
                  setCommentForm({ ...commentForm, content: e.target.value })
                }
                maxLength={1000}
                rows={3}
              />
              <Button
                onClick={handleComment}
                disabled={posting}
                size="sm"
                variant="default"
              >
                {posting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {t.sendComment}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Forum;
