import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "@/lib/api";
import { useSEO } from "@/lib/seo";

export function Journal() {
  useSEO({ title: "The Journal", description: "Editorial notes from the Silkroute atelier — origin stories, harvests, recipes." });
  const [posts, setPosts] = useState([]);
  useEffect(() => { api.get("/blog").then((r) => setPosts(r.data || [])); }, []);

  return (
    <div data-testid="journal-page">
      <section className="py-16 border-b" style={{ borderColor: "hsl(var(--line))" }}>
        <div className="container-luxe">
          <div className="overline mb-3">Editorial</div>
          <h1 className="font-serif text-5xl md:text-7xl tracking-tighter leading-none">The Journal.</h1>
        </div>
      </section>
      <section className="section-pad container-luxe">
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-20">
          {posts.map((p, i) => (
            <Link key={p.id} to={`/journal/${p.slug}`} className={`group ${i === 0 ? "md:col-span-2 md:grid md:grid-cols-2 md:gap-12" : ""}`} data-testid={`blog-card-${p.slug}`}>
              <div className="img-zoom aspect-[4/3] mb-6">
                <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="overline">{new Date(p.published_at).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</div>
                <h3 className={`font-serif tracking-tighter mt-3 ${i === 0 ? "text-5xl" : "text-3xl"}`}>{p.title}</h3>
                <p className="mt-4 text-foreground/70 leading-relaxed">{p.excerpt}</p>
                <div className="mt-4 hover-underline inline-block text-[12px] tracking-[0.18em] uppercase">Read →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export function JournalDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  useEffect(() => { api.get(`/blog/${slug}`).then((r) => setPost(r.data)); }, [slug]);
  useSEO(post ? {
    title: post.title,
    description: post.excerpt,
    image: post.cover_image,
    type: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "image": [post.cover_image],
      "datePublished": post.published_at,
      "author": { "@type": "Organization", "name": post.author },
      "publisher": { "@type": "Organization", "name": "Silkroute Naturals" },
      "description": post.excerpt,
    },
  } : { title: "Journal" });
  if (!post) return <div className="container-luxe py-32">Loading...</div>;

  return (
    <article className="pb-32" data-testid="journal-detail-page">
      <div className="aspect-[16/8] overflow-hidden">
        <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
      </div>
      <div className="container-luxe max-w-3xl pt-16">
        <div className="overline">{new Date(post.published_at).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })} · {post.author}</div>
        <h1 className="font-serif text-5xl md:text-6xl tracking-tighter mt-4 leading-none">{post.title}</h1>
        <p className="font-serif text-2xl text-foreground/70 mt-8 italic">{post.excerpt}</p>
        <div className="mt-12 space-y-6 text-lg leading-loose text-foreground/85 whitespace-pre-line">{post.content}</div>
      </div>
    </article>
  );
}
