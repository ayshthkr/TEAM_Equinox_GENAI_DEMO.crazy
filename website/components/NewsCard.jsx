import Link from "next/link";
import BiasBar from "./BiasBar";

export default function NewsCard({ news }) {
  const linkHref = news.id ? `/articles/${news.id}` : news.url || "#";

  return (
    <Link
      prefetch={false}
      href={linkHref}
      target={news.id ? "_self" : "_blank"}
      rel={news.id ? undefined : "noreferrer"}
      className="group"
    >
      <article className="bg-surface border border-border rounded-lg overflow-hidden hover:border-accent transition flex flex-col h-full cursor-pointer">
        {/* Image */}
        {news.image && (
          <img
            src={news.image}
            alt={news.title}
            className="w-full h-40 object-cover"
          />
        )}

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Headline */}
          <h3 className="font-semibold leading-snug text-text-primary line-clamp-2 min-h-[3rem] group-hover:text-accent transition">
            {news.title}
          </h3>

          {/* Sources */}
          <p className="text-xs text-text-secondary mt-1">
            {news.sources} sources
          </p>

          {/* Bias Bar */}
          <BiasBar
            bias={
              news.bias || {
                left: 33,
                center: 34,
                right: 33,
              }
            }
          />

          {/* Read more (optional, still shown but redundant) */}
          <span className="inline-block mt-auto text-sm text-accent hover:text-accent-hover hover:underline">
            Read more →
          </span>
        </div>
      </article>
    </Link>
  );
}
