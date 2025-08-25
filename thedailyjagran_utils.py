import urllib.request
from urllib.error import URLError, HTTPError
from bs4 import BeautifulSoup
from urllib.parse import urljoin

BASE_URL = "https://www.thedailyjagran.com/india"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/115.0 Safari/537.36"
    )
}


def get_cms_links_jagran(url: str = BASE_URL):
    """
    Collect all India article links from Daily Jagran.
    """
    cms_links = set()
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req) as response:
            if response.status == 200 and "text/html" in response.getheader("Content-Type", ""):
                html = response.read().decode("utf-8")
                soup = BeautifulSoup(html, "html.parser")

                for a in soup.find_all("a", href=True):
                    href = a["href"].strip()
                    full_url = urljoin(url, href)
                    if "thedailyjagran.com/india" in full_url:
                        cms_links.add(full_url)
            else:
                print("Not scrapable: content type is not HTML or bad status")
    except (HTTPError, URLError) as e:
        print(f"Error fetching {url}: {e}")

    return list(cms_links)


def contentofjagran(url: str):
    """
    Extract article text + images from a Daily Jagran article page.
    """
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req) as response:
            if response.status == 200 and "text/html" in response.getheader("Content-Type", ""):
                html = response.read().decode("utf-8")
                soup = BeautifulSoup(html, "html.parser")

                outer = soup.find("div", class_="container px-6 lg:px-0 pt-6 lg:pt-6 pb-6 lg:pb-10")
                if not outer:
                    return {"url": url, "text": None, "images": [], "error": "Outer container not found"}

                target = outer.find("div", class_="flex justify-between flex-wrap")
                if not target:
                    return {"url": url, "text": None, "images": [], "error": "Inner container not found"}

                # ---- Extract text ----
                full_text = target.get_text(separator="\n", strip=True)
                lines = full_text.split("\n")
                article_lines = []
                for line in lines:
                    if line.strip().lower().startswith("end of article"):
                        break
                    article_lines.append(line)
                article_text = "\n".join(article_lines)

                # ---- Extract images ----
                img_urls = []
                for img in target.find_all("img"):
                    if img.has_attr("src"):
                        img_urls.append(img["src"])
                    elif img.has_attr("data-src"):
                        img_urls.append(img["data-src"])

                return {"url": url, "text": article_text, "images": img_urls, "error": None}

            else:
                return {"url": url, "text": None, "images": [], "error": "Not scrapable"}
    except (HTTPError, URLError) as e:
        return {"url": url, "text": None, "images": [], "error": str(e)}


def scrape_jagran():
    """
    Scrape all Daily Jagran India articles and return structured results.
    """
    links = get_cms_links_jagran()
    print(f"Found {len(links)} Daily Jagran article links")
    results = []
    for link in links:
        print(f"Scraping: {link}")
        results.append(contentofjagran(link))
    print(results)    
    return results

scrape_jagran()
