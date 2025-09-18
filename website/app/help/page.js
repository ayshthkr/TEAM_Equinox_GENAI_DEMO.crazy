"use client";

import { useState } from "react";

const faqs = [
  {
    q: "What is NEWS.app?",
    a: "NEWS.app is a platform that curates top stories across politics, finance, and world events, while showing bias distribution across sources so you can form your own balanced perspective.",
  },
  {
    q: "How is bias measured?",
    a: "Bias scores are aggregated from multiple sources. Our Bias Bar shows left, center, and right coverage distribution for each story, so you know how different sides are reporting it.",
  },
  {
    q: "Do I need an account to use NEWS.app?",
    a: "You can browse articles without an account, but signing in lets you save stories, personalize your feed, and access the 'For You' section.",
  },
  {
    q: "Can I trust the news here?",
    a: "We don’t write the news ourselves. Instead, we aggregate from reliable outlets and show multiple viewpoints, helping you identify blindspots and biases.",
  },
  {
    q: "How often is the news updated?",
    a: "Articles are refreshed every few minutes to ensure you’re always seeing the latest headlines.",
  },
];

export default function HelpPage() {
  const [open, setOpen] = useState(null);

  const toggle = (i) => {
    setOpen(open === i ? null : i);
  };

  return (
    <div className=" mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-8">Help & FAQ</h1>
      <p className="text-zinc-400 mb-10">
        Welcome to the NEWS.app Help Center. Here are answers to some common
        questions. If you still need support, please reach out to our team.
      </p>

      <div className="space-y-4">
        {faqs.map((item, i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-[#1E2A38] to-[#0D1B2A] border border-zinc-700/60 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => toggle(i)}
              className="w-full text-left px-5 py-4 flex cursor-pointer justify-between items-center text-white font-medium hover:bg-zinc-800/40 transition"
            >
              <span>{item.q}</span>
              <span className="text-blue-400">
                {open === i ? "−" : "+"}
              </span>
            </button>

            {open === i && (
              <div className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 text-center text-zinc-500 text-sm">
        Still need help?{" "}
        <a
          href="mailto:support@newsapp.com"
          className="text-blue-400 hover:text-blue-300 underline"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
