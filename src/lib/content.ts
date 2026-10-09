/** Editable wording for the Home and About pages. Anything left empty falls back to these defaults. */
export type Point = { title: string; text: string };
export const defaultContent = {
  home: {
    hero: {
      line1: "Your Vision.",
      line2: "Your Property.",
      tagline: "Our Expertise.",
      intro:
        "We help people buy and sell residential and commercial property. Tell us what you’re looking for and we’ll take it from there.",
      primaryButton: "Browse properties",
      secondaryButton: "Sell your property",
    },
    about: {
      label: "About Drishyam Realty",
      heading: "Helping people buy and sell property since 2019",
      paragraph1:
        "A home for your family, a space for your business, an investment for the future. Every property decision starts with a different goal.",
      paragraph2:
        "We bring care, clarity and local knowledge to each one, so you can move forward with confidence.",
      points: [
        { title: "Verified information", text: "Details you can rely on." },
        { title: "Honest guidance", text: "Straight answers, every time." },
        {
          title: "Local market knowledge",
          text: "Context that helps you decide.",
        },
        {
          title: "Support to the end",
          text: "We stay with you through every step.",
        },
      ] as Point[],
      button: "More about us",
    },
    featured: {
      heading: "Featured properties",
      subheading: "A few places we’re currently showing.",
    },
    routes: {
      buyingTitle: "Buying",
      buyingText:
        "Tell us the area, budget and type of property you have in mind. We’ll show you what fits and arrange visits.",
      buyingLink: "See properties for sale",
      sellingTitle: "Selling",
      sellingText:
        "Share the details of your property. We’ll list it accurately and put you in touch with interested buyers.",
      sellingLink: "Talk to us about selling",
    },
    process: {
      heading: "How it works",
      buyer: [
        {
          title: "Tell us what you want",
          text: "Your budget, preferred areas and the type of property.",
        },
        {
          title: "See what fits",
          text: "We share suitable properties and answer your questions.",
        },
        {
          title: "Visit in person",
          text: "We arrange viewings at times that suit you.",
        },
        {
          title: "Negotiate",
          text: "We help you work through price and terms.",
        },
        {
          title: "Complete the purchase",
          text: "We stay with you until the transaction is done.",
        },
      ] as Point[],
      seller: [
        {
          title: "Tell us about your property",
          text: "Location, size, condition and your expected price.",
        },
        {
          title: "We check the details",
          text: "So the listing is accurate from the start.",
        },
        {
          title: "We list it",
          text: "Your property is presented clearly, with good photos.",
        },
        {
          title: "We handle enquiries",
          text: "Interested buyers are put in touch with you.",
        },
        {
          title: "Complete the sale",
          text: "We guide you through to the end.",
        },
      ] as Point[],
    },
    testimonials: { heading: "What our clients say" },
    cta: {
      heading: "Looking to buy or sell? Tell us what you need.",
      text: "We’ll get back to you and help you take the next step.",
      primaryButton: "Browse properties",
      secondaryButton: "Get in touch",
    },
  },
  about: {
    hero: {
      title: "Property is personal. So is our approach.",
      description:
        "Since 2019, Drishyam Realty has brought care, clarity, and considered guidance to every property journey.",
    },
    story: {
      label: "Making your visualization real",
      heading: "Every great space begins with a vision.",
      paragraph1:
        "Finding a property is about more than square feet. It’s the home you imagine, the business you want to build, and the future you see for yourself.",
      paragraph2:
        "We’re a real estate brokerage and property consultancy helping buyers and sellers navigate residential, commercial, and investment opportunities. Our role is to listen carefully, bring relevant options into focus, and guide you through each stage with clear communication.",
      paragraph3:
        "From sharing requirements to completing a transaction, we aim to make every decision feel informed and every next step feel considered.",
    },
    values: {
      label: "The foundation of our work",
      heading: "Good advice. Better possibilities.",
      items: [
        {
          title: "Clarity before commitment",
          text: "We help you understand property information, ask the right questions, and make informed decisions.",
        },
        {
          title: "A conversation, always",
          text: "Open communication keeps your priorities, expectations and next steps in focus.",
        },
        {
          title: "Guidance with perspective",
          text: "We bring market understanding and personalized assistance to your unique requirements.",
        },
      ] as Point[],
    },
    services: {
      label: "How we can help",
      heading: "A partner for every property chapter.",
      items: [
        {
          title: "Residential properties",
          text: "Find a home that fits the way you live, or present your residential property to prospective buyers.",
        },
        {
          title: "Commercial spaces",
          text: "Explore spaces that support your business, from offices and showrooms to industrial opportunities.",
        },
        {
          title: "Investment guidance",
          text: "Discuss your priorities, explore relevant property opportunities, and understand the questions to consider.",
        },
      ] as Point[],
    },
    vision: {
      label: "Our architectural vision",
      heading: "A little perspective. A world of possibility.",
      text: "Explore an original architectural visualization. Move your pointer gently to see the composition from a new angle.",
    },
  },
};
export type SiteContent = typeof defaultContent;
const MAX = 1200;
/**
 * Lays saved wording over the defaults. The result always has exactly the default's shape:
 * unknown keys are dropped, list lengths stay fixed, and empty or oversized text falls back.
 */
export function mergeContent<T>(base: T, saved: unknown): T {
  if (Array.isArray(base))
    return base.map((item, i) =>
      mergeContent(item, Array.isArray(saved) ? saved[i] : undefined),
    ) as T;
  if (base && typeof base === "object") {
    const source =
      saved && typeof saved === "object"
        ? (saved as Record<string, unknown>)
        : {};
    return Object.fromEntries(
      Object.entries(base).map(([key, value]) => [
        key,
        mergeContent(value, source[key]),
      ]),
    ) as T;
  }
  if (typeof saved === "string") {
    const text = saved.trim();
    if (text && text.length <= MAX) return text as T;
  }
  return base;
}
