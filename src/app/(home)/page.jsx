import HomePageClient from "./HomePageClient";

const SEO_TITLE =
  "Avenue Bookstore | New Releases, Book Deals & Bestsellers Online";

const SEO_DESCRIPTION =
  "Bringing the bookstore to your door we collate every new release, every book deal and every exciting launch from your favourite brick and mortar stores in one welcoming space – Avenue Bookstore. Explore our bookstore and discover new worlds, learn new skills, delve deep into the lives of popular figures and take a glimpse into ancient history. We have the latest bestsellers, chuckle inducing children's books, cultural classics, fantastical fiction and Nobel prize winning nonfiction for you.";

export const metadata = {
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  openGraph: {
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    type: "website",
    siteName: "Avenue Bookstore",
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
